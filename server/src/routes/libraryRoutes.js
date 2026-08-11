const express = require('express');
const libraryService = require('../services/libraryService');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const path = require('path');

const router = express.Router();

router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const library = await libraryService.getLibrary(req.user.id);
  success(res, { library }, 'Library retrieved');
}));

router.get('/:bookId/access', asyncHandler(async (req, res) => {
  const access = await libraryService.checkAccess(req.user.id, req.params.bookId);
  success(res, {
    hasAccess: true,
    book: {
      id: access.book.id,
      title: access.book.title,
      slug: access.book.slug,
      format: access.book.format,
    },
  }, 'Access granted');
}));

router.get('/:bookId/download', asyncHandler(async (req, res) => {
  const { path: filePath, filename } = await libraryService.getEbookStreamPath(
    req.user.id,
    req.params.bookId
  );

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/pdf');
  res.sendFile(path.resolve(filePath));
}));

router.get('/:bookId/read', asyncHandler(async (req, res) => {
  const { path: filePath, filename } = await libraryService.getEbookStreamPath(
    req.user.id,
    req.params.bookId
  );

  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/pdf');
  res.sendFile(path.resolve(filePath));
}));

module.exports = router;
