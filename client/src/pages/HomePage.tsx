import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { booksApi } from '../services/api';
import { BookCard } from '../components/books/BookCard';
import { Button } from '../components/ui/Button';
import type { Book } from '../types';
import './HomePage.css';

export function HomePage() {
  const [featured, setFeatured] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    booksApi
      .list({ featured: 'true', limit: 4 })
      .then((res) => setFeatured(res.data.data.books || []))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="container hero-inner">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="hero-eyebrow">Author & Digital Publisher</p>
            <h1 className="hero-title">
              Stories Worth Reading.<br />
              Books Worth Keeping.
            </h1>
            <p className="hero-subtitle">
              Thoughtful books on focus, craft, and the quiet revolutions that shape how we live and build.
            </p>
            <div className="hero-actions">
              <Link to="/books">
                <Button variant="primary" size="lg">Explore Books</Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg">Meet the Author</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Books</h2>
            <Link to="/books" className="section-link">View all →</Link>
          </div>
          {loading ? (
            <p className="muted">Loading books…</p>
          ) : featured.length === 0 ? (
            <p className="muted">No featured books yet.</p>
          ) : (
            <div className="book-grid">
              {featured.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section section-alt">
        <div className="container about-preview">
          <div>
            <h2>About the Author</h2>
            <p>
              Chidi Okonkwo writes about attention, software craftsmanship, and the stories that live between cities and identities. His work has been read by engineers, designers, and readers across Africa and beyond.
            </p>
            <Link to="/about">
              <Button variant="outline">Read the full story</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="section cta-section">
        <div className="container cta-inner">
          <h2>Start reading today</h2>
          <p>Own digital books you can return to, again and again.</p>
          <Link to="/books">
            <Button variant="accent" size="lg">Browse the collection</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
