# Kost Management System

A full-stack web application for managing a boarding house (*kost*) business:
rooms, tenants, rentals, monthly billing, payment verification, complaints,
and reporting. Built as a Web Programming university project.

## Project Description

Owners and Admins manage rooms and tenants, check tenants in and out,
generate monthly bills, and verify payment proofs. Tenants log in to view
their current bill, upload payment proof, submit complaints, and track
their history — all through role-specific dashboards.

## Screenshots

_Add screenshots of the Login page, Owner Dashboard, Admin Dashboard, Tenant
Dashboard, Rooms page, and Payment verification flow here before submitting
your presentation._

## Features

- JWT authentication with bcrypt password hashing
- Role-based access control (OWNER / ADMIN / TENANT), enforced on the backend
- Room, tenant, and rental (check-in/check-out) management
- Monthly bill generation, one bill per rental per month
- Payment proof upload (Multer) with owner-only approval workflow
- Complaint submission and status tracking with full handling history
- Owner analytics dashboard (revenue trend, occupancy, payment status charts)
- Admin operational dashboard (no financial data)
- Tenant dashboard (current bill, payment history, complaint status)
- Search, filter, and pagination on all major list views
- Full audit trail via Activity Logs
- Responsive UI (desktop sidebar, mobile drawer)

## Roles and Permissions

| Action                         | Owner | Admin | Tenant |
|---------------------------------|:-----:|:-----:|:------:|
| View revenue reports            |  ✅   |  ❌   |   ❌   |
| Manage rooms                    |  ✅   |  ✅   |   ❌   |
| Create tenant accounts          |  ✅   |  ✅   |   ❌   |
| Check tenants in / out          |  ✅   |  ✅   |   ❌   |
| Generate bills                  |  ✅   |  ✅   |   ❌   |
| Approve / reject payments       |  ✅   |  ❌   |   ❌   |
| Manage complaint status         |  ✅   |  ✅   |   ❌   |
| View activity logs              |  ✅   |  ✅   |   ❌   |
| View own bill & upload payment  |  ❌   |  ❌   |   ✅   |
| Submit complaints               |  ❌   |  ❌   |   ✅   |

Public registration never allows choosing OWNER or ADMIN — tenant accounts
are created only by Owner/Admin from the Tenants page.

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, React Router, Axios, Recharts
**Backend:** Node.js, Express.js, REST API
**Database:** MySQL with Prisma ORM
**Auth:** JWT + bcrypt, Role-Based Access Control

## Project Architecture

```
kost-management-system/
├── server/                  # Express + Prisma backend
│   ├── controllers/         # HTTP request/response handling
│   ├── routes/               # Endpoint definitions
│   ├── middleware/           # auth, RBAC, upload, rate limiting, errors
│   ├── services/              # business logic (transactions live here)
│   ├── validators/            # request body validation
│   ├── utils/                  # shared helpers (AppError, apiResponse, ...)
│   ├── prisma/
│   │   ├── schema.prisma       # database schema
│   │   └── seed.js             # demo data seeding
│   ├── uploads/                # payment proofs & complaint images
│   ├── app.js                   # Express app (middleware + routes)
│   └── server.js                # entry point
└── client/                   # React + Vite frontend
    └── src/
        ├── components/         # common / dashboard / forms / tables
        ├── layouts/             # OwnerLayout, AdminLayout, TenantLayout
        ├── pages/                # auth / owner / admin / tenant / shared
        ├── services/              # Axios API calls, one file per resource
        ├── context/                # AuthContext, ToastContext
        ├── routes/                  # ProtectedRoute
        └── utils/                    # formatting helpers
```

Separation of concerns on the backend: **routes** define endpoints only,
**controllers** translate HTTP <-> service calls, **services** hold the
actual business logic (including Prisma transactions), and **middleware**
handles cross-cutting concerns like auth and file validation.

## Database Setup

1. Install and start MySQL locally (or use a container).
2. Create a database:
   ```sql
   CREATE DATABASE kost_management;
   ```

## Environment Variables

Copy the example env files and fill in your own values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**server/.env**
```
DATABASE_URL="mysql://root:password@localhost:3306/kost_management"
JWT_SECRET="replace-this-with-a-long-random-secret"
JWT_EXPIRES_IN="1d"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

**client/.env**
```
VITE_API_URL=http://localhost:5000/api
```

`JWT_SECRET` and database credentials are never sent to the frontend.

## Installation

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

## Migration

```bash
cd server
npx prisma migrate dev --name init
```

This creates all tables (User, Room, Tenant, Rental, Bill, Payment,
Complaint, ComplaintUpdate, ActivityLog) from `prisma/schema.prisma`.

## Seeding

```bash
cd server
npm run seed
```

Generates realistic Indonesian demo data: 1 Owner, 2 Admins, 12+ Tenants,
18 Rooms, active and completed rentals, bills in various states, payments
(approved/pending/unpaid), and sample complaints — so every dashboard has
meaningful data immediately.

## Running

**Backend** (from `server/`):
```bash
npm run dev      # nodemon, http://localhost:5000
```

**Frontend** (from `client/`):
```bash
npm run dev       # http://localhost:5173
```

Open `http://localhost:5173` and log in with one of the demo accounts below.

## Demo Accounts

All demo accounts use the password: **`password123`**

| Role   | Email                       |
|--------|------------------------------|
| Owner  | owner@kostdemo.local          |
| Admin  | admin@kostdemo.local           |
| Tenant | tenant@kostdemo.local            |

These are development-only credentials generated by the seed script — never
used in a production deployment.

## API Overview

Base path: `/api`

| Resource    | Endpoints |
|-------------|-----------|
| Auth        | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Rooms       | `GET /rooms`, `GET /rooms/:id`, `POST /rooms`, `PUT /rooms/:id`, `PATCH /rooms/:id/status` |
| Tenants     | `GET /tenants`, `GET /tenants/:id`, `POST /tenants`, `PUT /tenants/:id` |
| Rentals     | `GET /rentals`, `POST /rentals`, `POST /rentals/:id/checkout` |
| Bills       | `GET /bills`, `GET /bills/:id`, `POST /bills/generate` |
| Payments    | `GET /payments`, `POST /payments` (multipart, proof upload), `PATCH /payments/:id/approve`, `PATCH /payments/:id/reject` |
| Complaints  | `GET /complaints`, `GET /complaints/:id`, `POST /complaints` (multipart), `PATCH /complaints/:id/status` |
| Reports     | `GET /reports/revenue`, `GET /reports/occupancy`, `GET /reports/payments` (Owner only) |
| Activity    | `GET /activity-logs` (Owner/Admin) |
| Dashboard   | `GET /dashboard/owner`, `GET /dashboard/admin`, `GET /dashboard/tenant` |

All responses follow:
```json
{ "success": true, "message": "...", "data": {} }
```
or
```json
{ "success": false, "message": "..." }
```

## Business Rules Enforced (Backend)

- A tenant cannot have two ACTIVE rentals at once.
- Room capacity cannot be exceeded; room status updates automatically.
- A bill cannot be duplicated for the same rental and month (DB unique constraint + service check).
- Rentals store a **price snapshot** at check-in, so later room price changes never rewrite history.
- A payment cannot be approved or rejected twice.
- Only the owning tenant can upload proof for their own bill (IDOR-safe).
- Multi-step operations (check-in, checkout, payment approval) run inside `prisma.$transaction`.
- All state-changing actions are recorded to `ActivityLog`.

## Development Commands Summary

```bash
# server/
npm run dev              # start API in watch mode
npm run prisma:migrate   # run a new migration
npm run seed              # reseed demo data
npm run prisma:studio    # inspect the database visually

# client/
npm run dev               # start Vite dev server
npm run build              # production build
```
