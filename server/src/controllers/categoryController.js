const prisma = require('../database/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const AppError = require('../utils/AppError');
const { slugify } = require('../services/bookService');

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { books: true } },
    },
  });

  success(res, { categories }, 'Categories retrieved');
});

exports.createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name || !name.trim()) {
    throw new AppError('Category name is required', 400);
  }

  const slug = slugify(name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    throw new AppError('Category already exists', 409);
  }

  const category = await prisma.category.create({
    data: { name: name.trim(), slug, description },
  });

  success(res, { category }, 'Category created', 201);
});
