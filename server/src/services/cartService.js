const prisma = require('../database/prisma');
const AppError = require('../utils/AppError');

const getCart = async (userId) => {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          slug: true,
          author: true,
          coverImage: true,
          price: true,
          currency: true,
          published: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const ownedIds = (
    await prisma.purchase.findMany({
      where: { userId },
      select: { bookId: true },
    })
  ).map((p) => p.bookId);

  const cartItems = items
    .filter((item) => item.book.published)
    .map((item) => ({
      id: item.id,
      bookId: item.bookId,
      book: {
        ...item.book,
        price: Number(item.book.price),
      },
      alreadyOwned: ownedIds.includes(item.bookId),
      createdAt: item.createdAt,
    }));

  const subtotal = cartItems
    .filter((i) => !i.alreadyOwned)
    .reduce((sum, i) => sum + i.book.price, 0);

  return {
    items: cartItems,
    subtotal,
    itemCount: cartItems.filter((i) => !i.alreadyOwned).length,
  };
};

const addToCart = async (userId, bookId) => {
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book || !book.published) {
    throw new AppError('Book not found or not available', 404, 'BOOK_NOT_FOUND');
  }

  const owned = await prisma.purchase.findUnique({
    where: { userId_bookId: { userId, bookId } },
  });
  if (owned) {
    throw new AppError('You already own this book', 400, 'ALREADY_OWNED');
  }

  const existing = await prisma.cartItem.findUnique({
    where: { userId_bookId: { userId, bookId } },
  });
  if (existing) {
    throw new AppError('Book already in cart', 400, 'ALREADY_IN_CART');
  }

  await prisma.cartItem.create({
    data: { userId, bookId },
  });

  return getCart(userId);
};

const removeFromCart = async (userId, bookId) => {
  await prisma.cartItem.deleteMany({
    where: { userId, bookId },
  });
  return getCart(userId);
};

const clearCart = async (userId) => {
  await prisma.cartItem.deleteMany({ where: { userId } });
};

module.exports = { getCart, addToCart, removeFromCart, clearCart };
