import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { booksApi } from '../services/api';
import { BookCard } from '../components/books/BookCard';
import type { Book } from '../types';
import './BooksPage.css';

export function BooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const page = Number(searchParams.get('page') || 1);
  const sort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    setLoading(true);
    booksApi
      .list({
        search: searchParams.get('search') || '',
        sort,
        page,
        limit: 12,
      })
      .then((res) => {
        setBooks(res.data.data.books || []);
        setPagination(res.data.data.pagination || { page: 1, totalPages: 1, total: 0 });
      })
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) params.set('search', search);
    else params.delete('search');
    params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <main className="books-page">
      <div className="container">
        <header className="books-header">
          <h1>Books</h1>
          <p>Explore the full collection.</p>
        </header>

        <form className="books-toolbar" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search by title, author…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search books"
          />
          <select
            value={sort}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams);
              params.set('sort', e.target.value);
              params.set('page', '1');
              setSearchParams(params);
            }}
            aria-label="Sort books"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="title">Title A–Z</option>
          </select>
          <button type="submit" className="search-btn">Search</button>
        </form>

        {loading ? (
          <p className="muted">Loading books…</p>
        ) : books.length === 0 ? (
          <div className="empty-state">
            <p>No books found.</p>
          </div>
        ) : (
          <>
            <p className="results-count">{pagination.total} book{pagination.total !== 1 ? 's' : ''}</p>
            <div className="book-grid">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={page <= 1}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('page', String(page - 1));
                    setSearchParams(params);
                  }}
                >
                  Previous
                </button>
                <span>
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('page', String(page + 1));
                    setSearchParams(params);
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
