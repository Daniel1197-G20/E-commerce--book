const express = require('express');
const cartService = require('../services/cartService');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');

const router = express.Router();

router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  success(res, cart, 'Cart retrieved');
}));

router.post('/', asyncHandler(async (req, res) => {
  const { bookId } = req.body;
  if (!bookId) {
    return res.status(400).json({ success: false, message: 'bookId is required' });
  }
  const cart = await cartService.addToCart(req.user.id, bookId);
  success(res, cart, 'Book added to cart');
}));

router.delete('/:bookId', asyncHandler(async (req, res) => {
  const cart = await cartService.removeFromCart(req.user.id, req.params.bookId);
  success(res, cart, 'Book removed from cart');
}));

module.exports = router;
