const prisma = require('../database/prisma');
const AppError = require('../utils/AppError');
const { Prisma } = require('@prisma/client');

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');

const getBooks = async (query = {}) => {
  const {
    search,
    category,
    featured,
    published = 'true',
    sort = 'newest',
    page = 1,
    limit = 12,
    minPrice,
    maxPrice,
  } = query;

  const where = {};

  if (published === 'true') where.published = true;
  if (published === 'false') where.published = false;
  if (featured === 'true') where.featured = true;

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { author: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category) {
    where.categories = {
      some: {
        category: { slug: category },
      },
    };
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = new Prisma.Decimal(minPrice);
    if (maxPrice) where.price.lte = new Prisma.Decimal(maxPrice);
  }

  let orderBy = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  if (sort === 'price_desc') orderBy = { price: 'desc' };
  if (sort === 'title') orderBy = { title: 'asc' };
  if (sort === 'oldest') orderBy = { createdAt: 'asc' };

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        categories: { include: { category: true } },
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true, purchases: true } },
      },
    }),
    prisma.book.count({ where }),
  ]);

  const data = books.map((book) => {
    const ratings = book.reviews.map((r) => r.rating);
    const avgRating =
      ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    return {
      id: book.id,
      title: book.title,
      slug: book.slug,
      author: book.author,
      shortDescription: book.shortDescription,
      coverImage: book.coverImage,
      price: Number(book.price),
      currency: book.currency,
      featured: book.featured,
      published: book.published,
      format: book.format,
      pageCount: book.pageCount,
      language: book.language,
      categories: book.categories.map((c) => c.category),
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: book._count.reviews,
      purchaseCount: book._count.purchases,
      createdAt: book.createdAt,
    };
  });

  return {
    books: data,
    pagination: {
      page: parseInt(page, 10),
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  };
};

const getBookBySlug = async (slug, userId = null) => {
  const book = await prisma.book.findUnique({
    where: { slug },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      reviews: {
        include: {
          user: { select: { id: true, name: true, profileImage: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      _count: { select: { reviews: true, purchases: true } },
    },
  });

  if (!book || (!book.published && !userId)) {
    throw new AppError('Book not found', 404, 'BOOK_NOT_FOUND');
  }

  let owned = false;
  if (userId) {
    const purchase = await prisma.purchase.findUnique({
      where: { userId_bookId: { userId, bookId: book.id } },
    });
    owned = !!purchase;
  }

  const ratings = book.reviews.map((r) => r.rating);
  const avgRating =
    ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  return {
    id: book.id,
    title: book.title,
    slug: book.slug,
    author: book.author,
    description: book.description,
    shortDescription: book.shortDescription,
    coverImage: book.coverImage,
    previewFile: book.previewFile,
    price: Number(book.price),
    currency: book.currency,
    isbn: book.isbn,
    publicationDate: book.publicationDate,
    pageCount: book.pageCount,
    language: book.language,
    format: book.format,
    featured: book.featured,
    published: book.published,
    categories: book.categories.map((c) => c.category),
    tags: book.tags.map((t) => t.tag),
    reviews: book.reviews,
    averageRating: Math.round(avgRating * 10) / 10,
    reviewCount: book._count.reviews,
    purchaseCount: book._count.purchases,
    owned,
    createdAt: book.createdAt,
    updatedAt: book.updatedAt,
  };
};

const createBook = async (data) => {
  const slug = data.slug || slugify(data.title);
  const existing = await prisma.book.findUnique({ where: { slug } });
  if (existing) throw new AppError('Slug already exists', 409, 'SLUG_EXISTS');

  const book = await prisma.book.create({
    data: {
      title: data.title,
      slug,
      author: data.author,
      description: data.description,
      shortDescription: data.shortDescription,
      coverImage: data.coverImage,
      previewFile: data.previewFile,
      ebookFile: data.ebookFile,
      price: data.price,
      currency: data.currency || 'NGN',
      isbn: data.isbn,
      publicationDate: data.publicationDate ? new Date(data.publicationDate) : null,
      pageCount: data.pageCount,
      language: data.language || 'English',
      format: data.format || 'PDF',
      featured: data.featured || false,
      published: data.published || false,
    },
  });

  return book;
};

const updateBook = async (id, data) => {
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) throw new AppError('Book not found', 404, 'BOOK_NOT_FOUND');

  const updated = await prisma.book.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.slug && { slug: data.slug }),
      ...(data.author && { author: data.author }),
      ...(data.description && { description: data.description }),
      ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription }),
      ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
      ...(data.previewFile !== undefined && { previewFile: data.previewFile }),
      ...(data.ebookFile !== undefined && { ebookFile: data.ebookFile }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.currency && { currency: data.currency }),
      ...(data.isbn !== undefined && { isbn: data.isbn }),
      ...(data.publicationDate !== undefined && {
        publicationDate: data.publicationDate ? new Date(data.publicationDate) : null,
      }),
      ...(data.pageCount !== undefined && { pageCount: data.pageCount }),
      ...(data.language && { language: data.language }),
      ...(data.format && { format: data.format }),
      ...(data.featured !== undefined && { featured: data.featured }),
      ...(data.published !== undefined && { published: data.published }),
    },
  });

  return updated;
};

const deleteBook = async (id) => {
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) throw new AppError('Book not found', 404, 'BOOK_NOT_FOUND');
  await prisma.book.delete({ where: { id } });
  return true;
};

module.exports = {
  getBooks,
  getBookBySlug,
  createBook,
  updateBook,
  deleteBook,
  slugify,
};
