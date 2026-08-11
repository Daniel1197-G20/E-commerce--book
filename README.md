# E-Book Portfolio + E-Commerce Platform

Production-oriented author portfolio and digital bookstore with secure Paystack payments, customer library, and admin-ready backend.

## Stack

**Frontend:** React 19 + Vite + TypeScript, React Router, TanStack Query, Framer Motion, Lucide, React Hook Form, Zod

**Backend:** Node.js + Express, Prisma, PostgreSQL, JWT auth, Paystack

## Project structure

```
ebook-platform/
├── client/          # React frontend
├── server/          # Express API
└── README.md
```

## Prerequisites

- Node.js 18+
- PostgreSQL
- Paystack test keys (https://dashboard.paystack.com)

## Setup

### 1. Database

Create a PostgreSQL database, then:

```bash
cd server
cp .env.example .env
# Edit DATABASE_URL, JWT secrets, Paystack keys
```

### 2. Backend

```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

API runs at `http://localhost:5000`

Seed accounts:
- Admin: `admin@ebookplatform.com` / `Admin123!`
- Customer: `reader@example.com` / `Customer123!`

### 3. Frontend

```bash
cd client
npm install
# Optional: create .env with VITE_API_URL=http://localhost:5000/api
npm run dev
```

App runs at `http://localhost:5173`

## Key features implemented

- Author portfolio homepage (editorial design)
- Book listing with search & sort
- Book detail with ownership awareness
- Auth (register / login / JWT)
- Cart with duplicate & ownership protection
- Paystack initialize → verify → entitlement flow
- Secure library access (backend authorization required)
- Role-based structure (CUSTOMER / ADMIN)
- Prisma schema for Users, Books, Orders, Purchases, Reviews, Cart, etc.

## Security notes

- Passwords hashed with bcrypt
- Ebook files are **not** publicly served; access is gated by Purchase entitlement
- Order totals calculated on the server from DB prices
- Payment confirmation is server-side (verify + webhook)
- Rate limiting on auth and API
- Helmet + CORS configured

## Paystack flow

1. Client sends book IDs only
2. Server validates ownership, calculates price, creates PENDING order
3. Server initializes Paystack transaction
4. User pays on Paystack
5. Client or webhook calls verify
6. Server verifies amount & status, marks PAID, creates Purchase records

## Next steps for full production

- Complete admin UI (books CRUD, orders, customers)
- Full digital reader UI with progress
- Signed file delivery / private S3
- Webhook signature verification
- Email receipts
- More comprehensive tests
- Production env + HTTPS cookies

## License

Private / commercial use as needed.
