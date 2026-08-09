# Sparkle Bows

Sparkle Bows is a full-stack ecommerce application for boutique hair accessories. This repository includes a customer-facing React storefront and a Node.js/Express API that handles authentication, product/catalog operations, checkout, orders, reviews, shipping workflows, and admin tools.

This README is designed to give recruiters and developers a complete view of what is in the project and what it took to build and operate it.

## Table of Contents

- [Project Overview](#project-overview)
- [What This Project Demonstrates](#what-this-project-demonstrates)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Security and Operational Concerns](#security-and-operational-concerns)
- [Deployment](#deployment)
- [Roadmap and Improvement Areas](#roadmap-and-improvement-areas)

## Project Overview

Sparkle Bows provides:

- A modern storefront for browsing products, managing cart state, and completing payments.
- Customer account workflows (auth, profile access, order history).
- An admin side for managing products, orders, and selected site settings.
- A backend API integrating third-party services for payments, shipping, media, and marketing operations.

The project reflects real-world ecommerce concerns: auth/session handling, payment flows, webhook processing, inventory-aware product management, and production-style API hardening.

## What This Project Demonstrates

- End-to-end full-stack development with separate client and server applications.
- Integration-heavy engineering (Stripe, Cloudinary, Shippo, email providers, analytics).
- Secure API design patterns with middleware for rate limiting, auth checks, and request sanitization.
- Operational readiness via logs, test coverage artifacts, containerization, and deployment documentation.

## Architecture

```text
Browser (React SPA)
	 |
	 | HTTPS / REST + JSON
	 v
Express API (Node.js)
	 |
	 +--> MongoDB (Mongoose models)
	 +--> Stripe (payments, tax, webhooks)
	 +--> Shippo (labels, shipping ops)
	 +--> Cloudinary (media uploads)
	 +--> Email providers (Resend/Nodemailer/SendGrid)
```

### Frontend and Backend Separation

- `client/` contains the React application and UI behavior.
- `server/` contains API routes, controllers, models, middleware, and integrations.
- Root-level scripts orchestrate both projects during local development.

## Tech Stack

### Frontend

- React 19
- React Router DOM 6
- Axios
- Tailwind CSS + PostCSS + Autoprefixer
- Stripe.js + React Stripe.js
- TanStack React Query
- Recharts
- DnD Kit

### Backend

- Node.js + Express
- MongoDB + Mongoose
- JWT auth + refresh tokens
- Helmet, CORS, express-rate-limit, express-mongo-sanitize
- Multer for upload handling
- Winston + Morgan logging
- Joi validation

### Integrations and Platforms

- Stripe (payments, tax, webhook fulfillment)
- Shippo (shipping label purchase/management)
- Cloudinary (media hosting)
- Resend / Nodemailer / SendGrid-compatible mail workflows
- Klaviyo (VIP/marketing capture)
- Google Analytics 4 / GTM support
- Docker container support for backend deployment

## Key Features

### Storefront

- Product listing and product-detail pages
- Cart management and checkout initiation
- Stripe checkout/payment flow
- Reviews and lead/contact capture flows
- SEO-aware frontend structure

### Customer Account

- Email/password and OAuth-driven auth routes
- Session and refresh-token handling
- Account-level access to user/order data

### Admin and Operations

- Product and order administration routes/components
- Shipping/fulfillment workflow integration through Shippo services
- Site settings and analytics-related configuration surfaces

### Backend API Surface (high-level)

- Auth, users, and admin management
- Product, cart, checkout, order, and review routes
- Contact and lead intake endpoints
- Stripe + Stripe webhook endpoints
- Upload/media handling routes

## Repository Structure

```text
sparkle-bows/
	client/                    React storefront
		src/
			components/            UI modules (storefront + admin views)
			pages/                 Route-level pages
			api/                   Axios config and API wrappers
			context/               Client state/context providers
			hooks/                 Reusable frontend hooks

	server/                    Express backend API
		routes/                  Route definitions by domain
		controllers/             Request handlers and orchestration
		models/                  Mongoose schemas/models
		middleware/              Auth, rate limits, logging, protections
		services/                External service integrations
		utils/                   Shared backend utilities
		tests/                   Jest + Supertest tests

	Dockerfile                 Container definition (backend)
	CONTAINER_DEPLOYMENT.md    Container deployment instructions
```

## Getting Started

### 1. Prerequisites

- Node.js 20+
- npm 9+
- MongoDB instance (local or hosted)
- Stripe account keys for payment flows

### 2. Install dependencies

From repository root:

```bash
npm ci --prefix client
npm ci --prefix server
```

### 3. Configure environment variables

- Create `server/.env` for backend variables.
- Create `client/.env` for `REACT_APP_*` variables.

See [Environment Variables](#environment-variables) below for common keys.

### 4. Run locally

From repository root:

```bash
# Start backend (nodemon)
npm run server:dev

# In another terminal, start frontend
npm run client
```

Default local behavior:

- Frontend: Create React App dev server
- Backend: Express server on configured `PORT` (commonly `3001`)

## Environment Variables

The exact set depends on enabled integrations. At minimum, backend requires connection/auth/payment basics.

### Backend core (common)

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
FRONTEND_URL=http://localhost:3000
```

### Backend integration variables (frequently used)

```env
# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Shippo
SHIPPO_API_TOKEN=

# Marketing / email
KLAVIYO_PRIVATE_KEY=
RESEND_API_KEY=
EMAIL_FROM=
```

### Frontend (examples)

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_...
REACT_APP_GOOGLE_OAUTH_ENABLED=true
```

For container-specific variable guidance, see [CONTAINER_DEPLOYMENT.md](CONTAINER_DEPLOYMENT.md).

## Available Scripts

### Root scripts

- `npm run client` - starts React development server (`client/`)
- `npm run client:build` - builds React app for production
- `npm run client:test` - runs frontend tests
- `npm run server` - starts backend via `node server.js`
- `npm run server:dev` - starts backend with nodemon
- `npm run server:test` - runs backend tests

### Server-only scripts (`server/package.json`)

- `npm start` - production server start
- `npm run dev` - nodemon development server
- `npm test` - Jest test suite with coverage
- `npm run test:email` - email workflow test script
- `npm run seed` - seed data script
- `npm run create-admin` - create admin account script

## Testing

### Frontend

```bash
npm run client:test
```

### Backend

```bash
npm run server:test
```

Backend tests are in `server/tests/` and include auth, products, reviews, and Stripe-related coverage.

## Security and Operational Concerns

- JWT-based auth with refresh-token flow
- Request hardening via Helmet and CORS strategy
- Route protection and rate limiting middleware
- Mongo query sanitization against injection payloads
- Server logging with Morgan and Winston
- Coverage and logs tracked under `coverage/`, `server/coverage/`, and `logs/`

## Deployment

### Containerized backend

This repository includes a root `Dockerfile` targeting the backend service. Basic flow:

```bash
docker build -t sparkle-bows-backend .
docker run --env-file server/.env -p 3001:3001 sparkle-bows-backend
```

Detailed deployment and variable requirements are documented in [CONTAINER_DEPLOYMENT.md](CONTAINER_DEPLOYMENT.md).

### Frontend deployment

The frontend (`client/`) can be built with:

```bash
npm run client:build
```

Then served on your host/CDN of choice. Ensure API origin and CORS settings match your production domains.

## Roadmap and Improvement Areas

- Expand API and integration test coverage for edge-case checkout/shipping scenarios
- Add CI pipeline status and automated deploy gates
- Add architecture diagrams and request-flow sequence documentation
- Add explicit `.env.example` files for client and server

## License

No license has been declared in the root package metadata yet. Add a LICENSE file and package metadata updates if this repository will be distributed publicly.
