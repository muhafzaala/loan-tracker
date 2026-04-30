# Loan Tracker — MERN FinTech App
**Roll No: 5533** | Web Programming Assignment

A full-stack loan tracking app with trend analysis, EMI calculation, and repayment visualization.

---

## Tech Stack

| Layer      | Tech                              |
|------------|-----------------------------------|
| Frontend   | React 18 (Vite), Recharts, Axios  |
| Backend    | Node.js, Express 4                |
| Database   | MongoDB Atlas (Mongoose 7)        |
| Auth       | bcryptjs + JWT                    |

---

## Setup Instructions

### 1. Clone the repo

```bash
git clone <repo-url>
cd loan-tracker
```

### 2. Backend setup

```bash
cd server
npm install
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET in .env
npm run dev
```

### 3. Frontend setup

```bash
cd ../client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`.

---

## Folder Structure

```
/client          ← React app (Vite)
  /src
    /components  ← Sidebar, LoanCard, TrendChart, PaymentModal, ProtectedRoute
    /pages       ← Home, Auth, Dashboard, LoanDetail
    /utils       ← api.js, loanCalculations.js
    /context     ← AuthContext.jsx

/server          ← Express API
  /models        ← User.js, Loan.js
  /routes        ← auth.js, loans.js, analytics.js
  /middleware    ← authMiddleware.js, validateInput.js
  server.js
```

---

## Key Features

- **EMI Calculation**: `EMI = P × r × (1+r)^n / ((1+r)^n − 1)`
- **Repayment Trend Chart**: Actual vs expected cumulative payment curve
- **Interest Accumulation**: How much interest paid vs remaining
- **Auto Status Update**: Active → Overdue/Completed based on real data
- **Trend Summary Card**: Active loans, outstanding principal, avg repayment rate (last 3 months)
- **JWT Auth**: Tokens stored in localStorage, persisted on refresh
- **Two MongoDB Queries**:
  1. Aggregation pipeline: monthly payment totals grouped by month
  2. Filter + sort: loans filtered by status, sorted by startDate descending

---

## Database Design Note

`userId` is stored as a reference in the `loans` collection (referencing), not embedded in the user document. This is the right call because:
- A user can have many loans — embedding would cause the user document to grow unbounded
- Loans are queried independently (filter by status, date range) — referencing allows efficient indexing
- Payment history is embedded *inside* each loan (not a separate collection) because payments are always accessed together with the loan and don't need independent queries

---

## Deployment

| Service   | Platform           |
|-----------|--------------------|
| Frontend  | Vercel / Netlify   |
| Backend   | Render / Railway   |
| Database  | MongoDB Atlas      |

For Vercel frontend: set `VITE_API_URL` env variable if deploying backend separately (update `api.js` baseURL).
