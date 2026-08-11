import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cartApi, paymentsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import type { Cart } from '../types';
import './CartPage.css';

export function CartPage() {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

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

  const removeItem = async (bookId: string) => {
    const res = await cartApi.remove(bookId);
    setCart(res.data.data);
  };

  const handleCheckout = async () => {
    if (!cart || cart.itemCount === 0) return;
    setCheckoutLoading(true);
    try {
      const bookIds = cart.items.filter((i) => !i.alreadyOwned).map((i) => i.bookId);
      const res = await paymentsApi.initialize(bookIds);
      window.location.href = res.data.data.authorizationUrl;
    } catch (err: any) {
      alert(err.response?.data?.message || 'Checkout failed');
      setCheckoutLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="cart-page container">
        <h1>Your cart</h1>
        <p>Please <Link to="/login">log in</Link> to view your cart.</p>
      </main>
    );
  }

  if (loading) return <main className="cart-page container"><p>Loading…</p></main>;

  const items = cart?.items || [];
  const purchasable = items.filter((i) => !i.alreadyOwned);

  return (
    <main className="cart-page">
      <div className="container">
        <h1>Your cart</h1>
        {items.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty.</p>
            <Link to="/books"><Button variant="primary">Continue shopping</Button></Link>
          </div>
        ) : (
          <div className="cart-layout">
            <ul className="cart-items">
              {items.map((item) => (
                <li key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <h3>{item.book.title}</h3>
                    <p>{item.book.author}</p>
                    {item.alreadyOwned && <span className="owned-badge">Already owned</span>}
                  </div>
                  <div className="cart-item-actions">
                    <span className="price">{formatPrice(item.book.price)}</span>
                    <button onClick={() => removeItem(item.bookId)} className="remove-btn">Remove</button>
                  </div>
                </li>
              ))}
            </ul>
            <aside className="cart-summary">
              <h2>Summary</h2>
              <div className="summary-row">
                <span>Subtotal ({purchasable.length} items)</span>
                <span>{formatPrice(cart?.subtotal || 0)}</span>
              </div>
              <Button
                variant="primary"
                size="lg"
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={handleCheckout}
                loading={checkoutLoading}
                disabled={purchasable.length === 0}
              >
                Checkout with Paystack
              </Button>
              <Link to="/books" className="continue-link">Continue shopping</Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
