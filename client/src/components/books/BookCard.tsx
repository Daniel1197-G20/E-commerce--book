import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { Book } from '../../types';
import './BookCard.css';

interface Props {
  book: Book;
}

export function BookCard({ book }: Props) {
  const formatPrice = (price: number, currency = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <article className="book-card">
      <Link to={`/books/${book.slug}`} className="book-card-cover">
        {book.coverImage ? (
          <img src={book.coverImage} alt={`Cover of ${book.title}`} loading="lazy" />
        ) : (
          <div className="book-card-placeholder">
            <span>{book.title.charAt(0)}</span>
          </div>
        )}
      </Link>
      <div className="book-card-body">
        {book.categories?.[0] && (
          <span className="book-card-category">{book.categories[0].name}</span>
        )}
        <h3 className="book-card-title">
          <Link to={`/books/${book.slug}`}>{book.title}</Link>
        </h3>
        <p className="book-card-author">{book.author}</p>
        {book.averageRating !== undefined && book.averageRating > 0 && (
          <div className="book-card-rating">
            <Star size={14} fill="currentColor" />
            <span>{book.averageRating.toFixed(1)}</span>
            {book.reviewCount ? <span className="muted">({book.reviewCount})</span> : null}
          </div>
        )}
        <div className="book-card-footer">
          <span className="book-card-price">
            {formatPrice(book.price, book.currency)}
          </span>
          <Link to={`/books/${book.slug}`} className="book-card-cta">
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
