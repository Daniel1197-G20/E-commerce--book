const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');

// Ensure upload directories exist
const uploadDirs = ['covers', 'previews', 'ebooks'];
uploadDirs.forEach((dir) => {
  const dirPath = path.join(__dirname, '../../uploads', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'covers';
    const uploadType = req.body.type || file.fieldname;
    
    if (uploadType === 'preview') {
      folder = 'previews';
    } else if (uploadType === 'ebook') {
      folder = 'ebooks';
    }

    const destPath = path.join(__dirname, '../../uploads', folder);
    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const cleanBasename = path.basename(file.originalname, ext).replace(/[^\w\-]/g, '_');
    cb(null, `${cleanBasename}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
  const allowedDocTypes = ['application/pdf', 'application/epub+zip', 'application/x-mobipocket-ebook'];

  const uploadType = req.body.type || file.fieldname;

  if (uploadType === 'cover' || file.mimetype.startsWith('image/')) {
    if (allowedImageTypes.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new AppError('Only image files (JPG, PNG, WEBP, GIF) are allowed for cover images', 400), false);
  }

  if (uploadType === 'preview' || uploadType === 'ebook' || allowedDocTypes.includes(file.mimetype)) {
    if (allowedDocTypes.includes(file.mimetype) || file.originalname.endsWith('.pdf') || file.originalname.endsWith('.epub')) {
      return cb(null, true);
    }
    return cb(new AppError('Only PDF and EPUB files are allowed for e-books and previews', 400), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max limit
  fileFilter,
});

module.exports = upload;
