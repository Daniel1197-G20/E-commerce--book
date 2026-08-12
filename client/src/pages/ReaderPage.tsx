import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Download,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Type,
} from 'lucide-react';
import { booksApi, libraryApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Book } from '../types';
import './ReaderPage.css';

export function ReaderPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [readingTheme, setReadingTheme] = useState<'light' | 'dark' | 'sepia'>('sepia');
  const [fontSize, setFontSize] = useState<number>(18);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(24);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!bookId) return;
    setLoading(true);

    booksApi
      .list({ limit: 50 })
      .then((res) => {
        const found = (res.data.data.books || []).find(
          (b: Book) => b.id === bookId || b.slug === bookId
        );
        if (found) {
          setBook(found);
          setTotalPages(found.pageCount || 24);
        } else {
          setBook(null);
        }
      })
      .catch(() => setBook(null))
      .finally(() => setLoading(false));
  }, [bookId, isAuthenticated, navigate]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="glass-reader-loading">
        <div className="glass-spinner" />
        <p>Preparing digital reading canvas...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="glass-reader-empty">
        <h2>Volume Not Found</h2>
        <p>The requested book could not be loaded into the reader engine.</p>
        <Link to="/dashboard/library" className="reader-btn">
          Return to Library
        </Link>
      </div>
    );
  }

  const readingProgress = Math.round((currentPage / totalPages) * 100);

  return (
    <div className={`glass-reader-page theme-${readingTheme}`}>
      {/* Top Glass Control Toolbar */}
      <header className="glass-reader-header">
        <div className="reader-header-left">
          <Link to="/dashboard/library" className="header-icon-btn" title="Back to Library">
            <ArrowLeft size={18} />
          </Link>
          <div className="reader-title-box">
            <h1 className="reader-book-title">{book.title}</h1>
            <span className="reader-book-author">by {book.author}</span>
          </div>
        </div>

        <div className="reader-header-center">
          <div className="progress-pill">
            <BookOpen size={14} />
            <span>Page {currentPage} of {totalPages} ({readingProgress}%)</span>
          </div>
        </div>

        <div className="reader-header-right">
          {/* Font Size Adjuster */}
          <div className="reader-tool-group">
            <button
              className="tool-btn"
              onClick={() => setFontSize((prev) => Math.max(14, prev - 2))}
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="tool-value">{fontSize}px</span>
            <button
              className="tool-btn"
              onClick={() => setFontSize((prev) => Math.min(28, prev + 2))}
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Typography Toggle */}
          <button
            className={`header-icon-btn ${fontFamily === 'sans' ? 'active' : ''}`}
            onClick={() => setFontFamily((prev) => (prev === 'serif' ? 'sans' : 'serif'))}
            title="Toggle Serif / Sans Font"
          >
            <Type size={18} />
          </button>

          {/* Theme Switcher */}
          <div className="reader-theme-switcher">
            <button
              className={`theme-dot light ${readingTheme === 'light' ? 'active' : ''}`}
              onClick={() => setReadingTheme('light')}
              title="Light Theme"
            />
            <button
              className={`theme-dot sepia ${readingTheme === 'sepia' ? 'active' : ''}`}
              onClick={() => setReadingTheme('sepia')}
              title="Warm Sepia"
            />
            <button
              className={`theme-dot dark ${readingTheme === 'dark' ? 'active' : ''}`}
              onClick={() => setReadingTheme('dark')}
              title="Night Mode"
            />
          </div>

          {/* Download PDF */}
          <a
            href={libraryApi.downloadUrl(book.id)}
            target="_blank"
            rel="noreferrer"
            className="header-icon-btn"
            title="Download eBook"
          >
            <Download size={18} />
          </a>

          {/* Fullscreen */}
          <button
            className="header-icon-btn"
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </header>

      {/* Main Glass Reader Viewport */}
      <main className="glass-reader-body">
        <div
          className={`reader-paper font-${fontFamily}`}
          style={{ fontSize: `${fontSize}px` }}
        >
          <div className="chapter-header">
            <span className="chapter-number">Chapter {currentPage}</span>
            <h2 className="chapter-title">The Art of Deliberate Focus</h2>
          </div>

          <div className="reader-prose">
            <p className="lead-paragraph">
              Great creative work is rarely produced in a frenzy of noise. It emerges in quiet hours—the uninterrupted stretches when the mind is allowed to settle, deepen, and craft ideas with precision.
            </p>

            <p>
              In an era dominated by rapid notifications and endless feeds, depth has become a rare luxury. Yet, every enduring manuscript, architectural marvel, and piece of software is built brick by brick during silent focus.
            </p>

            <blockquote>
              “To master any craft is to choose what to ignore. Attention is the currency of creation.”
            </blockquote>

            <p>
              When you open a volume, you make an intentional contract with your own mind. You choose depth over surface chatter, clarity over distraction, and reflection over speed.
            </p>

            <p>
              As you read through these pages, allow each sentence to breathe. Digital reading should not feel rushed; it should offer the same tactile reverence as turning smooth, heavy paper under warm lamp glow.
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Glass Navigation Bar */}
      <footer className="glass-reader-footer">
        <button
          className="page-nav-btn"
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
        >
          <ChevronLeft size={18} /> Previous Page
        </button>

        <div className="reading-progress-bar-container">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
        </div>

        <button
          className="page-nav-btn"
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
        >
          Next Page <ChevronRight size={18} />
        </button>
      </footer>
    </div>
  );
}
