import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Books
export const booksApi = {
  list: (params?: Record<string, string | number>) =>
    api.get('/books', { params }),
  getBySlug: (slug: string) => api.get(`/books/${slug}`),
  create: (data: Record<string, unknown>) => api.post('/books', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/books/${id}`, data),
  delete: (id: string) => api.delete(`/books/${id}`),
};

// Admin
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getBooks: (params?: Record<string, string | number>) => api.get('/admin/books', { params }),
  uploadFile: (formData: FormData) =>
    api.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Categories
export const categoriesApi = {
  list: () => api.get('/categories'),
  create: (data: { name: string; description?: string }) => api.post('/categories', data),
};

// Cart
export const cartApi = {
  get: () => api.get('/cart'),
  add: (bookId: string) => api.post('/cart', { bookId }),
  remove: (bookId: string) => api.delete(`/cart/${bookId}`),
};

// Payments
export const paymentsApi = {
  initialize: (bookIds: string[]) =>
    api.post('/payments/initialize', { bookIds }),
  verify: (reference: string) =>
    api.get(`/payments/verify/${reference}`),
};

// Library
export const libraryApi = {
  get: () => api.get('/library'),
  checkAccess: (bookId: string) => api.get(`/library/${bookId}/access`),
  downloadUrl: (bookId: string) => `${API_URL}/library/${bookId}/download`,
  readUrl: (bookId: string) => `${API_URL}/library/${bookId}/read`,
};
