import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  BookOpen,
  Download,
  ShoppingCart,
  Star,
  Calendar,
  FileText,
  Globe,
  Tag,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import type { Book } from '../../types';
import './GlassBookModal.css';

interface GlassBookModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  isOwned?: boolean;
  onAddToCart?: (book: Book) => void;
  isAddingToCart?: boolean;
}

export function GlassBookModal({
  book,
  isOpen,
  onClose,
  isOwned = false,
  onAddToCart,
  isAddingToCart = false,
}: GlassBookModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!book) return null;

  const formatPrice = (price: number, currency = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="glass-modal-overlay" onClick={onClose}>
          <motion.div
            className="glass-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          <motion.div
            className="glass-modal-container"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Ambient glass light reflections */}
            <div className="glass-modal-orb orb-1" />
            <div className="glass-modal-orb orb-2" />

            <button
              className="glass-modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="glass-modal-content">
              {/* Left Column: Book Cover Display */}
              <div className="glass-modal-cover-section">
                <div className="glass-cover-wrapper">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="glass-cover-img"
                    />
                  ) : (
                    <div className="glass-cover-placeholder">
                      <span className="placeholder-letter">{book.title.charAt(0)}</span>
                    </div>
                  )}
                  <div className="glass-cover-shine" />
                </div>
                {book.featured && (
                  <span className="glass-badge featured-badge">
                    <Sparkles size={12} /> Featured Edition
                  </span>
                )}
              </div>

              {/* Right Column: Book Details */}
              <div className="glass-modal-details-section">
                <div className="glass-details-header">
                  {book.categories?.[0] && (
                    <span className="glass-category-tag">
                      <Tag size={12} /> {book.categories[0].name}
                    </span>
                  )}
                  <h2 className="glass-modal-title">{book.title}</h2>
                  <p className="glass-modal-author">by <span>{book.author}</span></p>
                </div>

                {/* Rating & Status */}
                <div className="glass-modal-stats">
                  {book.averageRating !== undefined && book.averageRating > 0 && (
                    <div className="glass-stat-item">
                      <Star size={16} className="star-icon" fill="currentColor" />
                      <span className="stat-value">{book.averageRating.toFixed(1)}</span>
                      {book.reviewCount ? (
                        <span className="stat-sub">({book.reviewCount} reviews)</span>
                      ) : null}
                    </div>
                  )}
                  <div className="glass-stat-item price-stat">
                    <span className="price-tag">
                      {isOwned ? 'Purchased' : formatPrice(book.price, book.currency)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="glass-modal-description">
                  <h3>Synopsis</h3>
                  <p>{book.description || book.shortDescription || 'No description available for this volume.'}</p>
                </div>

                {/* Metadata Grid */}
                <div className="glass-meta-grid">
                  {book.publicationDate && (
                    <div className="glass-meta-item">
                      <Calendar size={14} />
                      <div>
                        <span className="meta-label">Published</span>
                        <span className="meta-val">
                          {new Date(book.publicationDate).toLocaleDateString('en-GB', {
                            year: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                  {book.pageCount && (
                    <div className="glass-meta-item">
                      <FileText size={14} />
                      <div>
                        <span className="meta-label">Length</span>
                        <span className="meta-val">{book.pageCount} Pages</span>
                      </div>
                    </div>
                  )}
                  {book.language && (
                    <div className="glass-meta-item">
                      <Globe size={14} />
                      <div>
                        <span className="meta-label">Language</span>
                        <span className="meta-val">{book.language}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Controls */}
                <div className="glass-modal-actions">
                  {isOwned ? (
                    <>
                      <Link
                        to={`/reader/${book.id}`}
                        className="glass-btn primary-glass-btn"
                        onClick={onClose}
                      >
                        <BookOpen size={18} />
                        Read eBook
                      </Link>
                      <a
                        href={`/api/library/download/${book.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="glass-btn secondary-glass-btn"
                      >
                        <Download size={18} />
                        Download PDF
                      </a>
                    </>
                  ) : (
                    <>
                      {onAddToCart && (
                        <button
                          className="glass-btn primary-glass-btn"
                          onClick={() => onAddToCart(book)}
                          disabled={isAddingToCart}
                        >
                          <ShoppingCart size={18} />
                          {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                        </button>
                      )}
                      <Link
                        to={`/books/${book.slug}`}
                        className="glass-btn secondary-glass-btn"
                        onClick={onClose}
                      >
                        <ExternalLink size={18} />
                        View Full Details
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
