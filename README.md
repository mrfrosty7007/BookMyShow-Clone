# BookMyShow Clone — MERN Stack (Phase 1 & 1.5)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-22%20LTS-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38bdf8.svg)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Mongoose%208-emerald.svg)](https://mongoosejs.com/)

> **Disclaimer:** This is an educational clone project developed strictly for learning and software architecture demonstration purposes. It is not affiliated with, endorsed by, or associated in any way with **BookMyShow** or **Bigtree Entertainment Pvt. Ltd.**

---

## 📌 Project Overview

**BookMyShow-Clone** is a modern, modular, production-ready full-stack application recreating the core entertainment ticketing experience using the **MERN (MongoDB, Express, React, Node.js)** stack.

- **Phase 0 (Foundation)**: Architectural foundation, build pipelines, decoupled project structure, client-side routing, and MongoDB Atlas database connection.
- **Phase 1 (Authentication)**: Complete end-to-end user authentication with bcrypt password hashing, HTTP-only JWT cookies, React AuthContext, and protected routes.
- **Phase 1.5 (Security Hardening)**: Production-grade hardening with login rate limiting, MongoDB NoSQL query sanitization, Helmet HTTP security headers, and API documentation.

---

## 🛠 Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) | High-performance SPA with instant HMR and ES Modules |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Modern utility-first CSS design system |
| **Routing** | [React Router DOM](https://reactrouter.com/) | Declarative client-side routing with shared layout & protected route guards |
| **State Management** | React Context API | Centralized `AuthContext` managing session state & profile persistence |
| **Backend** | [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) | Modular RESTful API architecture (ESM) |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) | Schema-based document persistence with pre-save hooks & connection lifecycle |
| **Security & Auth** | JWT, bcryptjs, Helmet, express-rate-limit, express-mongo-sanitize | Secure cookie sessions, NoSQL injection prevention, brute-force mitigation |
| **Runtime** | Node.js 22 LTS (ES Modules) | Standardized JavaScript runtime |
| **Dev Tools** | [Nodemon](https://nodemon.io/), [ESLint 9](https://eslint.org/), [Prettier 3](https://prettier.io/) | Automated dev reloading, linting, and formatting |

---

## 🔐 Authentication & Security Architecture

### HTTP-Only Cookie Authentication
Unlike traditional web apps that store JWTs in browser `localStorage` or `sessionStorage` (which are vulnerable to token theft via Cross-Site Scripting / XSS attacks), this project implements an **HTTP-only cookie architecture**:
- **Cookie Security Flags**:
  - `httpOnly: true`: Blocks client-side JavaScript access (`document.cookie`), neutralizing token exfiltration through XSS.
  - `secure: process.env.NODE_ENV === 'production'`: Ensures cookies are transmitted solely over HTTPS in production.
  - `sameSite: 'lax'`: Protects against Cross-Site Request Forgery (CSRF) for cross-site top-level navigations.
  - `maxAge: 7 * 24 * 60 * 60 * 1000`: 7-day session lifetime.
- **Credentials Handling**: Frontend requests configure `credentials: 'include'` (in `fetch`) and backend CORS explicitly authorizes whitelisted client origins (`http://localhost:5173`, `http://localhost:5174`, etc.) with `credentials: true`.

### Security Hardening Measures
1. **Login Rate Limiting**:
   - Implemented via `express-rate-limit` in `backend/middleware/rateLimiter.js`.
   - Protects `POST /api/auth/login` by capping requests to **5 attempts per 15-minute window** per IP. Returns HTTP 429 (`Too many login attempts. Please try again after 15 minutes.`).
   - Registration and public endpoints remain unthrottled.
2. **MongoDB Query Sanitization**:
   - Implemented via `express-mongo-sanitize` in `backend/app.js`.
   - Automatically sanitizes incoming `req.body`, `req.query`, and `req.params`, stripping keys prefixed with `$` or containing `.` to prevent NoSQL query operator injection attacks.
3. **Helmet HTTP Headers**:
   - `helmet()` automatically configures secure HTTP response headers (Content-Security-Policy, X-Content-Type-Options, Strict-Transport-Security, X-Frame-Options).
4. **CORS Restrictions**:
   - Cross-Origin Resource Sharing is locked down to known development and production origins, preventing unauthorized cross-origin requests.

---

## 📡 API Endpoints

| Method | Endpoint | Access | Description | Rate Limited |
|:---|:---|:---|:---|:---|
| `GET` | `/` | Public | API root info and discovery endpoints | No |
| `GET` | `/api/health` | Public | Healthcheck and server status | No |
| `POST` | `/api/auth/register` | Public | Register new user account; issues HTTP-only cookie | No |
| `POST` | `/api/auth/login` | Public | Authenticate user; issues HTTP-only cookie | **Yes (5 req / 15 min)** |
| `POST` | `/api/auth/logout` | Public | Clears HTTP-only `jwt` cookie | No |
| `GET` | `/api/auth/me` | **Private** | Retrieve current logged-in user profile | No |

Comprehensive API documentation is available in [`backend/docs/auth.md`](backend/docs/auth.md).
A ready-to-use Postman collection is located at [`docs/postman/BookMyShow_Auth_API.postman_collection.json`](docs/postman/BookMyShow_Auth_API.postman_collection.json).

---

## 📂 Repository Structure

```text
BookMyShow-Clone/
├── docs/
│   └── postman/
│       └── BookMyShow_Auth_API.postman_collection.json # Postman API test collection
│
├── frontend/
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── assets/             # Brand logos & imagery
│   │   ├── components/         # Reusable UI elements (Navbar, Footer, etc.)
│   │   ├── context/            # React context providers (AuthContext.jsx)
│   │   ├── hooks/              # Custom React hooks (useAuth, useApiHealth)
│   │   ├── layouts/            # Shared route layouts (MainLayout)
│   │   ├── pages/              # Route views (HomePage, LoginPage, RegisterPage, etc.)
│   │   ├── routes/             # AppRoutes & ProtectedRoute route guards
│   │   ├── services/           # API clients (api.js, authService.js, healthService.js)
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
│   │   └── db.js               # Asynchronous MongoDB Atlas connector & graceful shutdown
│   ├── controllers/
│   │   └── authController.js   # Register, Login, Logout, and Current User logic
│   ├── docs/
│   │   └── auth.md             # Detailed Auth API markdown documentation
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT cookie verification middleware (`protect`)
│   │   ├── rateLimiter.js      # Login rate limiter (5 req / 15 min window)
│   │   ├── errorHandler.js     # Centralized error handler
│   │   └── notFoundHandler.js  # 404 catch-all handler
│   ├── models/
│   │   └── User.js             # Mongoose User schema with bcrypt password hashing
│   ├── routes/
│   │   ├── auth.js             # Authentication routes (/api/auth)
│   │   ├── health.js           # GET /api/health endpoint
│   │   └── index.js            # Centralized API route registration
│   ├── services/               # Scaffold for business logic services (.gitkeep)
│   ├── utils/
│   │   ├── generateToken.js    # JWT generation & HTTP-only cookie setter
│   │   └── logger.js           # Structured backend logging utility
│   ├── .env                    # Local environment variables (ignored by git)
│   ├── .env.example            # Environment variables template
│   ├── .prettierrc             # Prettier styling configuration
│   ├── app.js                  # Express setup (Helmet, CORS, MongoSanitize, parsers)
│   ├── eslint.config.js        # ESLint 9 configuration
│   ├── package.json            # Backend dependencies & scripts
│   └── server.js               # Entrypoint: loads env, connects Atlas DB, starts listener
│
├── .env.example                # Sample environment variables template (root)
├── .gitignore                  # Git ignore rules for node_modules, build, env
└── README.md                   # Project documentation
```

---

## ⚙️ Environment Setup

1. Copy `.env.example` to `backend/.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Configure your environment variables in `backend/.env`:
   ```ini
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.5dlgkac.mongodb.net/bookmyshow_clone?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```

> **Security Warning:** Never commit `.env` containing actual database credentials or JWT secrets to Git.

---

## 🚀 Installation & Running

### 1. Install Dependencies

Install dependencies for both backend and frontend:

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

- `/` → Home Landing Page with Live Backend Status & Navigation
- `/login` → User Login with Rate-Limiting Protection & Form Validation
- `/register` → Account Registration with Validation
- `/profile` → Protected User Profile Page (requires authentication)

---

## 🧹 Code Quality & Linting

Both frontend and backend adhere to ESLint and Prettier standards:

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

- [x] **Phase 0: Architectural Foundation & Tooling**
  - Monorepo folder organization, Vite + React 19, Tailwind CSS, React Router DOM, Express setup, MongoDB Atlas connection with graceful shutdown, ESLint, and Prettier.
- [x] **Phase 1: Authentication & User Management**
  - Mongoose User model with bcrypt pre-save password hashing.
  - Stateless JWT issued and stored via secure HTTP-only cookies (`jwt`).
  - Input validation via `express-validator`.
  - React `AuthContext` with persistent session restoration.
  - Protected route wrappers (`ProtectedRoute.jsx`) and user profile UI.
- [x] **Phase 1.5: Security Hardening & Documentation**
  - Brute-force protection on `POST /api/auth/login` with `express-rate-limit` (5 attempts / 15 min).
  - NoSQL injection prevention with `express-mongo-sanitize`.
  - HTTP security headers with `helmet`.
  - Postman collection in `docs/postman/`.
  - API documentation in `backend/docs/auth.md`.
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
