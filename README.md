<div align="center">

<img src="https://img.shields.io/badge/version-1.0.0-0f172a?style=flat-square" />
<img src="https://img.shields.io/badge/status-active-22c55e?style=flat-square" />
<img src="https://img.shields.io/badge/license-ISC-6366f1?style=flat-square" />

<br/><br/>

# 💰 Loan Tracker

### Full-Stack Loan Management & Repayment Analytics Platform

<br/>

[![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js_Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![JWT](https://img.shields.io/badge/JWT_Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Recharts](https://img.shields.io/badge/Recharts-FF6B6B?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://recharts.org)

<br/>

> Track multiple loans · Log repayments · Visualise amortization progress · Analyse trends
>
> A production-ready MERN stack application with JWT authentication, MongoDB aggregation pipelines,
> reducing-balance EMI calculations, and interactive Recharts visualisations.

<br/>

**[⚡ Quick Start](#-quick-start)** &nbsp;·&nbsp; **[✨ Features](#-features)** &nbsp;·&nbsp; **[🏗️ Architecture](#%EF%B8%8F-architecture)** &nbsp;·&nbsp; **[🗺️ API Reference](#%EF%B8%8F-api-reference)** &nbsp;·&nbsp; **[🗄️ Database](#%EF%B8%8F-database-schema)** &nbsp;·&nbsp; **[📬 Contact](#-contact)**

</div>

---

## 📌 Overview

**Loan Tracker** is a personal finance tool designed for individuals who manage one or more loans and want precise, data-driven visibility into their repayment progress. The application computes EMIs using the standard reducing-balance formula, auto-determines loan status, and surfaces analytics covering monthly payment trends, repayment rate against schedule, and interest accumulation breakdowns.

```
loan-tracker/
├── 🖥️  server/    — Express.js REST API · MongoDB Atlas · JWT Auth
└── 🎨  client/    — React 18 SPA · Vite · Recharts
```

---

## ✨ Features

### 🔐 Authentication

| Feature | Detail |
|---|---|
| 📝 **User Registration** | Name, email, and password with server-side validation. Passwords hashed with bcryptjs (12 salt rounds). |
| 🔑 **Login** | Email and password verified against bcrypt hash. Returns a signed JWT on success. |
| 🕐 **JWT Sessions** | Tokens expire after 7 days. All protected routes require `Authorization: Bearer <token>`. |
| 🛡️ **Protected Routes** | React `ProtectedRoute` component redirects unauthenticated users to `/auth`. Server routes gated by `authMiddleware`. |
| ✅ **Input Validation** | `validateSignupInput` middleware enforces name presence, valid email format, and minimum 6-character password. |

---

### 💳 Loan Management

**➕ Creating a Loan**

Each loan requires a title, principal amount, annual interest rate, tenure in months, and a start date. The server validates all five fields before persisting.

**📋 Loan Fields**

| Field | Type | Constraints |
|---|---|---|
| `loanTitle` | `String` | Required, non-empty |
| `principal` | `Number` | Must be > 0 |
| `interestRate` | `Number` | Must be > 0 (annual %) |
| `tenureMonths` | `Number` | Must be ≥ 1 |
| `startDate` | `Date` | Must be a valid date |
| `amountPaid` | `Number` | Cumulative, starts at 0 |
| `status` | `Enum` | `active` · `completed` · `overdue` |
| `payments` | `Array` | Embedded payment sub-documents |

**⚙️ Automatic Status Computation**

After every payment, the server recalculates loan status using the following logic:

```
totalOwed = principal + totalInterest  (reducing-balance formula)
endDate   = startDate + tenureMonths

if amountPaid >= totalOwed  →  ✅  "completed"
if now > endDate            →  ⚠️  "overdue"
else                        →  🔵  "active"
```

**💸 Recording Payments**

Payments are appended to the embedded `payments` array. `amountPaid` is recalculated as the sum of all payments. Status is recomputed and the document is saved atomically.

---

### 📊 Dashboard

The main application screen after login.

| Section | Description |
|---|---|
| 📈 **Summary Cards** | Total active loans · outstanding principal · avg repayment rate (last 3 months) · total loan count |
| 🔽 **Status Filters** | One-click filter tabs: All / Active / Completed / Overdue |
| 🃏 **Loan Cards** | Title · principal · interest rate · tenure · paid amount · status badge · payment trigger |
| ➕ **Add Loan Form** | Inline form to create a new loan with field-level API error messages |
| 📉 **Monthly Trend Chart** | Bar chart (Recharts) of total payments per calendar month — powered by MongoDB aggregation |

---

### 🔍 Loan Detail

A dedicated page for each loan, accessible by clicking into a loan card.

| Section | Description |
|---|---|
| 📄 **Loan Metadata** | Title · principal · interest rate · tenure · start/end dates · status badge |
| 💵 **EMI Display** | Monthly EMI computed client-side via reducing-balance formula |
| 📊 **Progress Bar** | Visual percentage of total amount owed that has been repaid |
| 🕐 **Schedule Status** | Whether the borrower is ahead of or behind the expected repayment schedule |
| 📐 **Interest Breakdown** | Total interest payable · interest paid · interest remaining |
| 📈 **Repayment Trend Chart** | Line chart: actual cumulative payments vs expected EMI schedule over full tenure |
| 🧾 **Payment History** | Chronological list of all recorded payments with date and amount |
| ➕ **Record Payment** | Opens the payment modal to log a new repayment |

---

### 📡 Analytics

Two server-side analytics endpoints power the dashboard and loan detail views.

**📅 Monthly Trend** — `GET /api/analytics/trend`

A MongoDB aggregation pipeline that:

1. `$match` — loans belonging to the authenticated user
2. `$unwind` — expands the embedded `payments` array
3. `$group` — groups by year + month, sums amounts, counts payments
4. `$sort` — orders results chronologically
5. `$project` — produces a human-readable label (e.g. `Jan 2026`)

**📋 Summary** — `GET /api/analytics/summary`

Computes four metrics server-side:

- 🔵 Total active loans (filter + sort query)
- 💰 Total outstanding principal (`principal − amountPaid` across active loans)
- 📊 Average repayment rate — actual vs expected EMI payments over last 3 months (%)
- 🔢 Total loan count across all statuses

---

### 🧮 Financial Calculations

All loan mathematics are encapsulated in `src/utils/loanCalculations.js`.

**EMI Formula — Reducing Balance**

```
        P × r × (1 + r)ⁿ
EMI =  ─────────────────
           (1 + r)ⁿ − 1

  P  =  Principal
  r  =  Monthly interest rate  ( annual rate ÷ 100 ÷ 12 )
  n  =  Tenure in months
```

**📦 Exported Functions**

| Function | Returns |
|---|---|
| `calculateEMI(principal, rate, tenure)` | Monthly EMI amount |
| `getTotalInterest(principal, rate, tenure)` | Total interest over full tenure |
| `getLoanStatus(loan)` | `'active'` · `'completed'` · `'overdue'` |
| `getRepaymentTrend(loan)` | Month-by-month array: expected vs actual cumulative payments |
| `getInterestAccumulation(loan)` | `{ totalInterest, interestPaid, interestRemaining }` |
| `isAheadOfSchedule(loan)` | `Boolean` — `amountPaid` ≥ expected cumulative EMI to date |

---

### 🧩 Components

| Component | Description |
|---|---|
| `🗂️ Sidebar` | Navigation sidebar with route links, user display, and logout |
| `🃏 LoanCard` | Summary card for a single loan with status badge and payment trigger |
| `💳 PaymentModal` | Modal overlay for recording a payment. Validates amount and calls the API. |
| `📈 TrendChart` | `MonthlyPaymentBarChart` (dashboard) · `RepaymentTrendChart` (loan detail) — Recharts |
| `🔒 ProtectedRoute` | HOC that reads `AuthContext` and redirects unauthenticated users |

---

## 🏗️ Architecture

### 🗺️ System Diagram

```
┌──────────────────────────────────────────────────────┐
│                  Browser (React SPA)                  │
│                                                       │
│  React Router DOM v6                                  │
│    /              →  🏠 Home                          │
│    /auth          →  🔐 Login / Register              │
│    /dashboard     →  📊 Dashboard        (protected)  │
│    /loan/:id      →  🔍 Loan Detail      (protected)  │
│                                                       │
│  🔄 Axios (apiClient)                                 │
│       └── Authorization: Bearer <JWT>                 │
│                                                       │
│  🗝️ AuthContext → token + user in localStorage        │
└────────────────────────┬─────────────────────────────┘
                         │  HTTP / REST
┌────────────────────────▼─────────────────────────────┐
│               ⚙️ Express.js Server                    │
│                                                       │
│   /api/auth       →  signup · login                   │
│   /api/loans      →  CRUD · payments  (JWT required)  │
│   /api/analytics  →  trend · summary  (JWT required)  │
│                                                       │
│   🛡️ authMiddleware  →  jwt.verify()  →  req.userId   │
└────────────────────────┬─────────────────────────────┘
                         │  Mongoose ODM
┌────────────────────────▼─────────────────────────────┐
│              🍃 MongoDB Atlas                         │
│    collections:  users  ·  loans                      │
└──────────────────────────────────────────────────────┘
```

### 🔐 Authentication Flow

```
Client                              Server
  │                                   │
  │── POST /api/auth/signup ─────────▶│
  │                                   │  ✅ validateSignupInput
  │                                   │  🔒 bcrypt.hash(password, 12)
  │                                   │  💾 User.create(...)
  │                                   │  🔑 jwt.sign({ userId }, secret, 7d)
  │◀─ { token, user } ────────────────│
  │
  │── POST /api/auth/login ──────────▶│
  │                                   │  🔍 User.findOne({ email })
  │                                   │  🔒 bcrypt.compare(password, hash)
  │                                   │  🔑 jwt.sign({ userId }, secret, 7d)
  │◀─ { token, user } ────────────────│
  │
  │── GET /api/loans ────────────────▶│
  │   Authorization: Bearer <jwt>     │  🛡️ authMiddleware
  │                                   │  ✅ jwt.verify(token)
  │                                   │  📌 req.userId = decoded.userId
  │◀─ { data: [...loans] } ───────────│
```

---

## 🗄️ Database Schema

### 👤 `users` Collection

| Field | Type | Constraints |
|---|---|---|
| `name` | `String` | Required, trimmed |
| `email` | `String` | Required · unique · lowercase · trimmed |
| `password` | `String` | Required — bcrypt hash stored, **never plaintext** |
| `createdAt` | `Date` | Auto-generated |
| `updatedAt` | `Date` | Auto-updated |

### 💳 `loans` Collection

| Field | Type | Constraints |
|---|---|---|
| `userId` | `ObjectId` | FK → `users._id`, required |
| `loanTitle` | `String` | Required, trimmed |
| `principal` | `Number` | Required, min: 1 |
| `interestRate` | `Number` | Required, min: 0.01 (annual %) |
| `tenureMonths` | `Number` | Required, min: 1 |
| `startDate` | `Date` | Required |
| `amountPaid` | `Number` | Default: 0 · updated on each payment |
| `status` | `String` | Enum: `active` · `completed` · `overdue` |
| `payments` | `Array` | Embedded sub-documents ↓ |
| `createdAt` | `Date` | Auto-generated |
| `updatedAt` | `Date` | Auto-updated |

**💸 Embedded Payment Sub-document**

| Field | Type | Description |
|---|---|---|
| `date` | `Date` | Defaults to `Date.now` at insertion |
| `amount` | `Number` | Required, must be positive |

---

## 🗺️ API Reference

**Base URL:** `http://localhost:5000/api`

All responses use the standard envelope format:
```json
{ "success": true,  "data": { ... } }
{ "success": false, "message": "Descriptive error message" }
```

> 🔒 **Protected routes** require: `Authorization: Bearer <token>`

---

### 🔐 Authentication

#### `POST /api/auth/signup` — Register a new user

```json
// Request Body
{
  "name": "Muhammad Afzaal Asghar",
  "email": "user@example.com",
  "password": "password123"
}

// Success 201
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": { "id": "...", "name": "Muhammad Afzaal Asghar", "email": "user@example.com" }
  }
}
```

| Status | Reason |
|---|---|
| `201` | User created successfully |
| `400` | Validation failure |
| `409` | Email already in use |
| `500` | Server error |

---

#### `POST /api/auth/login` — Authenticate an existing user

```json
// Request Body
{ "email": "user@example.com", "password": "password123" }

// Success 200 — same shape as signup response
```

| Status | Reason |
|---|---|
| `200` | Login successful |
| `400` | Missing fields |
| `401` | Invalid credentials |
| `500` | Server error |

---

### 💳 Loans — 🔒 Protected

#### `GET /api/loans` — Fetch all loans

Optional query: `?status=active|completed|overdue`

```json
// Success 200
{ "success": true, "data": [ { ...loanObject }, ... ] }
```

---

#### `GET /api/loans/:id` — Fetch a single loan

Returns `404` if loan does not belong to the authenticated user.

---

#### `POST /api/loans` — Create a new loan

```json
// Request Body
{
  "loanTitle": "Home Renovation",
  "principal": 500000,
  "interestRate": 12.5,
  "tenureMonths": 24,
  "startDate": "2026-01-01"
}
```

| Status | Reason |
|---|---|
| `201` | Loan created |
| `400` | Title required · Principal must be positive · Rate must be > 0 · Tenure ≥ 1 · Valid start date |
| `500` | Server error |

---

#### `PUT /api/loans/:id/payment` — Record a repayment

Appends to `payments` array · recalculates `amountPaid` · recomputes `status`.

```json
// Request Body
{ "amount": 25000 }

// Success 200 — returns updated loan document
```

| Status | Reason |
|---|---|
| `200` | Payment recorded |
| `400` | Invalid amount |
| `404` | Loan not found |
| `500` | Server error |

---

### 📡 Analytics — 🔒 Protected

#### `GET /api/analytics/trend` — Monthly payment trend

```json
// Success 200
{
  "success": true,
  "data": [
    { "year": 2026, "month": 1, "totalPaid": 75000, "paymentCount": 3, "label": "Jan 2026" },
    { "year": 2026, "month": 2, "totalPaid": 82000, "paymentCount": 4, "label": "Feb 2026" }
  ]
}
```

---

#### `GET /api/analytics/summary` — Portfolio summary

```json
// Success 200
{
  "success": true,
  "data": {
    "totalActiveLoans": 2,
    "totalOutstandingPrincipal": 850000,
    "avgRepaymentRate": 94,
    "totalLoans": 5
  }
}
```

---

## 📁 Project Structure

```
loan-tracker/
│
├── 🖥️ server/
│   ├── server.js                   # Express app — MongoDB, middleware, route mounts
│   ├── package.json                # ESM · express · mongoose · bcryptjs · jwt · dotenv
│   ├── .env                        # 🔒 MONGO_URI · JWT_SECRET · PORT
│   │
│   ├── 📐 models/
│   │   ├── User.js                 # Mongoose User schema
│   │   └── Loan.js                 # Mongoose Loan schema + embedded payments
│   │
│   ├── 🛣️ routes/
│   │   ├── auth.js                 # POST /signup · POST /login
│   │   ├── loans.js                # GET / · GET /:id · POST / · PUT /:id/payment
│   │   └── analytics.js            # GET /trend · GET /summary
│   │
│   └── 🛡️ middleware/
│       ├── authMiddleware.js       # JWT verification → req.userId
│       └── validateInput.js        # validateLoanInput · validatePaymentInput · validateSignupInput
│
└── 🎨 client/
    ├── index.html
    ├── package.json                # React 18 · React Router · Axios · Recharts · Vite
    ├── vite.config.js
    │
    └── src/
        ├── App.jsx                 # Routes · ProtectedRoute · loading gate
        ├── main.jsx                # React DOM entry · BrowserRouter · AuthProvider
        ├── index.css               # CSS variables · base styles
        │
        ├── 🔑 context/
        │   └── AuthContext.jsx     # user · token · login · logout · localStorage
        │
        ├── 📄 pages/
        │   ├── Home.jsx            # Landing page
        │   ├── Auth.jsx            # Login / Register toggle
        │   ├── Dashboard.jsx       # Summary · filters · loan grid · trend chart
        │   └── LoanDetail.jsx      # EMI · progress · charts · payment history
        │
        ├── 🧩 components/
        │   ├── Sidebar.jsx         # Navigation · user info · logout
        │   ├── LoanCard.jsx        # Loan card with status badge
        │   ├── PaymentModal.jsx    # Payment recording overlay
        │   ├── TrendChart.jsx      # MonthlyPaymentBarChart + RepaymentTrendChart
        │   └── ProtectedRoute.jsx  # Auth guard
        │
        └── 🔧 utils/
            ├── api.js              # Axios instance + JWT interceptor
            └── loanCalculations.js # calculateEMI · getTotalInterest · getRepaymentTrend · …
```

---

## ⚡ Quick Start

### 📋 Prerequisites

- Node.js 18+
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (or local MongoDB instance)

### Step 1 — Clone the Repository

```bash
git clone https://github.com/muhafzaala/loan-tracker.git
cd loan-tracker/loan-tracker
```

### Step 2 — Configure Environment Variables

Create or update `server/.env`:

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_strong_secret_here
PORT=5000
```

> ⚠️ **Security Note:** The `.env` file in this repository contains development credentials. Replace all values before deploying or making the repository public.

### Step 3 — Start the Server

```bash
cd server
npm install
npm run dev      # nodemon — auto-restarts on changes
# or
npm start        # node — production mode
```

Server running at → `http://localhost:5000`

### Step 4 — Start the Client

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Client running at → `http://localhost:5173`

---

## 📜 Available Scripts

### 🖥️ Server

| Command | Description |
|---|---|
| `npm start` | Start with `node server.js` |
| `npm run dev` | Start with `nodemon` — auto-restarts on file changes |

### 🎨 Client

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |

---

## 🚀 Deployment

### 🌐 Client — Vercel / Netlify

```bash
cd client && npm run build
# Deploy the dist/ folder
```

Add `vercel.json` for SPA routing:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Set the API environment variable:
```
VITE_API_URL=https://your-backend-domain.com/api
```

Update `src/utils/api.js` to use `import.meta.env.VITE_API_URL` as the Axios base URL.

### ☁️ Server — Railway / Render

| Setting | Value |
|---|---|
| Root directory | `loan-tracker/server` |
| Start command | `npm start` |
| `MONGO_URI` | Your Atlas connection string |
| `JWT_SECRET` | A strong random secret |
| `PORT` | `5000` (or platform-assigned) |

---

## 🔮 Potential Enhancements

| Enhancement | Description |
|---|---|
| 📄 **PDF / CSV Export** | Export loan reports and payment history |
| 📧 **Email Reminders** | Automated EMI due date notifications |
| 💱 **Multi-Currency** | Support PKR, USD, EUR and other currencies |
| 📊 **Loan Comparison** | Side-by-side comparison of two or more loans |
| 🔢 **Prepayment Calculator** | Model the impact of lump-sum prepayments |
| 👥 **Admin Panel** | Multi-user visibility for financial advisors |

---

## 📬 Contact

<div align="center">

Developed by **Muhammad Afzaal Asghar**

[![Email](https://img.shields.io/badge/Email-mafzaala333%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:mafzaala333@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-muhafzaala-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/muhafzaala)

<br/>

For questions, issues, or contributions — open an [issue](https://github.com/muhafzaala/loan-tracker/issues) or reach out directly at **mafzaala333@gmail.com**

<br/>

---

⭐ **If this project was useful, consider giving it a star on GitHub.**

*Built with React, Express.js, MongoDB, and a focus on financial clarity.*

</div>
