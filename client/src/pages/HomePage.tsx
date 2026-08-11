import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { booksApi, cartApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GlassGalleryShowcase } from '../components/gallery/GlassGalleryShowcase';
import { Button } from '../components/ui/Button';
import type { Book } from '../types';
import './HomePage.css';

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const [featured, setFeatured] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItemIds, setCartItemIds] = useState<string[]>([]);

  useEffect(() => {
    booksApi
      .list({ limit: 12 })
      .then((res) => setFeatured(res.data.data.books || []))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));

    if (isAuthenticated) {
      cartApi
        .get()
        .then((res) => {
          const items = res.data.data.cart?.items || [];
          setCartItemIds(items.map((i: { bookId: string }) => i.bookId));
        })
        .catch(() => setCartItemIds([]));
    }
  }, [isAuthenticated]);

  const handleAddToCart = async (book: Book) => {
    if (cartItemIds.includes(book.id)) return;
    try {
      await cartApi.add(book.id);
      setCartItemIds((prev) => [...prev, book.id]);
    } catch (err) {
      console.error('Failed to add book to cart', err);
    }
  };

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
                <Button variant="primary" size="lg">Explore Gallery</Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg">Meet the Author</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section glass-home-section">
        <div className="container">
          <GlassGalleryShowcase
            items={featured}
            title="Featured Glass Showcase"
            subtitle="Explore our premier volumes with interactive 3D Cover Flow, Glass Bookshelf & Grid views."
            onAddToCart={handleAddToCart}
            cartItemIds={cartItemIds}
            isLoading={loading}
          />
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
