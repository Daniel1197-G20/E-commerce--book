const express = require('express');
const bookController = require('../controllers/bookController');
const { protect, restrictTo } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const prisma = require('../database/prisma');

const router = express.Router();

// Optional auth for ownership check
const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    const jwt = require('jsonwebtoken');
    const config = require('../config');
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }
    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, role: true },
      });
      if (user) req.user = user;
    }
  } catch (_) {}
  next();
});

router.get('/', bookController.getBooks);
router.get('/:slug', optionalAuth, bookController.getBookBySlug);

router.post('/', protect, restrictTo('ADMIN'), bookController.createBook);
router.patch('/:id', protect, restrictTo('ADMIN'), bookController.updateBook);
router.delete('/:id', protect, restrictTo('ADMIN'), bookController.deleteBook);

module.exports = router;
