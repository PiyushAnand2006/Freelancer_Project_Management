# FreeLanceFlow - Freelancer Project Management Platform

A sophisticated, full-stack platform for freelancers and clients to collaborate on high-impact projects.

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Framer Motion, Recharts
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: Oracle SQL with TypeORM
- **Auth**: JWT with bcrypt password hashing

## Features

- **Dynamic Dashboards**: Role-specific mission control for Clients and Freelancers.
- **Project Marketplace**: Advanced search and filtering for open projects.
- **Bidding System**: Real-time proposal submission and acceptance.
- **Contract Management**: Milestone tracking and automated invoicing.
- **Real-time Messaging**: Socket.io powered chat within contracts.
- **Responsive Design**: Polished UI with glassmorphism and smooth animations.

## Getting Started

1. **Database Setup**:
   - Ensure an Oracle Database is provisioned and running.
   - Configure the connection string in your `.env` file based on `.env.example`.
   - The application uses TypeORM for schema management and entities mapping.

2. **Environment Variables**:
   - Configure `JWT_SECRET` and `DATABASE_URL` in your environment.
   - (Optional) Configure Cloudinary and Nodemailer for extra features.

3. **Running the App**:
   - Development: `npm run dev`
   - Production: `npm run build && npm start`

## Schema Overview

The platform uses a relational Oracle SQL schema including Users, Profiles, Projects, Proposals, Contracts, Milestones, and Messages. Managed cleanly with TypeORM.
