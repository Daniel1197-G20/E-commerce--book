const bookService = require('../services/bookService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');

exports.getBooks = asyncHandler(async (req, res) => {
  const result = await bookService.getBooks(req.query);
  success(res, result, 'Books retrieved successfully');
});

exports.getBookBySlug = asyncHandler(async (req, res) => {
  const userId = req.user?.id || null;
  const book = await bookService.getBookBySlug(req.params.slug, userId);
  success(res, { book }, 'Book retrieved successfully');
});

exports.createBook = asyncHandler(async (req, res) => {
  const book = await bookService.createBook(req.body);
  success(res, { book }, 'Book created successfully', 201);
});

exports.updateBook = asyncHandler(async (req, res) => {
  const book = await bookService.updateBook(req.params.id, req.body);
  success(res, { book }, 'Book updated successfully');
});

exports.deleteBook = asyncHandler(async (req, res) => {
  await bookService.deleteBook(req.params.id);
  success(res, null, 'Book deleted successfully');
});
