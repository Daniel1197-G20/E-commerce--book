const bcrypt = require('bcryptjs');
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

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profileImage: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  success(res, { users }, 'Users list retrieved');
});

exports.createAdminUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Name, email, and password are required', 400);
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (existing) {
    throw new AppError('A user with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const newAdmin = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'ADMIN',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  success(res, { user: newAdmin }, 'New admin user created successfully', 201);
});

exports.toggleUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Toggle role between CUSTOMER and ADMIN
  const newRole = user.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    select: { id: true, name: true, email: true, role: true },
  });

  success(res, { user: updatedUser }, `User role changed to ${newRole}`);
});
