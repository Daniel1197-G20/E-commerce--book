import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, ArrowRight, Feather } from 'lucide-react';
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
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-inner">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="hero-eyebrow-pill">
              <Feather size={14} /> Author & Digital Publisher
            </div>
            <h1 className="hero-title">
              Stories Worth Reading.<br />
              Books Worth Keeping.
            </h1>
            <p className="hero-subtitle">
              Thoughtful digital volumes on focus, engineering craft, and the quiet revolutions that shape how we live, write, and build.
            </p>
            <div className="hero-actions">
              <Link to="/books">
                <Button variant="accent" size="lg">
                  <Sparkles size={18} /> Explore Collection
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="secondary" size="lg">
                  Meet the Author <ArrowRight size={16} />
                </Button>
              </Link>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-value">100%</span>
                <span className="stat-label">DRM-Free Access</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">EPUB & PDF</span>
                <span className="stat-label">Multi-format</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">Instant</span>
                <span className="stat-label">Digital Delivery</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Gallery Showcase */}
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

      {/* Author Bio Section */}
      <section className="section section-alt">
        <div className="container">
          <div className="author-feature-grid">
            <div className="author-card-box">
              <blockquote>
                “When you dedicate your attention to a single volume, you unlock a depth of thought that short-form media can never replicate.”
              </blockquote>
              <div className="author-signature">— Chidi Okonkwo</div>
            </div>

            <div className="author-preview-content">
              <h2>About the Author</h2>
              <p>
                Chidi Okonkwo writes about attention, software craftsmanship, and the stories that live between modern cities and identities. His essays and digital books have resonated with readers, engineers, and creators around the globe.
              </p>
              <Link to="/about">
                <Button variant="outline" size="md">
                  Read Full Biography <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container cta-inner">
          <h2>Start Reading Today</h2>
          <p>Own digital books you can return to again and again, with built-in dark mode and seamless web reader.</p>
          <Link to="/books">
            <Button variant="accent" size="lg">
              <BookOpen size={18} /> Browse Full Catalog
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
