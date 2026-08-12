import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, ArrowLeft, ShieldCheck, Sparkles, Tag, BookOpen } from 'lucide-react';
import { cartApi, paymentsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import type { Cart } from '../types';
import './CartPage.css';

export function CartPage() {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    cartApi
      .get()
      .then((res) => setCart(res.data.data))
      .catch(() => setCart(null))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);

  const removeItem = async (bookId: string, title: string) => {
    try {
      const res = await cartApi.remove(bookId);
      setCart(res.data.data);
      toast.info('Item Removed', `"${title}" was removed from your cart.`);
    } catch (err) {
      toast.error('Error', 'Failed to remove volume from cart.');
    }
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'READ20') {
      setPromoDiscount(0.2);
      toast.success('Promo Code Applied', '20% discount has been applied to your subtotal!');
    } else {
      toast.error('Invalid Code', 'Try promo code "READ20" for 20% off!');
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.itemCount === 0) return;
    setCheckoutLoading(true);
    try {
      const bookIds = cart.items.filter((i) => !i.alreadyOwned).map((i) => i.bookId);
      const res = await paymentsApi.initialize(bookIds);
      window.location.href = res.data.data.authorizationUrl;
    } catch (err: any) {
      toast.error('Checkout Failed', err.response?.data?.message || 'Payment initialization failed.');
      setCheckoutLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="cart-page">
        <div className="container">
          <div className="glass-cart-empty">
            <ShoppingCart size={48} />
            <h2>Your Shopping Cart</h2>
            <p>Please log in to your account to view your saved books.</p>
            <Link to="/login">
              <Button variant="primary">Log In Now</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="cart-page">
        <div className="container">
          <div className="glass-loading-box">
            <div className="glass-spinner" />
            <p>Retrieving your shopping cart...</p>
          </div>
        </div>
      </main>
    );
  }

  const items = cart?.items || [];
  const purchasable = items.filter((i) => !i.alreadyOwned);
  const rawSubtotal = cart?.subtotal || 0;
  const discountAmount = rawSubtotal * promoDiscount;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  return (
    <main className="cart-page">
      <div className="container">
        <header className="cart-header">
          <Link to="/books" className="back-link">
            <ArrowLeft size={16} /> Continue Browsing
          </Link>
          <h1 className="cart-title">
            Shopping Cart ({purchasable.length} {purchasable.length === 1 ? 'Volume' : 'Volumes'})
          </h1>
        </header>

        {items.length === 0 ? (
          <div className="glass-cart-empty">
            <BookOpen size={48} />
            <h2>Your Cart is Empty</h2>
            <p>Explore our publication gallery to add books to your personal collection.</p>
            <Link to="/books">
              <Button variant="primary">Explore Book Gallery</Button>
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Items List */}
            <div className="cart-items-section">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    className="glass-cart-item"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="cart-item-cover">
                      {item.book.coverImage ? (
                        <img src={item.book.coverImage} alt={item.book.title} />
                      ) : (
                        <div className="cover-placeholder">{item.book.title.charAt(0)}</div>
                      )}
                    </div>

                    <div className="cart-item-details">
                      <h3>{item.book.title}</h3>
                      <p className="cart-item-author">by {item.book.author}</p>
                      {item.alreadyOwned ? (
                        <span className="owned-badge">You already own this volume</span>
                      ) : (
                        <span className="format-tag">{item.book.format || 'Digital eBook'}</span>
                      )}
                    </div>

                    <div className="cart-item-price-side">
                      <span className="cart-item-price">{formatPrice(item.book.price)}</span>
                      <button
                        onClick={() => removeItem(item.bookId, item.book.title)}
                        className="glass-remove-btn"
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary Sidebar */}
            <aside className="glass-summary-card">
              <h2>Order Summary</h2>

              <div className="summary-rows">
                <div className="summary-row">
                  <span>Subtotal ({purchasable.length} items)</span>
                  <span className="val">{formatPrice(rawSubtotal)}</span>
                </div>

                {promoDiscount > 0 && (
                  <div className="summary-row discount">
                    <span>Promo Discount (20%)</span>
                    <span className="val">-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="summary-row total">
                  <span>Total Amount</span>
                  <span className="val">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Promo Code Form */}
              <form className="promo-form" onSubmit={handleApplyPromo}>
                <div className="promo-input-group">
                  <Tag size={15} className="promo-icon" />
                  <input
                    type="text"
                    placeholder="Promo code (e.g. READ20)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button type="submit" className="apply-btn">
                    Apply
                  </button>
                </div>
              </form>

              {/* Paystack Checkout CTA */}
              <Button
                variant="primary"
                size="lg"
                style={{ width: '100%', marginTop: '1.25rem' }}
                onClick={handleCheckout}
                loading={checkoutLoading}
                disabled={purchasable.length === 0}
              >
                <Sparkles size={18} /> Checkout with Paystack
              </Button>

              <div className="security-note">
                <ShieldCheck size={16} />
                <span>Secured 256-bit encrypted checkout via Paystack. Instant eBook delivery.</span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
