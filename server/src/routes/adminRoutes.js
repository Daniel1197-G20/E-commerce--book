const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Require logged-in user with ADMIN role for all routes here
router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/stats', adminController.getStats);
router.get('/books', adminController.getAllBooks);
router.post('/upload', upload.single('file'), adminController.uploadFile);

// User Management Routes
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createAdminUser);
router.patch('/users/:userId/role', adminController.toggleUserRole);

module.exports = router;
