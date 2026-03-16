# Inventory API

A REST API for inventory management with user authentication and Stripe payment processing. Built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express 5
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** JWT + bcrypt
- **Payments:** Stripe

## Getting Started

### Prerequisites

- Node.js (>=18) and npm
- PostgreSQL database

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
PORT=3000
CLIENT_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/inventory?schema=public
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Development

```bash
npm run dev
```

### Build & Run (Production)

```bash
npm run build
npm start
```

### Database

```bash
npx prisma migrate dev   # run migrations
npx prisma generate      # regenerate client
```

## API Endpoints

### Health

| Method | Path      | Description  |
|--------|-----------|--------------|
| GET    | `/health` | Health check |

### Auth

| Method | Path             | Description    |
|--------|------------------|----------------|
| POST   | `/auth/register` | Register a user |
| POST   | `/auth/login`    | Login, get JWT  |

### Items

| Method | Path         | Auth     | Description       |
|--------|--------------|----------|-------------------|
| GET    | `/items`     | No       | List all items    |
| POST   | `/items`     | Required | Create an item    |
| GET    | `/items/:id` | No       | Get a single item |
| PUT    | `/items/:id` | Required | Update an item    |
| DELETE | `/items/:id` | Required | Delete an item    |

### Payments

| Method | Path                   | Description                      |
|--------|------------------------|----------------------------------|
| POST   | `/payments/checkout`   | Create a Stripe checkout session |
| POST   | `/payments/webhook`    | Stripe webhook handler           |
| GET    | `/payments/success`    | Payment success redirect         |
| GET    | `/payments/cancel`     | Payment cancel redirect          |

## Authentication

Protected routes require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are returned from `/auth/login` and expire after 7 days.

## Project Structure

```
├── index.ts               # Entry point
├── app.ts                 # Express app setup
├── features/
│   ├── auth/              # Registration, login, JWT
│   ├── items/             # Inventory CRUD
│   └── payments/          # Stripe checkout & webhooks
├── common/
│   ├── middleware/        # Auth & role guards
│   └── errors.ts          # Error handling
├── lib/
│   ├── prisma.ts          # Prisma client singleton
│   └── stripe.ts          # Stripe client
└── prisma/
    └── schema.prisma      # Database schema
```

## License

ISC