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
    limit = 20,
    minPrice,
    maxPrice,
  } = query;

  const where = {};

  if (published === 'true') where.published = true;
  if (published === 'false') where.published = false;
  // If published === 'all', we don't set where.published filter

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
      description: book.description,
      shortDescription: book.shortDescription,
      coverImage: book.coverImage,
      previewFile: book.previewFile,
      ebookFile: book.ebookFile,
      price: Number(book.price),
      currency: book.currency,
      isbn: book.isbn,
      featured: book.featured,
      published: book.published,
      format: book.format,
      pageCount: book.pageCount,
      language: book.language,
      publicationDate: book.publicationDate,
      categories: book.categories.map((c) => c.category),
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: book._count.reviews,
      purchaseCount: book._count.purchases,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
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

  if (!book) {
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
    ebookFile: book.ebookFile,
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
  const { categoryIds, ...bookData } = data;
  const slug = bookData.slug ? slugify(bookData.slug) : slugify(bookData.title);
  
  const existing = await prisma.book.findUnique({ where: { slug } });
  if (existing) throw new AppError('Slug or title already exists', 409, 'SLUG_EXISTS');

  const book = await prisma.book.create({
    data: {
      title: bookData.title,
      slug,
      author: bookData.author,
      description: bookData.description,
      shortDescription: bookData.shortDescription || null,
      coverImage: bookData.coverImage || null,
      previewFile: bookData.previewFile || null,
      ebookFile: bookData.ebookFile || null,
      price: new Prisma.Decimal(bookData.price || 0),
      currency: bookData.currency || 'NGN',
      isbn: bookData.isbn || null,
      publicationDate: bookData.publicationDate ? new Date(bookData.publicationDate) : null,
      pageCount: bookData.pageCount ? parseInt(bookData.pageCount, 10) : null,
      language: bookData.language || 'English',
      format: bookData.format || 'PDF',
      featured: Boolean(bookData.featured),
      published: Boolean(bookData.published),
    },
  });

  if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
    await prisma.bookCategory.createMany({
      data: categoryIds.map((catId) => ({ bookId: book.id, categoryId: catId })),
    });
  }

  return getBookBySlug(book.slug);
};

const updateBook = async (id, data) => {
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) throw new AppError('Book not found', 404, 'BOOK_NOT_FOUND');

  const { categoryIds, ...updateData } = data;
  const newSlug = updateData.slug ? slugify(updateData.slug) : updateData.title ? slugify(updateData.title) : undefined;

  if (newSlug && newSlug !== book.slug) {
    const existing = await prisma.book.findUnique({ where: { slug: newSlug } });
    if (existing) throw new AppError('Slug already in use by another book', 409, 'SLUG_EXISTS');
  }

  const updated = await prisma.book.update({
    where: { id },
    data: {
      ...(updateData.title && { title: updateData.title }),
      ...(newSlug && { slug: newSlug }),
      ...(updateData.author && { author: updateData.author }),
      ...(updateData.description && { description: updateData.description }),
      ...(updateData.shortDescription !== undefined && { shortDescription: updateData.shortDescription }),
      ...(updateData.coverImage !== undefined && { coverImage: updateData.coverImage }),
      ...(updateData.previewFile !== undefined && { previewFile: updateData.previewFile }),
      ...(updateData.ebookFile !== undefined && { ebookFile: updateData.ebookFile }),
      ...(updateData.price !== undefined && { price: new Prisma.Decimal(updateData.price) }),
      ...(updateData.currency && { currency: updateData.currency }),
      ...(updateData.isbn !== undefined && { isbn: updateData.isbn }),
      ...(updateData.publicationDate !== undefined && {
        publicationDate: updateData.publicationDate ? new Date(updateData.publicationDate) : null,
      }),
      ...(updateData.pageCount !== undefined && {
        pageCount: updateData.pageCount ? parseInt(updateData.pageCount, 10) : null,
      }),
      ...(updateData.language && { language: updateData.language }),
      ...(updateData.format && { format: updateData.format }),
      ...(updateData.featured !== undefined && { featured: Boolean(updateData.featured) }),
      ...(updateData.published !== undefined && { published: Boolean(updateData.published) }),
    },
  });

  if (categoryIds && Array.isArray(categoryIds)) {
    await prisma.bookCategory.deleteMany({ where: { bookId: id } });
    if (categoryIds.length > 0) {
      await prisma.bookCategory.createMany({
        data: categoryIds.map((catId) => ({ bookId: id, categoryId: catId })),
      });
    }
  }

  return getBookBySlug(updated.slug);
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
