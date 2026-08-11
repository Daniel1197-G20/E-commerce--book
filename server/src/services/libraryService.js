const path = require('path');
const fs = require('fs');
const prisma = require('../database/prisma');
const AppError = require('../utils/AppError');
const config = require('../config');

const getLibrary = async (userId) => {
  const purchases = await prisma.purchase.findMany({
    where: { userId },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          slug: true,
          author: true,
          coverImage: true,
          format: true,
          pageCount: true,
          language: true,
        },
      },
      order: {
        select: { orderNumber: true, createdAt: true },
      },
    },
    orderBy: { purchasedAt: 'desc' },
  });

  return purchases.map((p) => ({
    id: p.id,
    book: p.book,
    purchasedAt: p.purchasedAt,
    orderNumber: p.order?.orderNumber,
  }));
};

const checkAccess = async (userId, bookId) => {
  const purchase = await prisma.purchase.findUnique({
    where: { userId_bookId: { userId, bookId } },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          slug: true,
          ebookFile: true,
          format: true,
        },
      },
    },
  });

  if (!purchase) {
    throw new AppError('You do not have access to this book', 403, 'NO_ACCESS');
  }

  return purchase;
};

const createSamplePdf = (targetPath) => {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const samplePdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj
4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
5 0 obj<</Length 77>>stream
BT /F1 24 Tf 72 700 Td (Stories Worth Reading - Digital Edition) Tj ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000237 00000 n 
0000000305 00000 n 
trailer<</Size 6/Root 1 0 R>>
startxref
433
%%EOF`;
  fs.writeFileSync(targetPath, samplePdfContent);
};

const getEbookStreamPath = async (userId, bookId) => {
  const purchase = await checkAccess(userId, bookId);
  let relativePath = purchase.book.ebookFile;
  let fullPath;

  if (relativePath) {
    fullPath = path.join(process.cwd(), relativePath);
  }

  if (!relativePath || !fs.existsSync(fullPath)) {
    fullPath = path.join(process.cwd(), 'uploads/ebooks/sample.pdf');
    if (!fs.existsSync(fullPath)) {
      createSamplePdf(fullPath);
    }
  }

  return {
    path: fullPath,
    filename: `${purchase.book.slug}.${purchase.book.format?.toLowerCase() || 'pdf'}`,
    book: purchase.book,
  };
};

module.exports = {
  getLibrary,
  checkAccess,
  getEbookStreamPath,
};
