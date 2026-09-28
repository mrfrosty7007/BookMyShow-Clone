# BookMyShow Clone v1.0.0 — General Availability (GA) Release

> **The definitive open-source cinema ticket reservation, real-time seat locking, and multiplex operations platform built with the MERN stack.**

---

## 🎯 Elevator Pitch

BookMyShow Clone `v1.0.0` represents a landmark production release. Built with Node.js 22 LTS, React 19, Tailwind CSS v4, Socket.IO 4.8, and MongoDB Atlas, this platform moves beyond traditional storefront clones by implementing the **complete operational lifecycle** of a modern cinema multiplex chain—from real-time WebSocket seat locking and cryptographic QR passes to conflict-aware scheduling engines, gate admission scanners, and executive business intelligence dashboards.

---

## ✨ Release Highlights

### 🎬 Customer Experience
- **Fluid Movie Discovery:** Browse active releases with instant multi-city filtering (Mumbai, Delhi-NCR, Bengaluru, Hyderabad, Chennai, Kolkata).
- **Interactive Multi-Tier Seat Grid:** Visual 10x12 auditorium seating categorized into Standard, Premium, and VIP tiers with realistic cinema aisles and wheelchair spaces.
- **Real-Time Seat Locking:** 5-minute temporary reservation timer via Socket.IO with atomic collision prevention across concurrent user sessions.
- **Cryptographic QR Ticketing:** One-click booking with tamper-evident signed QR ticket barcodes and downloadable, print-ready PDF passes.

### 🛡️ Cinema Operations & Gate Management
- **Visual Screen Builder:** Configure auditorium screens with custom row capacities, aisle offsets, and sound format definitions (IMAX, Dolby Atmos, 4DX).
- **Conflict-Aware Show Scheduler:** Automated scheduling engine with overlap detection factoring in film runtime, trailer buffers, and cleaning windows.
- **Gate Entry Scanner Kiosk:** Fast web-based camera and manual barcode scanner with automated duplicate entry prevention (`HTTP 409`) and staff attribution.
- **Automated Refund Engine:** Tiered cancellation policies (100%, 75%, 50%) with automatic seat inventory restoration and immutable audit trails.

### 📊 Executive Business Intelligence & Analytics
- **Executive KPI Ribbon:** Real-time Gross Revenue, Net Revenue, Tickets Sold, Average Ticket Price (ATP), Refund Rate, and Gate Check-In Velocity.
- **Diurnal Congestion Heatmap:** 28-cell matrix mapping occupancy density across Monday–Sunday and 4 daily time slots (Morning, Matinee, Evening, Night).
- **Revenue Analytics & Benchmarking:** Smooth Recharts area curves and dual-axis charts benchmarking box office grossers against auditorium occupancy rates.
- **Data Export Suite:** One-click streaming download of executive CSV data reports.

---

## ⚡ Technical Achievements & Benchmarks

1. **-95.5% Query Heap Memory Reduction:** Converted public read endpoints to Mongoose `.lean()`, slashing batch query heap allocation from **42.68 MB down to 1.89 MB**.
2. **100% Index-Covered Query Paths:** Added compound B-Tree indexes on MongoDB Atlas, eliminating all full collection scans (`COLLSCAN`) and in-memory `SORT` stages.
3. **React 19 Zero-Crash Error Boundary:** Root-level class Error Boundary with dark cyber fallback, 1-click page reload, and live diagnostics drawer.
4. **Hardened RBAC & Perimeter Security:** Immutable role assignment on public registration, ReDoS/Regex input sanitization, dynamic Socket.IO CORS for Vercel preview environments, and secure HTTP-only cookies.
5. **Modern Build Performance:** Built with Vite and Rolldown chunks yielding a **255 kB gzipped** client bundle with sub-second production builds.

---

## 📸 Interface Showcase

| Customer Seat Selection | Cinema Gate Scanner | Executive Analytics Suite |
| :---: | :---: | :---: |
| Real-time 5-min locking grid | Instant QR check-in & duplicate guard | KPI ribbon & occupancy heatmap |
| `[Screenshot: Seat Grid]` | `[Screenshot: QR Scanner]` | `[Screenshot: Analytics]` |

---

## 🛠 Deployment & Installation

```bash
# Clone the repository
git clone https://github.com/mrfrosty7007/BookMyShow-Clone.git
cd BookMyShow-Clone

# Install & seed database
cd backend && npm install && npm run seed:admin && npm run seed
cd ../frontend && npm install

# Launch development environment
npm run dev # in backend and frontend
```

Deployable to **Render** (Backend) and **Vercel** (Frontend) with zero configuration drift.

---

## 🔗 Release Artifacts & Documentation
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)
- [Complete Release Notes](RELEASE_NOTES_v1.0.0.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)

**Full Changelog:** `https://github.com/mrfrosty7007/BookMyShow-Clone/commits/v1.0.0`
