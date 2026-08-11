const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('Admin123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ebookplatform.com' },
    update: {},
    create: {
      name: 'Platform Admin',
      email: 'admin@ebookplatform.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const customerHash = await bcrypt.hash('Customer123!', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'reader@example.com' },
    update: {},
    create: {
      name: 'Aisha Reader',
      email: 'reader@example.com',
      passwordHash: customerHash,
      role: 'CUSTOMER',
    },
  });

  const catSelf = await prisma.category.upsert({
    where: { slug: 'self-help' },
    update: {},
    create: { name: 'Self-Help', slug: 'self-help', description: 'Personal growth and development' },
  });

  const catTech = await prisma.category.upsert({
    where: { slug: 'technology' },
    update: {},
    create: { name: 'Technology', slug: 'technology', description: 'Software and tech' },
  });

  const catFiction = await prisma.category.upsert({
    where: { slug: 'fiction' },
    update: {},
    create: { name: 'Fiction', slug: 'fiction', description: 'Stories and novels' },
  });

  const books = [
    {
      title: 'The Art of Focused Work',
      slug: 'the-art-of-focused-work',
      author: 'Chidi Okonkwo',
      description: 'A practical guide to deep work in a distracted world. Learn frameworks for sustained attention, deliberate practice, and building a life of meaningful productivity without burnout.',
      shortDescription: 'Master deep work and reclaim your attention in the digital age.',
      price: 8500,
      featured: true,
      published: true,
      pageCount: 248,
      language: 'English',
      format: 'PDF',
      categories: [catSelf.id],
    },
    {
      title: 'Building with Clarity',
      slug: 'building-with-clarity',
      author: 'Chidi Okonkwo',
      description: 'Software craftsmanship principles for modern developers. From clean architecture to pragmatic testing, this book helps you write systems that last.',
      shortDescription: 'Software craftsmanship for the modern engineer.',
      price: 12000,
      featured: true,
      published: true,
      pageCount: 312,
      language: 'English',
      format: 'PDF',
      categories: [catTech.id],
    },
    {
      title: 'Quiet Storms',
      slug: 'quiet-storms',
      author: 'Chidi Okonkwo',
      description: 'A collection of short stories exploring identity, belonging, and the quiet revolutions that shape ordinary lives across West African cities.',
      shortDescription: 'Stories of identity and quiet revolutions.',
      price: 5500,
      featured: false,
      published: true,
      pageCount: 186,
      language: 'English',
      format: 'PDF',
      categories: [catFiction.id],
    },
  ];

  for (const b of books) {
    const { categories, ...data } = b;
    const book = await prisma.book.upsert({
      where: { slug: data.slug },
      update: data,
      create: data,
    });

    for (const catId of categories) {
      await prisma.bookCategory.upsert({
        where: { bookId_categoryId: { bookId: book.id, categoryId: catId } },
        update: {},
        create: { bookId: book.id, categoryId: catId },
      });
    }
  }

  await prisma.testimonial.createMany({
    data: [
      {
        name: 'Tunde Adebayo',
        role: 'Software Engineer',
        content: 'Building with Clarity changed how I approach system design. Practical, honest, and deeply useful.',
        rating: 5,
        featured: true,
      },
      {
        name: 'Ngozi Eze',
        role: 'Product Designer',
        content: 'The Art of Focused Work is the book I recommend to every creative professional I know.',
        rating: 5,
        featured: true,
      },
      {
        name: 'Kofi Mensah',
        role: 'Founder',
        content: 'Quiet Storms stayed with me long after the last page. Beautiful writing.',
        rating: 5,
        featured: true,
      },
    ],
  });

  console.log('Seed complete.');
  console.log('Admin: admin@ebookplatform.com / Admin123!');
  console.log('Customer: reader@example.com / Customer123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
