# Bariwala – Rental & Local Marketplace Platform

A full-stack web application connecting **Landlords**, **Tenants**, and **Local Buyers/Sellers** into a single digital platform — built with **NestJS**, **Next.js**, and **PostgreSQL**.

---

## Tech Stack

| Layer      | Technology                                   |
|------------|----------------------------------------------|
| Frontend   | Next.js 16.1, React 19, Tailwind CSS 4       |
| Backend    | NestJS 11 (Node.js, TypeScript)              |
| Database   | PostgreSQL 14+                               |
| Auth       | JWT (passport-jwt, bcryptjs)                 |
| ORM        | TypeORM 0.3                                  |
| File Upload| Multer (max 5 images, 5 MB each)             |

---

## Project Structure

```
├── backend/                 # NestJS API server (port 3001)
│   ├── src/
│   │   ├── admin/           # Admin dashboard endpoints
│   │   ├── auth/            # JWT authentication & guards
│   │   ├── entities/        # TypeORM entities
│   │   ├── marketplace/     # Marketplace items CRUD
│   │   ├── messages/        # Real-time messaging
│   │   ├── payments/        # Payment simulation & invoices
│   │   ├── properties/      # Property CRUD + rental applications
│   │   ├── reports/         # User report system
│   │   ├── reviews/         # Reviews & ratings
│   │   ├── upload/          # File/image upload
│   │   └── main.ts          # App bootstrap
│   └── .env                 # Backend config
├── frontend/                # Next.js app (port 3000)
│   ├── src/
│   │   ├── app/             # Pages & dashboards
│   │   │   ├── dashboard/   # Role-based dashboards
│   │   │   │   ├── admin/   # Admin panel
│   │   │   │   ├── landlord/# Landlord dashboard
│   │   │   │   ├── tenant/  # Tenant dashboard
│   │   │   │   └── marketplace/ # Buyer/Seller dashboard
│   │   │   ├── login/       # Login page
│   │   │   ├── register/    # Registration page
│   │   │   ├── properties/  # Property listing & details
│   │   │   ├── marketplace/ # Marketplace listing & details
│   │   │   └── messages/    # Messaging interface
│   │   ├── components/      # Shared UI components
│   │   └── lib/             # API client, auth context, hooks
│   └── .env.local           # Frontend config
└── database/                # SQL schema & seed data
    ├── schema.sql           # Database DDL
    └── seed.sql             # Sample data
```

---

## Database Schema

| Table                | Description                                                  |
|----------------------|--------------------------------------------------------------|
| `users`              | User accounts (roles: landlord, tenant, buyer_seller, admin) |
| `properties`         | Rental property listings (flat, room, sublet)                |
| `rental_applications`| Tenant applications (pending → approved / rejected)          |
| `marketplace_items`  | Buy/sell items with category & condition                     |
| `messages`           | Direct messages between users                                |
| `payments`           | Payment records (bKash, Nagad, bank transfer, card)          |
| `reviews`            | Ratings & comments (1–5 stars)                               |

---

## Prerequisites

- **Node.js** v18+
- **PostgreSQL** v14+
- **npm** v9+

---

## Setup Instructions

### 1. Database Setup

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE bariwala;"

# Run the schema
psql -U postgres -d bariwala -f database/schema.sql

# (Optional) Load sample data
psql -U postgres -d bariwala -f database/seed.sql
```

### 2. Backend Setup

```bash
cd backend

# Configure environment — edit .env with your PostgreSQL credentials:
#   DB_HOST=localhost
#   DB_PORT=5432
#   DB_USERNAME=postgres
#   DB_PASSWORD=your_password
#   DB_NAME=bariwala
#   JWT_SECRET=your-secret-key

# Install dependencies
npm install

# Start the server (development)
npm run start:dev
```

The API will be available at **http://localhost:3001/api**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at **http://localhost:3000**

---

## API Endpoints

### Auth

| Method | Endpoint             | Auth | Description       |
|--------|----------------------|------|-------------------|
| POST   | `/api/auth/register` | —    | Register new user |
| POST   | `/api/auth/login`    | —    | Login             |
| GET    | `/api/auth/profile`  | JWT  | Get user profile  |

### Properties

| Method | Endpoint                                  | Auth | Description               |
|--------|-------------------------------------------|------|---------------------------|
| GET    | `/api/properties`                         | —    | List all (with filters)   |
| GET    | `/api/properties/my/listings`             | JWT  | My property listings      |
| GET    | `/api/properties/my/applications`         | JWT  | My rental applications    |
| GET    | `/api/properties/:id`                     | —    | Get single property       |
| POST   | `/api/properties`                         | JWT  | Create property           |
| PUT    | `/api/properties/:id`                     | JWT  | Update property           |
| DELETE | `/api/properties/:id`                     | JWT  | Delete property           |
| POST   | `/api/properties/:id/apply`               | JWT  | Apply for rental          |
| GET    | `/api/properties/:id/applications`        | JWT  | View applications         |
| PUT    | `/api/properties/applications/:id/status` | JWT  | Approve/reject application|

### Marketplace

| Method | Endpoint                      | Auth | Description        |
|--------|-------------------------------|------|--------------------|
| GET    | `/api/marketplace`            | —    | List items          |
| GET    | `/api/marketplace/my/items`   | JWT  | My marketplace items|
| GET    | `/api/marketplace/:id`        | —    | Get single item     |
| POST   | `/api/marketplace`            | JWT  | Create item         |
| PUT    | `/api/marketplace/:id`        | JWT  | Update item         |
| DELETE | `/api/marketplace/:id`        | JWT  | Delete item         |

### Messages

| Method | Endpoint                          | Auth | Description      |
|--------|-----------------------------------|------|------------------|
| POST   | `/api/messages`                   | JWT  | Send message     |
| GET    | `/api/messages/conversations`     | JWT  | Get conversations|
| GET    | `/api/messages/thread/:partnerId` | JWT  | Get message thread|
| GET    | `/api/messages/unread`            | JWT  | Unread count     |

### Payments

| Method | Endpoint                       | Auth | Description          |
|--------|--------------------------------|------|----------------------|
| POST   | `/api/payments`                | JWT  | Create payment       |
| GET    | `/api/payments`                | JWT  | My payments          |
| GET    | `/api/payments/:id`            | JWT  | Payment details      |
| GET    | `/api/payments/:id/invoice`    | JWT  | Download invoice     |
| PUT    | `/api/payments/:id/complete`   | JWT  | Simulate completion  |

### Reviews

| Method | Endpoint                            | Auth | Description            |
|--------|-------------------------------------|------|------------------------|
| POST   | `/api/reviews`                      | JWT  | Create review          |
| GET    | `/api/reviews/property/:propertyId` | —    | Reviews for property   |
| GET    | `/api/reviews/user/:userId`         | —    | Reviews for user       |
| GET    | `/api/reviews/user/:userId/average` | —    | Average rating for user|

### Reports

| Method | Endpoint               | Auth      | Description         |
|--------|------------------------|-----------|---------------------|
| POST   | `/api/reports`         | JWT       | Submit a report     |
| GET    | `/api/reports/my`      | JWT       | My reports          |
| GET    | `/api/reports`         | JWT+Admin | All reports         |
| GET    | `/api/reports/stats`   | JWT+Admin | Report statistics   |
| GET    | `/api/reports/pending` | JWT+Admin | Pending reports     |
| GET    | `/api/reports/:id`     | JWT+Admin | Single report       |
| PUT    | `/api/reports/:id`     | JWT+Admin | Update report status|

### Upload

| Method | Endpoint       | Auth | Description                              |
|--------|----------------|------|------------------------------------------|
| POST   | `/api/upload`  | JWT  | Upload images (max 5 files, 5 MB each)   |

### Admin (requires admin role)

| Method | Endpoint                        | Description                 |
|--------|---------------------------------|-----------------------------|
| GET    | `/api/admin/stats`              | Platform-wide statistics    |
| GET    | `/api/admin/users`              | List all users              |
| PUT    | `/api/admin/users/:id/toggle`   | Toggle user active status   |
| DELETE | `/api/admin/users/:id`          | Delete a user               |
| GET    | `/api/admin/properties`         | List all properties         |
| DELETE | `/api/admin/properties/:id`     | Delete a property           |
| GET    | `/api/admin/applications`       | List all applications       |
| GET    | `/api/admin/marketplace`        | List all marketplace items  |
| DELETE | `/api/admin/marketplace/:id`    | Delete a marketplace item   |
| GET    | `/api/admin/payments`           | List all payments           |
| GET    | `/api/admin/reports`            | List all reports            |
| PUT    | `/api/admin/reports/:id`        | Update report status & notes|
| GET    | `/api/admin/reviews`            | List all reviews            |
| DELETE | `/api/admin/reviews/:id`        | Delete a review             |

---

## Demo Accounts

After running `seed.sql`:

| Role         | Email                  | Password  |
|--------------|------------------------|-----------|
| Landlord     | riyanalam76@gmail.com  | 123456789 |
| Tenant       | tenant76@gmail.com     | 123456789 |
| Buyer/Seller | buyer76@gmail.com      | 123456789 |
|              |                        |           |

---

## Role-Based Dashboards

### Landlord Dashboard
- **Overview** — Summary of properties, applications, and earnings
- **My Properties** — View, edit, and manage property listings
- **Applications** — Review tenant applications and **approve/reject** them
- **Add Property** — Create new property listings with image upload
- **Payments** — Track rental payment history

### Tenant Dashboard
- **Overview** — Summary of applications and rental status
- **Applications** — Track submitted rental applications and their status
- **Payments** — View and manage rent payments

### Buyer/Seller Dashboard
- **Overview** — Marketplace activity summary
- **My Items** — Manage listed items for sale
- **Add Item** — Create new marketplace listings

### Admin Dashboard
- **Statistics** — Platform-wide stats and activity overview
- **User Management** — View, toggle active status, and delete users
- **Property Management** — Oversee all property listings
- **Application Management** — Monitor rental applications
- **Marketplace Management** — Oversee marketplace items
- **Payment Management** — View all payment records
- **Report Management** — Handle user reports (pending/resolved)
- **Review Management** — Moderate reviews and ratings

---

## Features

- ✅ User registration & login (Landlord / Tenant / Buyer-Seller / Admin)
- ✅ JWT-based authentication with role guards
- ✅ Property listing with filters (city, type, rent range)
- ✅ Property detail pages with reviews & ratings
- ✅ Rental application system (apply → approve / reject)
- ✅ Landlord application management (approve/reject tenant requests)
- ✅ Local marketplace (buy/sell items with category & condition filters)
- ✅ Direct messaging between users
- ✅ Payment simulation (bKash, Nagad, bank transfer, card)
- ✅ Invoice generation for payments
- ✅ Reviews & ratings (1–5 stars)
- ✅ User report system with admin moderation
- ✅ Image upload (multi-file, up to 5 images)
- ✅ Admin dashboard with full platform management
- ✅ Role-based dashboards (Landlord, Tenant, Buyer/Seller, Admin)
- ✅ Fully responsive UI (mobile-first Tailwind CSS)
- ✅ API response caching with automatic invalidation
- ✅ PostgreSQL with TypeORM (auto-sync)

---

## Scripts

### Backend

| Script             | Command                | Description                  |
|--------------------|------------------------|------------------------------|
| Development        | `npm run start:dev`    | Start with hot-reload        |
| Production build   | `npm run build`        | Compile TypeScript           |
| Production start   | `npm run start:prod`   | Run compiled output          |
| Lint               | `npm run lint`         | ESLint + auto-fix            |
| Test               | `npm run test`         | Run unit tests               |
| E2E Test           | `npm run test:e2e`     | Run end-to-end tests         |

### Frontend

| Script       | Command           | Description            |
|--------------|-------------------|------------------------|
| Development  | `npm run dev`     | Start dev server       |
| Build        | `npm run build`   | Production build       |
| Start        | `npm run start`   | Serve production build |
| Lint         | `npm run lint`    | ESLint                 |

---

