import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { booksApi, cartApi, paymentsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import type { Book } from '../types';
import './BookDetailPage.css';

export function BookDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    booksApi
      .getBySlug(slug)
      .then((res) => setBook(res.data.data.book))
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
    setMessage('');
    try {
      await cartApi.add(book.id);
      setMessage('Added to cart');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Could not add to cart');
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
    setMessage('');
    try {
      const res = await paymentsApi.initialize([book.id]);
      const { authorizationUrl } = res.data.data;
      window.location.href = authorizationUrl;
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Payment initialization failed');
      setActionLoading(false);
    }
  };

  if (loading) return <main className="container" style={{ padding: '3rem 0' }}><p>Loading…</p></main>;
  if (!book) return <main className="container" style={{ padding: '3rem 0' }}><p>Book not found.</p></main>;

  return (
    <main className="book-detail">
      <div className="container">
        <div className="book-detail-grid">
          <div className="book-detail-cover">
            {book.coverImage ? (
              <img src={book.coverImage} alt={`Cover of ${book.title}`} />
            ) : (
              <div className="cover-placeholder">{book.title.charAt(0)}</div>
            )}
          </div>
          <div className="book-detail-info">
            {book.categories?.[0] && (
              <span className="category-tag">{book.categories[0].name}</span>
            )}
            <h1>{book.title}</h1>
            <p className="author">by {book.author}</p>
            {book.averageRating !== undefined && book.averageRating > 0 && (
              <p className="rating">★ {book.averageRating.toFixed(1)} · {book.reviewCount} reviews</p>
            )}
            <p className="price">{formatPrice(book.price, book.currency)}</p>
            <p className="short-desc">{book.shortDescription || book.description?.slice(0, 180)}</p>

            <div className="book-meta">
              {book.format && <span>{book.format}</span>}
              {book.pageCount && <span>{book.pageCount} pages</span>}
              {book.language && <span>{book.language}</span>}
            </div>

            {message && <p className="action-message">{message}</p>}

            <div className="book-actions">
              {book.owned ? (
                <Link to="/dashboard/library">
                  <Button variant="accent" size="lg">You own this — Read now</Button>
                </Link>
              ) : (
                <>
                  <Button variant="primary" size="lg" onClick={handleBuyNow} loading={actionLoading}>
                    Buy Now
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleAddToCart} loading={actionLoading}>
                    Add to Cart
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <section className="book-description">
          <h2>About this book</h2>
          <p>{book.description}</p>
        </section>
      </div>
    </main>
  );
}
