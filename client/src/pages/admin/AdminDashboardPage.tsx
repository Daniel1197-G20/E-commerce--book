import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  ShoppingBag,
  AlertTriangle,
  Filter,
} from 'lucide-react';
import { adminApi, booksApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { BookFormModal } from '../../components/admin/BookFormModal';
import type { Book } from '../../types';
import { Button } from '../../components/ui/Button';
import './AdminDashboard.css';

interface Stats {
  totalBooks: number;
  publishedBooks: number;
  draftBooks: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
}

export function AdminDashboardPage() {
  const { success, error, info } = useToast();

  const [stats, setStats] = useState<Stats | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams: Record<string, string | number> = {
        published: statusFilter === 'published' ? 'true' : statusFilter === 'draft' ? 'false' : 'all',
        limit: 100,
      };
      if (search.trim()) {
        queryParams.search = search.trim();
      }

      const [statsRes, booksRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getBooks(queryParams),
      ]);

      setStats(statsRes.data.data.stats);
      setBooks(booksRes.data.data.books || []);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to load admin data';
      error(msg);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, error]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCreateNew = () => {
    setBookToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (book: Book) => {
    setBookToEdit(book);
    setIsFormOpen(true);
  };

  const handleTogglePublish = async (book: Book) => {
    try {
      const newStatus = !book.published;
      await booksApi.update(book.id, { published: newStatus });
      success(`Book '${book.title}' is now ${newStatus ? 'Published' : 'Unpublished (Draft)'}`);
      fetchDashboardData();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to update status';
      error(msg);
    }
  };

  const handleToggleFeatured = async (book: Book) => {
    try {
      const newFeatured = !book.featured;
      await booksApi.update(book.id, { featured: newFeatured });
      info(`Book '${book.title}' ${newFeatured ? 'marked as Featured' : 'removed from Featured'}`);
      fetchDashboardData();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to update featured state';
      error(msg);
    }
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;
    setDeleting(true);
    try {
      await booksApi.delete(bookToDelete.id);
      success(`Book '${bookToDelete.title}' deleted permanently`);
      setBookToDelete(null);
      fetchDashboardData();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to delete book';
      error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="container">
        {/* Top Header */}
        <div className="admin-header">
          <div>
            <div className="admin-badge-pill">
              <span className="dot pulse" /> Admin Management Portal
            </div>
            <h1 className="admin-title">Book Store & Catalog Control</h1>
            <p className="admin-subtitle">
              Manage your published e-books, add new titles with custom pricing, upload PDF/EPUB files, and monitor store analytics.
            </p>
          </div>
          <div className="admin-actions">
            <Button variant="ghost" onClick={fetchDashboardData} disabled={loading} title="Refresh data">
              <RefreshCw size={17} className={loading ? 'animate-spin' : ''} /> Refresh
            </Button>
            <Button variant="primary" onClick={handleCreateNew}>
              <Plus size={18} /> Upload & Add Book
            </Button>
          </div>
        </div>

        {/* Stats Metrics Section */}
        <div className="admin-stats-grid">
          <div className="stat-card">
            <div className="stat-icon-bg primary">
              <BookOpen size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Books</span>
              <strong className="stat-value">{stats?.totalBooks ?? 0}</strong>
              <div className="stat-breakdown">
                <span className="pub-badge">{stats?.publishedBooks ?? 0} Published</span>
                <span className="draft-badge">{stats?.draftBooks ?? 0} Drafts</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-bg accent">
              <DollarSign size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Revenue</span>
              <strong className="stat-value">
                ₦{(stats?.totalRevenue ?? 0).toLocaleString()}
              </strong>
              <span className="stat-sub">From digital ebook sales</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-bg success">
              <ShoppingBag size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Completed Orders</span>
              <strong className="stat-value">{stats?.totalOrders ?? 0}</strong>
              <span className="stat-sub">Verified payment checkouts</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-bg info">
              <Users size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Registered Readers</span>
              <strong className="stat-value">{stats?.totalUsers ?? 0}</strong>
              <span className="stat-sub">Customer accounts</span>
            </div>
          </div>
        </div>

        {/* Catalog Control Section */}
        <div className="admin-content-card">
          <div className="admin-toolbar">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search books by title, author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <Filter size={16} className="filter-icon" />
              <button
                className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All ({stats?.totalBooks ?? 0})
              </button>
              <button
                className={`filter-tab ${statusFilter === 'published' ? 'active' : ''}`}
                onClick={() => setStatusFilter('published')}
              >
                Published ({stats?.publishedBooks ?? 0})
              </button>
              <button
                className={`filter-tab ${statusFilter === 'draft' ? 'active' : ''}`}
                onClick={() => setStatusFilter('draft')}
              >
                Drafts ({stats?.draftBooks ?? 0})
              </button>
            </div>
          </div>

          {/* Book Table */}
          {loading ? (
            <div className="admin-loading-state">
              <div className="spinner" />
              <p>Fetching book catalog...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="admin-empty-state">
              <BookOpen size={48} className="empty-icon" />
              <h3>No books match your criteria</h3>
              <p>Try clearing your search query or upload a new book to your catalog.</p>
              <Button variant="primary" onClick={handleCreateNew} style={{ marginTop: '1rem' }}>
                <Plus size={18} /> Upload New Book
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Price</th>
                    <th>Format & Pages</th>
                    <th>Categories</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.id}>
                      <td>
                        <div className="book-cell">
                          <div className="book-thumb">
                            {book.coverImage ? (
                              <img src={book.coverImage} alt={book.title} />
                            ) : (
                              <div className="thumb-placeholder">
                                <BookOpen size={20} />
                              </div>
                            )}
                          </div>
                          <div className="book-info">
                            <strong className="book-title-text">{book.title}</strong>
                            <span className="book-author-text">by {book.author}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="price-tag">
                          {book.currency === 'USD' ? '$' : '₦'}
                          {book.price.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <div className="format-cell">
                          <span className="format-badge">{book.format || 'PDF'}</span>
                          {book.pageCount && <span className="pages-text">{book.pageCount} pages</span>}
                        </div>
                      </td>
                      <td>
                        <div className="categories-cell">
                          {book.categories && book.categories.length > 0 ? (
                            book.categories.map((c) => (
                              <span key={c.id} className="category-chip">
                                {c.name}
                              </span>
                            ))
                          ) : (
                            <span className="uncategorized">—</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="status-cell">
                          <button
                            className={`status-pill ${book.published ? 'published' : 'draft'}`}
                            onClick={() => handleTogglePublish(book)}
                            title="Click to toggle publish status"
                          >
                            {book.published ? (
                              <>
                                <CheckCircle size={13} /> Published
                              </>
                            ) : (
                              <>
                                <Clock size={13} /> Draft
                              </>
                            )}
                          </button>

                          <button
                            className={`featured-star ${book.featured ? 'active' : ''}`}
                            onClick={() => handleToggleFeatured(book)}
                            title={book.featured ? 'Featured on homepage' : 'Mark as featured'}
                          >
                            <Star size={15} fill={book.featured ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="actions-cell">
                          <button
                            className="action-icon-btn"
                            onClick={() => handleTogglePublish(book)}
                            title={book.published ? 'Unpublish' : 'Publish'}
                          >
                            {book.published ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <button
                            className="action-icon-btn edit"
                            onClick={() => handleEdit(book)}
                            title="Edit book details & price"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="action-icon-btn delete"
                            onClick={() => setBookToDelete(book)}
                            title="Delete book"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Book Form Modal (Create / Edit) */}
      <BookFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchDashboardData}
        bookToEdit={bookToEdit}
      />

      {/* Delete Confirmation Modal */}
      {bookToDelete && (
        <div className="admin-modal-overlay" onClick={() => setBookToDelete(null)}>
          <div className="admin-modal-container delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <AlertTriangle size={36} className="danger-icon" />
              <h3>Delete Book Confirmation</h3>
            </div>
            <div className="delete-modal-body">
              <p>
                Are you sure you want to delete <strong>"{bookToDelete.title}"</strong>?
              </p>
              <p className="delete-warning">
                This action cannot be undone. The book and its associated preview/ebook entries will be permanently removed.
              </p>
            </div>
            <div className="delete-modal-footer">
              <Button variant="ghost" onClick={() => setBookToDelete(null)} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="primary" onClick={confirmDelete} disabled={deleting} style={{ backgroundColor: 'var(--color-error)' }}>
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
