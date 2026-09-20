# Truck Connect

A web-based logistics and job linking platform connecting truck drivers with cargo owners in Kenya.

Built as a Kabarak University BCS project using the **MERN stack** (MongoDB, Express, React, Node.js).

## Features

- **User Registration & Authentication** — JWT-secured login with driver/client roles
- **Profile Management** — Vehicle details for drivers, company info for cargo owners
- **Job Posting & Bidding** — Clients post cargo; drivers browse and bid in real time
- **Notifications** — Alerts for new jobs, bids, acceptances, and completions
- **Ratings & Feedback** — Post-job reviews to build trust on the platform

## Project Structure

```
truck-connect/
├── backend/          # Express API + MongoDB
├── frontend/         # React (Vite) SPA
└── documentation.docx
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) running locally, or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

## Getting Started

### 1. Backend

```bash
cd backend
cp .env.example .env   # Edit MONGODB_URI and JWT_SECRET if needed
npm install
npm run dev
```

The API runs at `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and proxies API requests to the backend.

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register (driver or client) |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| PUT | `/api/users/profile` | Update profile |
| POST | `/api/jobs` | Post a job (client) |
| GET | `/api/jobs` | List jobs |
| GET | `/api/jobs/:id` | Job detail + bids |
| POST | `/api/jobs/:id/bids` | Submit bid (driver) |
| PUT | `/api/jobs/:id/bids/:bidId/accept` | Accept bid (client) |
| PUT | `/api/jobs/:id/complete` | Mark job complete |
| GET | `/api/notifications` | User notifications |
| POST | `/api/reviews` | Submit review |

## Tech Stack

- **Frontend:** React 19, React Router, Axios, Vite
- **Backend:** Node.js, Express 5, Mongoose, JWT, bcryptjs
- **Database:** MongoDB

## Author

Tony Kiplimo Kibinge — Kabarak University, Department of Computer Science & IT
