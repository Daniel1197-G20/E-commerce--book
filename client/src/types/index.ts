export type Role = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  profileImage?: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface Book {
  id: string;
  title: string;
  slug: string;
  author: string;
  description?: string;
  shortDescription?: string | null;
  coverImage?: string | null;
  previewFile?: string | null;
  price: number;
  currency: string;
  isbn?: string | null;
  publicationDate?: string | null;
  pageCount?: number | null;
  language?: string;
  format?: string;
  featured?: boolean;
  published?: boolean;
  categories?: Category[];
  averageRating?: number;
  reviewCount?: number;
  purchaseCount?: number;
  owned?: boolean;
  createdAt?: string;
}

export interface CartItem {
  id: string;
  bookId: string;
  book: Book;
  alreadyOwned: boolean;
  createdAt: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface LibraryItem {
  id: string;
  book: Book;
  purchasedAt: string;
  orderNumber?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: { code: string };
}
