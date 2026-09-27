# Changelog

All notable changes to the **BookMyShow MERN Clone** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-27 — Production Release (Phase 5)

### Added
- **Reverse Proxy Trust**: Configured `app.set("trust proxy", 1)` for accurate client IP identification and rate limiting behind Railway and Render reverse proxies.
- **Production Health Monitoring**: Implemented `GET /api/health` returning service name, status (`ok`), environment, uptime, and timestamp without database mutation.
- **API Rate Limiting**: Added global rate limiting via `express-rate-limit` capped at 300 requests/15m in production (1000 in development), bypassing `/api/health`.
- **Graceful Shutdown**: Added process signal listeners (`SIGINT`, `SIGTERM`) that gracefully close the HTTP server and MongoDB connection with a 10s fallback timeout.
- **Environment Validation**: Added startup validation that halts process execution with exit code 1 if `MONGODB_URI`, `JWT_SECRET`, or `CLIENT_URL` are missing in production.
- **Deployment Configurations**:
  - `railway.json` and `backend/railway.json`: Production start command, Nixpacks builder, and `/api/health` health check configuration.
  - `vercel.json` and `frontend/vercel.json`: Single Page Application (SPA) fallback rewrites and Vite build specifications.
- **Frontend Asset Optimization**: Configured Rollup/Vite code splitting with functional `manualChunks` isolating `vendor`, `charts`, and `icons`.
- **Environment Portability**: Standardized frontend on `VITE_API_URL` with dynamic socket server origin resolution.
- **Deployment Documentation & Checklists**: Created `DEPLOYMENT_CHECKLIST.md` and `RELEASE_NOTES.md`.

---

## [0.4.6] - 2026-09-27 — Executive Analytics & Business Intelligence Suite

### Added
- **Executive KPI Ribbon**: Real-time business indicators for gross revenue, net revenue, tickets sold, average occupancy, refund rate, and admission check-in rate.
- **7D × 4 Diurnal Slots Occupancy Heatmap**: 28-cell matrix mapping congestion density across Monday–Sunday and Morning, Matinee, Evening, and Night windows.
- **Revenue Intelligence AreaChart**: Smooth monotone curves with Daily, Weekly, and Monthly view switches.
- **Movie Performance Ranking**: Composed dual-axis chart benchmarking Top 10 box office grossers against auditorium occupancy rates.
- **Theater & Screen Utilization**: Format efficiency comparison across IMAX, Dolby Atmos, Standard, and Gold Class.
- **Time Slot Demand Curve**: Diurnal customer booking frequency and revenue distribution.
- **Entry & Conversion Funnel**: Multi-stage funnel tracking `Booked` → `Paid` → `Checked-In`.
- **Automated Heuristic Insights Panel**: Dynamic observations synthesized directly from database metrics.
- **Multi-Format Report Export**: CSV data export streaming and printable PDF executive brief generation.

---

## [0.4.5] - 2026-09-27 — Booking Operations & Ticket Validation

### Added
- **QR Ticket Entrance Validation**: Camera scanner and manual code entry with real-time gate validation.
- **Duplicate Entry Protection**: Immediate HTTP 409 rejection for already-used tickets with scan timestamp and gate information.
- **Tiered Refund Engine**: Automated calculation (100% >24h, 75% 6–24h, 50% 1–6h) and show seat inventory restoration.
- **Seat Lock Recovery Daemon**: Background recovery service reclaiming orphaned temporary locks.
- **Audit Log Trail**: Comprehensive audit logging of ticket scans, denials, duplicates, and refunds.

---

## [0.4.4] - 2026-09-27 — Show Scheduling Engine & Conflict Detection

### Added
- **Show Scheduling Engine**: Schedule movies across multiplex screens with cleaning buffer overlap detection.
- **Timeline Visualizer**: Cinema operations timeline showing screen schedules and maintenance buffers.
- **Dynamic Pricing Rules**: Weekend, morning, and format surcharges applied at scheduling time.

---

## [0.4.3] - 2026-09-27 — Theater Management & Visual Seat Layout Builder

### Added
- **Theater Management CMS**: Administrative multiplex CRUD with city selection.
- **Visual Auditorium Builder**: Interactive seat grid designer with rows, seat types, and custom aisles.
- **Screen Cloning**: One-click screen layout duplication.

---

## [0.4.2] - 2026-09-27 — Movie Management CMS

### Added
- **Admin Movie Management**: Add, update, soft-delete, restore, and feature movies.
- **Image Upload Pipeline**: Multer middleware with file validation for movie posters.

---

## [0.4.1] - 2026-09-27 — Admin Authentication & Authorization

### Added
- **Role-Based Admin Access**: Admin role validation via `adminAuth` middleware.
- **Admin Console**: Executive dashboard layout with live metrics summary.

---

## [0.3.3] - 2026-09-27 — Payment Simulation, QR Tickets & My Bookings

### Added
- **Booking Checkout Engine**: Order calculation with base fare, convenience fee, and GST.
- **Payment Simulation**: Interactive credit card and UPI processing animations.
- **QR Ticket Pass**: Signed cryptographic QR barcodes and downloadable PDF tickets.
- **Customer My Bookings**: Order history with status indicators and self-service cancellation.

---

## [0.3.2] - 2026-09-27 — Real-Time Seat Locking via Socket.IO

### Added
- **Temporary Seat Locking**: 5-minute lock timer preventing double-booking across concurrent users.
- **Real-Time Synchronization**: Instant lock/unlock events broadcast via WebSockets.

---

## [0.3.1] - 2026-09-27 — Interactive Seat Map Grid

### Added
- **Cinematic Seat Grid**: Responsive auditorium view with VIP, Premium, and Executive tiers.
- **Seat Selection Summary**: Real-time subtotal and ticket counter.

---

## [0.2.7] - 2026-09-27 — Movies & Theaters Catalog

### Added
- **Storefront Discovery**: Movie catalog with genres, languages, and ratings.
- **Showtime Explorer**: Theater listings grouped by date and city.

---

## [0.1.5] - 2026-09-27 — Security Hardening

### Added
- **Login Rate Limiter**: 5 requests per 15 minutes per IP.
- **NoSQL Query Sanitization**: Automatic stripping of `$` and `.` operators.
- **Helmet Security Headers**: Content-Security-Policy and protective HTTP headers.

---

## [0.1.0] - 2026-09-27 — Foundation & Authentication

### Added
- **Full-Stack Architecture**: React 19, Tailwind CSS, Express 4, MongoDB Atlas.
- **JWT HTTP-Only Cookies**: Secure authentication flow with bcrypt 12-round hashing.
