const prisma = require('../database/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const AppError = require('../utils/AppError');
const bookService = require('../services/bookService');

exports.getStats = asyncHandler(async (req, res) => {
  const [totalBooks, publishedBooks, draftBooks, totalUsers, totalOrders, salesAgg] = await Promise.all([
    prisma.book.count(),
    prisma.book.count({ where: { published: true } }),
    prisma.book.count({ where: { published: false } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.count({ where: { paymentStatus: 'SUCCESSFUL' } }),
    prisma.order.aggregate({
      where: { paymentStatus: 'SUCCESSFUL' },
      _sum: { total: true },
    }),
  ]);

  const totalRevenue = salesAgg._sum.total ? Number(salesAgg._sum.total) : 0;

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      items: true,
    },
  });

  success(
    res,
    {
      stats: {
        totalBooks,
        publishedBooks,
        draftBooks,
        totalUsers,
        totalOrders,
        totalRevenue,
      },
      recentOrders,
    },
    'Admin statistics retrieved'
  );
});

exports.uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400, 'NO_FILE');
  }

  const uploadType = req.body.type || req.file.fieldname || 'cover';
  let folder = 'covers';
  if (uploadType === 'preview') folder = 'previews';
  if (uploadType === 'ebook') folder = 'ebooks';

  const fileUrl = `/uploads/${folder}/${req.file.filename}`;

  success(
    res,
    {
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    },
    'File uploaded successfully'
  );
});

exports.getAllBooks = asyncHandler(async (req, res) => {
  // Pass published='all' so admin sees both published and draft books
  const query = { ...req.query, published: req.query.published || 'all' };
  const result = await bookService.getBooks(query);
  success(res, result, 'All books retrieved for admin');
});
