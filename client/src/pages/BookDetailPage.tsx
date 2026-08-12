import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star,
  BookOpen,
  ShoppingCart,
  ShieldCheck,
  Download,
  Calendar,
  FileText,
  Globe,
  Tag,
  Sparkles,
} from 'lucide-react';
import { booksApi, cartApi, paymentsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import type { Book } from '../types';
import './BookDetailPage.css';

export function BookDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'sample' | 'specs'>('overview');
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    booksApi
      .getBySlug(slug)
      .then((res) => {
        const current = res.data.data.book;
        setBook(current);
        // Fetch related books
        booksApi.list({ limit: 4 }).then((r) => {
          setRelatedBooks(
            (r.data.data.books || []).filter((b: Book) => b.id !== current.id)
          );
        });
      })
      .catch(() => setBook(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const formatPrice = (price: number, currency = 'NGN') =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency, minimumFractionDigits: 0 }).format(price);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!book) return;
    setActionLoading(true);
    try {
      await cartApi.add(book.id);
      toast.success('Added to Cart', `"${book.title}" has been added to your shopping cart.`);
    } catch (err: any) {
      toast.error('Cart Error', err.response?.data?.message || 'Could not add volume to cart.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!book) return;
    setActionLoading(true);
    try {
      const res = await paymentsApi.initialize([book.id]);
      const { authorizationUrl } = res.data.data;
      window.location.href = authorizationUrl;
    } catch (err: any) {
      toast.error('Checkout Error', err.response?.data?.message || 'Payment initialization failed');
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="book-detail-page container">
        <div className="glass-loading-box">
          <div className="glass-spinner" />
          <p>Loading book details...</p>
        </div>
      </main>
    );
  }

  if (!book) {
    return (
      <main className="book-detail-page container">
        <div className="glass-empty-box">
          <h2>Volume Not Found</h2>
          <p>The requested book could not be found in our catalog.</p>
          <Link to="/books">
            <Button variant="primary">Browse All Books</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="book-detail-page">
      {/* Background Orbs */}
      <div className="detail-orb orb-1" />
      <div className="detail-orb orb-2" />

      <div className="container">
        {/* Glass Hero Section */}
        <motion.div
          className="glass-detail-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Cover Stage */}
          <div className="detail-cover-stage">
            <div className="glass-cover-frame">
              {book.coverImage ? (
                <img src={book.coverImage} alt={book.title} />
              ) : (
                <div className="detail-cover-placeholder">
                  <span>{book.title.charAt(0)}</span>
                </div>
              )}
              <div className="cover-glass-shine" />
            </div>
            <div className="cover-shadow-blur" />
          </div>

          {/* Details Column */}
          <div className="detail-hero-content">
            {book.categories?.[0] && (
              <span className="glass-category-tag">
                <Tag size={13} /> {book.categories[0].name}
              </span>
            )}
            <h1 className="detail-title">{book.title}</h1>
            <p className="detail-author">by <span>{book.author}</span></p>

            <div className="detail-rating-row">
              {book.averageRating !== undefined && book.averageRating > 0 && (
                <div className="rating-pill">
                  <Star size={15} fill="currentColor" className="star" />
                  <span className="val">{book.averageRating.toFixed(1)}</span>
                  {book.reviewCount ? <span className="sub">({book.reviewCount} reviews)</span> : null}
                </div>
              )}
              <span className="format-badge">{book.format || 'Digital eBook'}</span>
            </div>

            <div className="detail-price-box">
              <span className="detail-price">{formatPrice(book.price, book.currency)}</span>
              <span className="price-sub">Instant Digital Download (EPUB & PDF)</span>
            </div>

            <p className="detail-synopsis-preview">
              {book.shortDescription || book.description?.slice(0, 220)}...
            </p>

            {/* Quick Feature Badges */}
            <div className="glass-feature-pills">
              <div className="feature-pill">
                <ShieldCheck size={16} /> Lifetime Access
              </div>
              <div className="feature-pill">
                <BookOpen size={16} /> Read on Any Device
              </div>
              <div className="feature-pill">
                <Download size={16} /> DRM-Free Download
              </div>
            </div>

            {/* Action Buttons */}
            <div className="detail-actions">
              {book.owned ? (
                <Link to={`/reader/${book.id}`} className="glass-main-btn accent">
                  <BookOpen size={18} /> You Own This — Read Now
                </Link>
              ) : (
                <>
                  <button
                    className="glass-main-btn primary"
                    onClick={handleBuyNow}
                    disabled={actionLoading}
                  >
                    <Sparkles size={18} /> Buy Now with Paystack
                  </button>
                  <button
                    className="glass-main-btn secondary"
                    onClick={handleAddToCart}
                    disabled={actionLoading}
                  >
                    <ShoppingCart size={18} /> Add to Cart
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabbed Content Navigation */}
        <div className="glass-tabs-container">
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview & Synopsis
            </button>
            <button
              className={`tab-btn ${activeTab === 'sample' ? 'active' : ''}`}
              onClick={() => setActiveTab('sample')}
            >
              Sample Chapter Preview
            </button>
            <button
              className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              Specifications & Formats
            </button>
          </div>

          <div className="tab-body">
            {activeTab === 'overview' && (
              <div className="tab-pane">
                <h2>About this volume</h2>
                <p>{book.description}</p>
              </div>
            )}

            {activeTab === 'sample' && (
              <div className="tab-pane sample-pane">
                <h2>Sample Excerpt</h2>
                <blockquote>
                  “Creation is not born from speed; it is forged in deliberate stillness.”
                </blockquote>
                <p>
                  Every craftsman understands the threshold where distraction fades and pure focus takes over. When you dedicate your attention to a single volume, you unlock a depth of thought that short-form media can never replicate.
                </p>
                <div className="sample-cta-banner">
                  <p>Enjoying the excerpt? Get full lifetime access instantly.</p>
                  <button className="sample-buy-btn" onClick={handleBuyNow}>
                    Unlock Full Volume
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="tab-pane specs-pane">
                <h2>Book Specifications</h2>
                <div className="specs-grid">
                  <div className="spec-card">
                    <Calendar size={18} />
                    <div>
                      <strong>Publication Date</strong>
                      <span>
                        {book.publicationDate
                          ? new Date(book.publicationDate).toLocaleDateString('en-GB', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'Recent Release'}
                      </span>
                    </div>
                  </div>
                  <div className="spec-card">
                    <FileText size={18} />
                    <div>
                      <strong>Page Count</strong>
                      <span>{book.pageCount || 240} Pages</span>
                    </div>
                  </div>
                  <div className="spec-card">
                    <Globe size={18} />
                    <div>
                      <strong>Language</strong>
                      <span>{book.language || 'English'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Books Section */}
        {relatedBooks.length > 0 && (
          <section className="related-books-section">
            <h2>You May Also Like</h2>
            <div className="related-grid">
              {relatedBooks.map((rel) => (
                <Link key={rel.id} to={`/books/${rel.slug}`} className="related-card">
                  <div className="rel-cover">
                    {rel.coverImage ? (
                      <img src={rel.coverImage} alt={rel.title} />
                    ) : (
                      <div className="rel-placeholder">{rel.title.charAt(0)}</div>
                    )}
                  </div>
                  <div className="rel-info">
                    <h3>{rel.title}</h3>
                    <p>{rel.author}</p>
                    <span className="rel-price">{formatPrice(rel.price, rel.currency)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
