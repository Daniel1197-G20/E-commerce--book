import { useEffect, useState } from 'react';
import { booksApi, cartApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GlassGalleryShowcase } from '../components/gallery/GlassGalleryShowcase';
import type { Book } from '../types';
import './BooksPage.css';

export function BooksPage() {
  const { isAuthenticated } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItemIds, setCartItemIds] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    booksApi
      .list({ limit: 50 })
      .then((res) => {
        setBooks(res.data.data.books || []);
      })
      .catch(() => setBooks([]))
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
    <main className="books-page">
      <div className="container">
        <GlassGalleryShowcase
          items={books}
          title="Digital Book Gallery Showcase"
          subtitle="Discover curated publications in an interactive glassmorphism gallery."
          isLibraryMode={false}
          onAddToCart={handleAddToCart}
          cartItemIds={cartItemIds}
          isLoading={loading}
        />
      </div>
    </main>
  );
}
