# BookMyShow Clone — MERN Foundation (Phase 0)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-22%20LTS-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38bdf8.svg)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-emerald.svg)](https://mongoosejs.com/)

> **Disclaimer:** This is an educational clone project developed strictly for learning and software architecture demonstration purposes. It is not affiliated with, endorsed by, or associated in any way with **BookMyShow** or **Bigtree Entertainment Pvt. Ltd.**

---

## 📌 Project Overview

**BookMyShow-Clone** is a modern, modular, production-ready full-stack application recreating the core entertainment ticketing experience using the **MERN (MongoDB, Express, React, Node.js)** stack.

This repository represents **Phase 0: Architectural Foundation & Tooling**. In this phase, the core development environment, decoupled project structure, build pipelines, linting configurations, backend health endpoints, database connection with graceful shutdown, and client-side routing are completely established.

---

## 🛠 Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) | High-performance SPA with instant HMR and ES Modules |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Modern utility-first CSS design system |
| **Routing** | [React Router DOM](https://reactrouter.com/) | Declarative client-side routing with shared layout |
| **Backend** | [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) | Modular RESTful API architecture (ESM) |
| **Database** | [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) | Schema-based document persistence with connection lifecycle |
| **Runtime** | Node.js 22 LTS (ES Modules) | Standardized JavaScript runtime |
| **Dev Tools** | [Nodemon](https://nodemon.io/), [ESLint 9](https://eslint.org/), [Prettier 3](https://prettier.io/) | Automated dev reloading, linting, and formatting |

---

## 📂 Repository Structure

```text
BookMyShow-Clone/
├── frontend/
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── assets/             # Brand logos & imagery
│   │   ├── components/         # Reusable UI elements (Navbar, Footer, etc.)
│   │   ├── hooks/              # Custom React hooks (useApiHealth, etc.)
│   │   ├── layouts/            # Shared route layouts (MainLayout)
│   │   ├── pages/              # Route views (HomePage, LoginPage, RegisterPage, NotFoundPage)
│   │   ├── routes/             # AppRoutes centralized route definitions
│   │   ├── services/           # Axios/Fetch API client and health services
│   │   ├── utils/              # Application constants & configuration
│   │   ├── App.jsx             # Root application component with BrowserRouter
│   │   ├── index.css           # Tailwind base styles and custom theme tokens
│   │   └── main.jsx            # React 19 DOM entrypoint
│   ├── .prettierrc             # Prettier styling configuration
│   ├── eslint.config.js        # ESLint 9 Flat Configuration
│   ├── index.html              # HTML shell with Google Fonts & metadata
│   ├── package.json            # Frontend dependencies & scripts
│   └── vite.config.js          # Vite config with Tailwind plugin & API proxy
│
├── backend/
│   ├── config/
│   │   └── db.js               # Asynchronous MongoDB connector & graceful shutdown
│   ├── controllers/            # Scaffold for route controllers (.gitkeep)
│   ├── middleware/             # Express middlewares (errorHandler, notFoundHandler)
│   ├── models/                 # Scaffold for Mongoose models (.gitkeep)
│   ├── routes/
│   │   ├── health.js           # GET /api/health endpoint
│   │   └── index.js            # Centralized API route registration
│   ├── services/               # Scaffold for business logic services (.gitkeep)
│   ├── utils/                  # Backend utilities (logger.js)
│   ├── .env                    # Local environment variables (ignored by git)
│   ├── .prettierrc             # Prettier styling configuration
│   ├── app.js                  # Express application setup (CORS, parsers, routes)
│   ├── eslint.config.js        # ESLint 9 configuration
│   ├── package.json            # Backend dependencies & scripts
│   └── server.js               # Entrypoint: loads env, connects DB, starts listener
│
├── .env.example                # Sample environment variables template
├── .gitignore                  # Git ignore rules for node_modules, build, env
└── README.md                   # Project documentation
```

---

## ⚙️ Environment Setup

1. Copy `.env.example` to `backend/.env` (and optionally root `.env`):
   ```bash
   cp .env.example backend/.env
   ```

2. Configure the environment variables:
   ```ini
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/bookmyshow_clone
   JWT_SECRET=replace_this_later
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```

> **Note:** If you are using MongoDB Atlas instead of a local MongoDB daemon, set `MONGODB_URI` to your MongoDB Atlas connection string (e.g. `mongodb+srv://<user>:<password>@cluster0.mongodb.net/bookmyshow_clone?retryWrites=true&w=majority`).

---

## 🚀 Installation & Running

### 1. Install Dependencies

Open a terminal and install dependencies for both the backend and frontend:

```bash
# Backend installation
cd backend
npm install

# Frontend installation
cd ../frontend
npm install
```

---

### 2. Running the Backend

From the `backend/` directory:

```bash
# Development mode with Nodemon (auto-reloads on file changes)
npm run dev

# Production startup
npm start
```

The backend server will start on `http://localhost:5000`.

#### Verify Health Endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected JSON response:
```json
{
  "status": "ok",
  "message": "BookMyShow Clone API running"
}
```

---

### 3. Running the Frontend

From the `frontend/` directory in a new terminal:

```bash
# Start Vite development server
npm run dev
```

Open your browser at `http://localhost:5173/`.

- `/` → Home Landing Page with Live Backend Status & Architecture Showcase
- `/login` → Authentication Placeholder
- `/register` → Registration Placeholder

---

## 🧹 Code Quality & Linting

Both the frontend and backend have configured ESLint and Prettier setups:

### Frontend:
```bash
cd frontend
npm run lint          # Run ESLint validation
npm run format:check  # Check formatting compliance
npm run format        # Auto-format all code
npm run build         # Validate production build
```

### Backend:
```bash
cd backend
npm run lint          # Run ESLint validation
npm run format:check  # Check formatting compliance
npm run format        # Auto-format all code
```

---

## 🗺 Development Roadmap

- [x] **Phase 0: Architectural Foundation & Tooling** *(Current)*
  - Monorepo folder organization, Vite + React 19, Tailwind CSS, React Router DOM, Express setup, Mongoose connector with graceful shutdown, ESLint, and Prettier.
- [ ] **Phase 1: Authentication & User Roles**
  - User registration, JWT authentication, secure password hashing (bcrypt), role-based authorization (User / Admin / Partner).
- [ ] **Phase 2: Movies & Theatres Catalog**
  - Movie schemas, genres, languages, cinema venues, showtime scheduling, search & filtering.
- [ ] **Phase 3: Interactive Seat Selection**
  - Dynamic cinema hall seating map, tier pricing (Silver / Gold / Recliner), live temporary seat reservation locks.
- [ ] **Phase 4: Booking Engine & Checkout**
  - Order checkout flow, payment gateway integration, QR ticket generation, email confirmations.
- [ ] **Phase 5: Admin Dashboard & Analytics**
  - Real-time revenue analytics, theatre show management, ticket scanning and validation.

---

## 📄 License

This educational project is distributed under the [MIT License](LICENSE).
