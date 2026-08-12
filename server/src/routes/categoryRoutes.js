const express = require('express');
const categoryController = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.get('/', categoryController.getCategories);
router.post('/', protect, restrictTo('ADMIN'), categoryController.createCategory);

module.exports = router;
