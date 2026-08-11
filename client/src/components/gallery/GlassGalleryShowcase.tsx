import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid,
  Columns,
  Eye,
  BookOpen,
  Download,
  Star,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bookmark,
  ShoppingCart,
  Check,
  Tag,
  Layers,
} from 'lucide-react';
import type { Book, LibraryItem } from '../../types';
import { GlassBookModal } from './GlassBookModal';
import './GlassGalleryShowcase.css';

export type ViewMode = 'grid' | 'carousel' | 'shelf';

export interface GlassGalleryShowcaseProps {
  items: (Book | LibraryItem)[];
  title?: string;
  subtitle?: string;
  isLibraryMode?: boolean;
  onAddToCart?: (book: Book) => void;
  cartItemIds?: string[];
  isLoading?: boolean;
}

// Helper to extract uniform Book object whether input is Book or LibraryItem
function normalizeBook(item: Book | LibraryItem): { book: Book; purchasedAt?: string } {
  if ('book' in item) {
    return { book: item.book, purchasedAt: item.purchasedAt };
  }
  return { book: item };
}

export function GlassGalleryShowcase({
  items,
  title = 'Book Gallery',
  subtitle = 'Interactive glassmorphism showcase of digital volumes.',
  isLibraryMode = false,
  onAddToCart,
  cartItemIds = [],
  isLoading = false,
}: GlassGalleryShowcaseProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [previewBook, setPreviewBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Normalize list
  const normalizedList = useMemo(() => items.map(normalizeBook), [items]);

  // Extract categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    normalizedList.forEach(({ book }) => {
      book.categories?.forEach((cat) => set.add(cat.name));
    });
    return Array.from(set);
  }, [normalizedList]);

  // Filter list by search & category
  const filteredList = useMemo(() => {
    return normalizedList.filter(({ book }) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        selectedCategory === 'all' ||
        book.categories?.some((cat) => cat.name === selectedCategory);
      return matchesSearch && matchesCat;
    });
  }, [normalizedList, searchQuery, selectedCategory]);

  const handleOpenPreview = (book: Book) => {
    setPreviewBook(book);
    setIsModalOpen(true);
  };

  const formatPrice = (price: number, currency = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const currentCarouselItem = filteredList[activeCarouselIndex] || filteredList[0];

  return (
    <section className="glass-gallery-showcase">
      {/* Background Ambient Ambient Orbs */}
      <div className="ambient-orb orb-primary" />
      <div className="ambient-orb orb-secondary" />
      <div className="ambient-orb orb-accent" />

      <div className="glass-showcase-container">
        {/* Header Section */}
        <div className="glass-showcase-header">
          <div className="header-titles">
            <span className="glass-pill-badge">
              <Sparkles size={13} /> {isLibraryMode ? 'Personal Library' : 'Glass Collection'}
            </span>
            <h2 className="showcase-title">{title}</h2>
            {subtitle && <p className="showcase-subtitle">{subtitle}</p>}
          </div>

          {/* Controls Bar */}
          <div className="glass-controls-bar">
            {/* Search Input */}
            <div className="glass-search-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Filter gallery..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveCarouselIndex(0);
                }}
                className="glass-search-input"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="glass-view-toggle">
              <button
                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <Grid size={16} />
                <span>Grid</span>
              </button>
              <button
                className={`toggle-btn ${viewMode === 'carousel' ? 'active' : ''}`}
                onClick={() => setViewMode('carousel')}
                title="3D Cover Flow Showcase"
              >
                <Columns size={16} />
                <span>Cover Flow</span>
              </button>
              <button
                className={`toggle-btn ${viewMode === 'shelf' ? 'active' : ''}`}
                onClick={() => setViewMode('shelf')}
                title="Glass Bookshelf"
              >
                <Layers size={16} />
                <span>Bookshelf</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        {categories.length > 0 && (
          <div className="glass-category-bar">
            <button
              className={`cat-pill ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory('all');
                setActiveCarouselIndex(0);
              }}
            >
              All Volumes ({normalizedList.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(cat);
                  setActiveCarouselIndex(0);
                }}
              >
                <Tag size={12} /> {cat}
              </button>
            ))}
          </div>
        )}

        {/* Content Display */}
        {isLoading ? (
          <div className="glass-loading-state">
            <div className="glass-spinner" />
            <p>Loading library volumes...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="glass-empty-state">
            <Bookmark size={36} />
            <h3>No books match your view filter</h3>
            <p>Try searching for a different title, author, or category.</p>

            {isLibraryMode && items.length === 0 && (
              <Link to="/books" className="glass-empty-btn">
                Browse Store Books
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* VIEW MODE 1: GRID SHOWCASE */}
            {viewMode === 'grid' && (
              <motion.div
                className="glass-grid-display"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {filteredList.map(({ book, purchasedAt }) => {
                  const isInCart = cartItemIds.includes(book.id);
                  return (
                    <motion.article
                      key={book.id}
                      className="glass-book-card"
                      whileHover={{ y: -8, scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    >
                      <div className="glass-card-cover-container">
                        {book.coverImage ? (
                          <img src={book.coverImage} alt={book.title} className="glass-card-img" />
                        ) : (
                          <div className="glass-card-placeholder">
                            <span>{book.title.charAt(0)}</span>
                          </div>
                        )}
                        <div className="glass-card-shine" />

                        {/* Quick View Button Overlay */}
                        <button
                          className="glass-quick-view-btn"
                          onClick={() => handleOpenPreview(book)}
                          title="Quick View"
                        >
                          <Eye size={16} /> Preview
                        </button>
                      </div>

                      <div className="glass-card-content">
                        {book.categories?.[0] && (
                          <span className="glass-card-category">{book.categories[0].name}</span>
                        )}
                        <h3 className="glass-card-title">
                          <Link to={isLibraryMode ? `/reader/${book.id}` : `/books/${book.slug}`}>
                            {book.title}
                          </Link>
                        </h3>
                        <p className="glass-card-author">{book.author}</p>

                        {purchasedAt ? (
                          <p className="glass-card-purchased">
                            Purchased {new Date(purchasedAt).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </p>
                        ) : (
                          <div className="glass-card-meta">
                            {book.averageRating !== undefined && book.averageRating > 0 && (
                              <div className="glass-card-rating">
                                <Star size={13} fill="currentColor" />
                                <span>{book.averageRating.toFixed(1)}</span>
                              </div>
                            )}
                            <span className="glass-card-price">
                              {formatPrice(book.price, book.currency)}
                            </span>
                          </div>
                        )}

                        <div className="glass-card-actions">
                          {isLibraryMode ? (
                            <>
                              <Link to={`/reader/${book.id}`} className="glass-action-btn primary">
                                <BookOpen size={15} /> Read
                              </Link>
                              <a
                                href={`/api/library/download/${book.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="glass-action-btn secondary"
                                title="Download eBook"
                              >
                                <Download size={15} />
                              </a>
                            </>
                          ) : (
                            <>
                              <Link to={`/books/${book.slug}`} className="glass-action-btn secondary">
                                View
                              </Link>
                              {onAddToCart && (
                                <button
                                  className={`glass-action-btn primary ${isInCart ? 'added' : ''}`}
                                  onClick={() => onAddToCart(book)}
                                  disabled={isInCart}
                                >
                                  {isInCart ? (
                                    <>
                                      <Check size={15} /> In Cart
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingCart size={15} /> Add
                                    </>
                                  )}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </motion.div>
            )}

            {/* VIEW MODE 2: 3D COVER FLOW CAROUSEL SHOWCASE */}
            {viewMode === 'carousel' && currentCarouselItem && (
              <motion.div
                className="glass-carousel-display"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                {/* Left Showcase Stage: 3D Cover Flow */}
                <div className="carousel-stage">
                  <button
                    className="carousel-nav-btn prev"
                    onClick={() =>
                      setActiveCarouselIndex((prev) =>
                        prev === 0 ? filteredList.length - 1 : prev - 1
                      )
                    }
                    aria-label="Previous Book"
                  >
                    <ChevronLeft size={22} />
                  </button>

                  <div className="coverflow-perspective-box">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentCarouselItem.book.id}
                        className="coverflow-active-card"
                        initial={{ opacity: 0, rotateY: -25, scale: 0.85, z: -100 }}
                        animate={{ opacity: 1, rotateY: 0, scale: 1, z: 0 }}
                        exit={{ opacity: 0, rotateY: 25, scale: 0.85, z: -100 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                        onClick={() => handleOpenPreview(currentCarouselItem.book)}
                      >
                        {currentCarouselItem.book.coverImage ? (
                          <img
                            src={currentCarouselItem.book.coverImage}
                            alt={currentCarouselItem.book.title}
                          />
                        ) : (
                          <div className="coverflow-placeholder">
                            <span>{currentCarouselItem.book.title.charAt(0)}</span>
                          </div>
                        )}
                        <div className="coverflow-reflection" />
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <button
                    className="carousel-nav-btn next"
                    onClick={() =>
                      setActiveCarouselIndex((prev) =>
                        prev === filteredList.length - 1 ? 0 : prev + 1
                      )
                    }
                    aria-label="Next Book"
                  >
                    <ChevronRight size={22} />
                  </button>
                </div>

                {/* Right Panel: Interactive Active Book Details */}
                <div className="carousel-detail-panel">
                  <div className="panel-badge">
                    Volume {activeCarouselIndex + 1} of {filteredList.length}
                  </div>
                  <h3 className="panel-title">{currentCarouselItem.book.title}</h3>
                  <p className="panel-author">by {currentCarouselItem.book.author}</p>

                  <p className="panel-synopsis">
                    {currentCarouselItem.book.shortDescription ||
                      currentCarouselItem.book.description ||
                      'An exceptional work in this collection.'}
                  </p>

                  <div className="panel-stats-row">
                    {!isLibraryMode && (
                      <span className="panel-price">
                        {formatPrice(
                          currentCarouselItem.book.price,
                          currentCarouselItem.book.currency
                        )}
                      </span>
                    )}
                    {currentCarouselItem.book.averageRating !== undefined && (
                      <div className="panel-rating">
                        <Star size={15} fill="currentColor" />
                        <span>{currentCarouselItem.book.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <div className="panel-actions">
                    {isLibraryMode ? (
                      <>
                        <Link
                          to={`/reader/${currentCarouselItem.book.id}`}
                          className="glass-action-btn primary lg"
                        >
                          <BookOpen size={18} /> Read Now
                        </Link>
                        <a
                          href={`/api/library/download/${currentCarouselItem.book.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="glass-action-btn secondary lg"
                        >
                          <Download size={18} /> Download
                        </a>
                      </>
                    ) : (
                      <>
                        {onAddToCart && (
                          <button
                            className="glass-action-btn primary lg"
                            onClick={() => onAddToCart(currentCarouselItem.book)}
                          >
                            <ShoppingCart size={18} /> Add to Cart
                          </button>
                        )}
                        <button
                          className="glass-action-btn secondary lg"
                          onClick={() => handleOpenPreview(currentCarouselItem.book)}
                        >
                          <Eye size={18} /> Quick View
                        </button>
                      </>
                    )}
                  </div>

                  {/* Carousel Thumbnails Bar */}
                  <div className="carousel-dots">
                    {filteredList.map((item, idx) => (
                      <button
                        key={item.book.id}
                        className={`carousel-dot ${idx === activeCarouselIndex ? 'active' : ''}`}
                        onClick={() => setActiveCarouselIndex(idx)}
                        title={item.book.title}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW MODE 3: GLASS BOOKSHELF DISPLAY */}
            {viewMode === 'shelf' && (
              <motion.div
                className="glass-shelf-display"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="shelf-board">
                  <div className="shelf-books-row">
                    {filteredList.map(({ book, purchasedAt }, idx) => (
                      <motion.div
                        key={book.id}
                        className="shelf-book-item"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -16, scale: 1.05 }}
                        onClick={() => handleOpenPreview(book)}
                      >
                        <div className="shelf-cover-wrapper">
                          {book.coverImage ? (
                            <img src={book.coverImage} alt={book.title} />
                          ) : (
                            <div className="shelf-placeholder">
                              <span>{book.title.charAt(0)}</span>
                            </div>
                          )}
                          <div className="shelf-book-spine" />
                        </div>
                        <div className="shelf-book-reflection" />
                        <div className="shelf-book-tooltip">
                          <strong>{book.title}</strong>
                          <span>{book.author}</span>
                          {purchasedAt ? (
                            <small>Click to read</small>
                          ) : (
                            <small>{formatPrice(book.price, book.currency)}</small>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {/* Glowing Frosted Glass Ledge */}
                  <div className="glass-ledge" />
                  <div className="glass-ledge-glow" />
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Glassmorphism Book Lightbox Modal */}
      <GlassBookModal
        book={previewBook}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isOwned={isLibraryMode}
        onAddToCart={onAddToCart}
        isAddingToCart={previewBook ? cartItemIds.includes(previewBook.id) : false}
      />
    </section>
  );
}
