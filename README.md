# Landing Page API

This repository contains a simple Express‑based backend for managing inventory items. It uses TypeScript, Prisma (with PostgreSQL), and exposes a minimal API which is documented using an OpenAPI/Swagger spec.

## Features

- Create and list inventory items
- TypeScript-driven service, controller, and route layers
- Prisma ORM handling data persistence
- OpenAPI spec available at `openapi.yml`

## Getting Started

### Prerequisites

- Node.js (>=18) and npm
- PostgreSQL database (or compatible) configured via `.env`

### Installation

```bash
npm install
```

### Environment

Copy `.env.example` to `.env` and set the database URL:

```bash
cp .env.example .env
# edit .env with your connection string
```

### Development

```bash
npm run dev
```

This will start `nodemon` watching the compiled `dist/server.js` file. TypeScript code is compiled via `ts-node`.

### Build & Run

```bash
npm run build    # compile to dist/
npm start        # run the compiled server
```

### Database

Prisma is used for the schema and migrations. Typical workflow:

```bash
npx prisma migrate dev      # run migrations
npx prisma generate         # regenerate client
```

### API Documentation

The OpenAPI spec is located at [`openapi.yml`](./openapi.yml). You can view it in a Swagger UI instance:

```bash
yarn global add swagger-ui-dist
# or use docker:
# docker run --rm -p 8080:8080 -v $(pwd)/openapi.yml:/usr/share/nginx/html/openapi.yml:ro nginx
```

### Project Structure

```
app.ts            # main Express setup
index.ts          # server entrypoint
features/         # domain features (items, etc.)
  items/          # item controllers, services, models, routes
common/           # shared utilities and middleware
prisma/           # schema & migrations
lib/prisma.ts     # Prisma client singleton
openapi.yml       # API specification
```

## Contributing

Pull requests are welcome. Please follow the existing code style and add tests where appropriate.

## License

This project is licensed under the ISC License.