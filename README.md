# Inventory API

A REST API for e-commerce inventory management with user authentication, role-based access control, order tracking, and Stripe payment processing. Built with Node.js, Express, TypeScript, Prisma ORM, and PostgreSQL (hosted on Supabase).

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Runtime     | Node.js + TypeScript                |
| Framework   | Express 5                           |
| Database    | PostgreSQL (Supabase) + Prisma ORM  |
| Auth        | JWT (7-day expiry) + bcrypt         |
| Payments    | Stripe Checkout + Webhooks          |
| Validation  | Zod                                 |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- A [Supabase](https://supabase.com) project (or any PostgreSQL database)
- A [Stripe](https://stripe.com) account

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
PORT=3000
CLIENT_URL=http://localhost:3000

# Supabase - pooled connection for app queries
DATABASE_URL=postgresql://user:password@host:6543/postgres?pgbouncer=true

# Supabase - direct connection for migrations
DIRECT_URL=postgresql://user:password@host:5432/postgres

JWT_SECRET=your_jwt_secret

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

> **Note:** Supabase provides two connection strings. Use `DATABASE_URL` (pooled) for your app and `DIRECT_URL` (direct) for Prisma migrations.

### Database Setup

```bash
npx prisma migrate deploy   # apply migrations to the database
npx prisma generate         # regenerate the Prisma client
```

### Running Locally

```bash
npm run dev       # development with hot reload (nodemon)
npm run build     # compile TypeScript
npm start         # run compiled output
```

### Stripe Webhook (Local Development)

To test webhooks locally, use the Stripe CLI to forward events to your server:

```bash
stripe listen --forward-to localhost:3000/payments/webhook
```

---

## API Reference

### Health

| Method | Path      | Auth | Description  |
|--------|-----------|------|--------------|
| GET    | `/health` | No   | Health check |

---

### Auth

| Method | Path             | Auth       | Description                        |
|--------|------------------|------------|------------------------------------|
| POST   | `/auth/register` | No         | Register a new user                |
| POST   | `/auth/login`    | No         | Login and receive a JWT            |
| GET    | `/auth/users`    | ADMIN only | List all registered users          |

#### Register — `POST /auth/register`

```json
{
  "name": "Jesse",
  "email": "jesse@example.com",
  "password": "securepassword"
}
```

**Response `201`:**
```json
{
  "token": "<jwt>",
  "user": {
    "id": "cuid",
    "name": "Jesse",
    "email": "jesse@example.com",
    "role": "USER"
  }
}
```

#### Login — `POST /auth/login`

```json
{
  "email": "jesse@example.com",
  "password": "securepassword"
}
```

**Response `200`:** Same shape as register.

---

### Items

Write operations (create, update, delete) are restricted to `ADMIN` role.

| Method | Path         | Auth       | Description              |
|--------|--------------|------------|--------------------------|
| GET    | `/items`     | No         | List items (paginated)   |
| POST   | `/items`     | ADMIN only | Create a new item        |
| GET    | `/items/:id` | No         | Get a single item        |
| PUT    | `/items/:id` | ADMIN only | Update an item           |
| DELETE | `/items/:id` | ADMIN only | Delete an item           |

#### List Items — `GET /items`

Supports pagination via query params:

```
GET /items?page=1&limit=10
```

#### Create Item — `POST /items`

```json
{
  "name": "Widget Pro",
  "description": "A great widget",
  "price": 29.99,
  "quantity": 100,
  "isActive": true
}
```

---

### Orders

All order routes require authentication. Users can only see their own orders.

| Method | Path          | Auth     | Description              |
|--------|---------------|----------|--------------------------|
| GET    | `/orders`     | Required | List the user's orders   |
| GET    | `/orders/:id` | Required | Get a single order       |
| POST   | `/orders`     | Required | Manually create an order |

Orders are automatically created and marked as `PAID` by the Stripe webhook when a checkout session completes. You do not need to call `POST /orders` manually in a normal purchase flow.

**Order statuses:** `PENDING` | `PAID` | `FAILED` | `CANCELLED`

---

### Payments

| Method | Path                  | Auth     | Description                              |
|--------|-----------------------|----------|------------------------------------------|
| POST   | `/payments/checkout`  | Required | Create a Stripe checkout session         |
| POST   | `/payments/webhook`   | No       | Stripe webhook handler (internal use)    |
| GET    | `/success`            | No       | Redirect target after successful payment |
| GET    | `/cancel`             | No       | Redirect target after cancelled payment  |

#### Create Checkout Session — `POST /payments/checkout`

```json
{
  "itemId": "cuid",
  "purchaseQuantity": 2
}
```

**Response `200`:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

Redirect the user to the returned `url` to complete payment. On success, Stripe fires a `checkout.session.completed` webhook which:

1. Decrements the item's stock
2. Creates an order record with status `PAID`

---

## Authentication

Protected routes require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are returned from `/auth/register` and `/auth/login`. They expire after **7 days**.

### Roles

| Role    | Permissions                                      |
|---------|--------------------------------------------------|
| `USER`  | Browse items, purchase, view own orders          |
| `ADMIN` | All USER permissions + manage items, view users  |

---

## Project Structure

```
├── index.ts                    # Entry point
├── app.ts                      # Express app, route registration
├── prisma.config.ts            # Prisma + Supabase connection config
├── features/
│   ├── auth/                   # Register, login, JWT, user listing
│   ├── items/                  # Inventory CRUD
│   ├── orders/                 # Order tracking
│   └── payments/               # Stripe checkout & webhook handling
├── common/
│   ├── middleware/
│   │   ├── authenticate.ts     # JWT verification
│   │   ├── requiredRole.ts     # Role-based access control
│   │   └── errorHandler.ts     # Global error handler
│   ├── env.ts                  # Validated environment variables
│   ├── errors.ts               # Error utilities
│   └── logger.ts               # Logging
├── lib/
│   ├── prisma.ts               # Prisma client singleton
│   └── stripe.ts               # Stripe client singleton
├── types/
│   └── express.d.ts            # Express Request augmentation (req.user)
└── prisma/
    ├── schema.prisma           # Database schema
    └── migrations/             # Migration history
```

---

## Database Schema

| Model            | Description                                      |
|------------------|--------------------------------------------------|
| `User`           | Registered users with role (ADMIN / USER)        |
| `Item`           | Inventory items with price, quantity, sold count |
| `Order`          | Purchase record linked to a user and Stripe session |
| `OrderItem`      | Line items within an order (name, qty, unit price) |
| `ShippingAddress`| Saved addresses linked to a user                 |

---

## License

ISC
