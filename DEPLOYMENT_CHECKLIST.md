# Production Deployment Checklist — BookMyShow MERN Clone v1.0.0

Use this operational checklist before releasing or deploying updates to production on **Railway** (Backend) and **Vercel** (Frontend).

---

## 1. Pre-Deployment Configuration

### A. Backend (Railway)
Navigate to **Railway Dashboard** → Select Service → **Variables**:

| Variable Name | Required | Recommended Value / Format | Purpose |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | **YES** | `production` | Enables Express production optimizations, secure cookies, and strict logging. |
| `PORT` | **YES** | `5000` (or injected by Railway) | Port on which the HTTP & Socket.IO server listens. |
| `MONGODB_URI` | **YES** | `mongodb+srv://<user>:<pwd>@<cluster>.mongodb.net/bookmyshow_clone?retryWrites=true&w=majority` | TLS-encrypted connection string to MongoDB Atlas. |
| `JWT_SECRET` | **YES** | `openssl rand -base64 48` (minimum 32 characters) | Signing secret for session tokens and HTTP-only cookies. |
| `CLIENT_URL` | **YES** | `https://your-app.vercel.app` | Production frontend domain for strict CORS and credential exchange. |

#### Railway Service Settings:
- **Root Directory:** `backend` (or leave default if utilizing root `railway.json`)
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Healthcheck Path:** `/api/health`
- **Healthcheck Timeout:** `10 seconds`

---

### B. Frontend (Vercel)
Navigate to **Vercel Dashboard** → Select Project → **Settings** → **Environment Variables**:

| Variable Name | Required | Value | Purpose |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | **YES** | `https://your-backend.up.railway.app/api` | Base URL used by Axios and browser clients to reach backend REST endpoints. |

#### Vercel Project Settings:
- **Framework Preset:** `Vite`
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **SPA Fallback Routing:** Handled automatically via [`frontend/vercel.json`](file:///c:/1.Projects/BookMyShow/frontend/vercel.json) (`"routes": [{"handle": "filesystem"}, {"src": "/.*", "dest": "/index.html"}]`).

---

### C. Database (MongoDB Atlas)
- [ ] In **Network Access**, ensure `0.0.0.0/0` (Anywhere) is allowed so Railway dynamic egress IPs can establish connections.
- [ ] In **Database Access**, ensure the application user has `readWrite` privileges on `bookmyshow_clone`.
- [ ] Run seed script to provision default admin if launching on a fresh database:
  ```bash
  npm run seed:admin
  npm run seed
  ```

---

## 2. Post-Deployment Verification & Health Check

### Health Check Endpoint
Execute an HTTP GET request to verify server startup and database connectivity:

```bash
curl -i https://your-backend.up.railway.app/api/health
```

Expected Response (`200 OK`):
```json
{
  "status": "ok",
  "environment": "production",
  "uptime": 12.45,
  "timestamp": "2026-09-28T22:00:00.000Z",
  "database": "connected"
}
```

---

## 3. Production Smoke Tests (Go/No-Go Checklist)

Perform these five manual or automated tests immediately after deployment:

### Test 1: Public Movie Catalog & City Filter
1. Open `https://your-frontend.vercel.app/`
2. Verify movie posters render without broken images.
3. Select city dropdown (e.g. `Bengaluru`); ensure theaters filter correctly without errors.

### Test 2: User Authentication & Role Guard
1. Click **Register** → Create a new account (`testuser@example.com`).
2. Verify browser receives an HTTP-only `token` cookie.
3. Verify public user cannot access `https://your-frontend.vercel.app/admin` (redirects to `/admin/login`).

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
1. Log in to `/admin/login` using administrative credentials.
2. Open **Ticket Scanner** → Enter the `bookingId` or scan QR code.
3. Verify admission approved with status `Checked-In`. Rescanning the same ticket must return `HTTP 409 (Already Used)`.
4. Open **Executive Analytics** → Verify revenue, occupancy heatmap, and movie performance charts populate correctly.

---

## 4. Rollback Plan

If an unrecoverable failure occurs during release:
1. **Frontend:** In Vercel, navigate to **Deployments** → Select previous deployment → Click **Promote to Production** (instantaneous 0-second rollback).
2. **Backend:** In Railway, navigate to **Deployments** → Select previous commit deployment → Click **Rollback**.
3. **Database:** Ensure point-in-time recovery is enabled in MongoDB Atlas for seamless collection restore.
