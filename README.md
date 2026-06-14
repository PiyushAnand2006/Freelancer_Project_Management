# FreeLanceFlow

FreeLanceFlow is a full-stack local demo for a freelancer project management system. It follows the final report's Chapter 5 MySQL model with seven core tables: users, projects, proposals, contracts, milestones, invoices, and payments.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, Framer Motion, Recharts, lucide-react
- Backend: Node.js, Express, TypeScript, JWT, bcryptjs, mysql2
- Database: MySQL

## Setup

1. Install dependencies:

```bash
npm.cmd install
```

2. Create a MySQL database and run the SQL scripts:

```sql
SOURCE database/schema.sql;
SOURCE database/seed.sql;
```

3. Configure the backend:

```bash
copy server\.env.example server\.env
```

Update `server/.env` with your MySQL username/password.

4. Start the app:

```bash
npm.cmd run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## Demo Accounts

- Client: `arjun@email.com` / `password123`
- Freelancer: `priya@email.com` / `password123`
- Admin: `admin@freelanceflow.local` / `password123`

