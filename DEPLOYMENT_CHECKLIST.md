# Production Deployment Checklist — BookMyShow MERN Clone v1.0.0

Use this operational checklist before releasing or deploying updates to production on **Render** (Backend) and **Vercel** (Frontend).

---

## 1. Verified Live Production Deployments

| Component | Platform | Live URL | Health / Status |
| :--- | :--- | :--- | :--- |
| **Frontend** | Vercel | [https://book-my-show-clone-gamma-nine.vercel.app](https://book-my-show-clone-gamma-nine.vercel.app) | `HTTP 200 OK` (SPA client bundle) |
| **Backend REST API** | Render | [https://bookmyshow-api-57un.onrender.com/api](https://bookmyshow-api-57un.onrender.com/api) | `HTTP 200 OK` (Express API) |
| **Health Check** | Render | [https://bookmyshow-api-57un.onrender.com/api/health](https://bookmyshow-api-57un.onrender.com/api/health) | `{"status":"ok","service":"BookMyShow Clone API"}` |
| **Database** | MongoDB Atlas | AWS Sharded Cluster | TLS 1.3 encrypted (`bookmyshow_clone`) |

---

## 2. Pre-Deployment Configuration

### A. Backend (Render / Railway)
Navigate to **Render Dashboard** → Select Web Service → **Environment Variables**:

| Variable Name | Required | Example / Recommended Value | Purpose |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | **YES** | `production` | Enables Express production optimizations, secure cookies, and strict logging. |
| `PORT` | **YES** | `5000` (or dynamically injected by Render) | Port on which the HTTP & Socket.IO server listens. |
| `MONGODB_URI` | **YES** | `mongodb+srv://<user>:<pwd>@<cluster>.mongodb.net/bookmyshow_clone?retryWrites=true&w=majority` | TLS-encrypted connection string to MongoDB Atlas. |
| `JWT_SECRET` | **YES** | Minimum 32-character cryptographically secure string | Signing secret for session tokens and HTTP-only cookies. |
| `CLIENT_URL` | **YES** | `https://book-my-show-clone-gamma-nine.vercel.app` | Production frontend domain for strict CORS and credential exchange. |

#### Render Web Service Settings:
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Health Check Path:** `/api/health`
- **Auto-Deploy:** Yes (on git push to `main`)

---

### B. Frontend (Vercel)
Navigate to **Vercel Dashboard** → Select Project → **Settings** → **Environment Variables**:

| Variable Name | Required | Value | Purpose |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | **YES** | `https://bookmyshow-api-57un.onrender.com/api` | Base URL used by Axios and browser clients to reach backend REST endpoints. |

#### Vercel Project Settings:
- **Framework Preset:** `Vite`
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **SPA Fallback Routing:** Handled automatically via [`frontend/vercel.json`](file:///c:/1.Projects/BookMyShow/frontend/vercel.json) (`"routes": [{"handle": "filesystem"}, {"src": "/.*", "dest": "/index.html"}]`).

---

### C. Database (MongoDB Atlas)
- [x] In **Network Access**, ensure `0.0.0.0/0` (Anywhere) is allowed so cloud dynamic egress IPs can establish connections.
- [x] In **Database Access**, ensure the application user has `readWrite` privileges on `bookmyshow_clone`.
- [x] Run seed script to provision default admin if launching on a fresh database:
  ```bash
  cd backend
  npm run seed:admin
  npm run seed
  ```

---

## 3. Post-Deployment Verification & Health Check

### Health Check Endpoint
Execute an HTTP GET request to verify server startup and database connectivity:

```bash
curl -i https://bookmyshow-api-57un.onrender.com/api/health
```

Expected Response (`200 OK`):
```json
{
  "status": "ok",
  "service": "BookMyShow Clone API",
  "environment": "production",
  "uptime": 921,
  "timestamp": "2026-09-28T19:04:24.767Z"
}
```

---

## 4. Production Smoke Tests (Go/No-Go Checklist)

Perform these five manual or automated tests immediately after deployment:

### Test 1: Public Movie Catalog & City Filter
1. Open `https://book-my-show-clone-gamma-nine.vercel.app/`
2. Verify movie posters render without broken images.
3. Select city dropdown (e.g. `Bengaluru`, `Chennai`, `Hyderabad`); ensure movies and theaters filter correctly without errors.

### Test 2: User Authentication & Role Guard
1. Click **Register** → Create a new account (`testuser@example.com`).
2. Verify browser receives an HTTP-only `jwt` cookie and response body Bearer token.
3. Verify regular user cannot access `https://book-my-show-clone-gamma-nine.vercel.app/admin` (redirects to `/admin/login`).

### Test 3: Real-Time Seat Locking & Collisions
1. In two separate browser windows (Window A and Window B), open the same showtime.
2. In Window A, click seat `E5`.
3. In Window B, observe seat `E5` immediately transitioning to locked/unavailable state.
4. Verify 5-minute countdown timer appears in Window A.

### Test 4: Booking & QR Ticket Issuance
1. Complete booking for seat `E5` in Window A using simulated payment.
2. Verify redirection to **Booking Confirmation** with scannable QR ticket pass.
3. Click "Download PDF" and verify generated ticket.

### Test 5: Cinema Staff QR Scanner & Admin Analytics
1. Log in to `/admin/login` using administrative credentials (`admin@bookmyshow.com` / `AdminPassword123!`).
2. Open **Ticket Scanner** → Enter the `bookingId` or scan QR code.
3. Verify admission approved with status `Checked-In`. Rescanning the same ticket must return `HTTP 409 (Already Used)`.
4. Open **Executive Analytics** → Verify revenue, occupancy heatmap, and movie performance charts populate correctly.

---

## 5. Rollback Plan

If an unrecoverable failure occurs during release:
1. **Frontend:** In Vercel, navigate to **Deployments** → Select previous deployment → Click **Promote to Production** (instantaneous 0-second rollback).
2. **Backend:** In Render, navigate to **Deploys** → Select previous commit deploy → Click **Rollback**.
3. **Database:** Ensure point-in-time recovery is enabled in MongoDB Atlas for seamless collection restore.
