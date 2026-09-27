# Production Deployment Checklist (v1.0.0)

Use this checklist to ensure smooth production deployments across **MongoDB Atlas**, **Railway**, and **Vercel**.

---

## 1. 🗄 MongoDB Atlas Setup
- [ ] Create or select an active MongoDB Atlas cluster (M0 Free Tier or higher).
- [ ] Create a dedicated database user (e.g. `bms_prod_user`) with read/write privileges on `bookmyshow_clone`.
- [ ] Configure **Network Access**:
  - Add `0.0.0.0/0` (Allow Access from Anywhere) to permit Railway's dynamic IP ranges to connect over TLS.
- [ ] Obtain the connection URI (e.g. `mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/bookmyshow_clone?retryWrites=true&w=majority`).

---

## 2. 🚂 Backend Deployment (Railway / Render)
- [ ] Connect the GitHub repository to [Railway](https://railway.app/).
- [ ] Configure deployment settings:
  - **Root Directory**: `backend` (or use root `railway.json`).
  - **Build Command**: `npm install`
  - **Start Command**: `npm start`
  - **Healthcheck Path**: `/api/health`
- [ ] Configure Environment Variables:
  ```env
  NODE_ENV=production
  PORT=5000
  MONGODB_URI=mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/bookmyshow_clone?retryWrites=true&w=majority
  JWT_SECRET=<generate_a_cryptographically_secure_random_string>
  CLIENT_URL=https://<your-frontend-subdomain>.vercel.app
  ```
- [ ] Deploy and verify:
  - Check deployment logs for: `[MongoDB] Connected successfully to host: ...`
  - Verify `[Server] BookMyShow Clone API running on port 5000`
  - Send a test request to `https://<your-backend-domain>/api/health` (should return HTTP 200).
- [ ] Seed production administration account (run via Railway CLI or one-off script):
  ```bash
  npm run seed:admin
  npm run seed
  ```

---

## 3. 🔺 Frontend Deployment (Vercel)
- [ ] Connect the GitHub repository to [Vercel](https://vercel.com/).
- [ ] Configure project settings:
  - **Framework Preset**: `Vite`
  - **Root Directory**: `frontend`
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`
- [ ] Configure Environment Variables:
  ```env
  VITE_API_URL=https://<your-backend-domain>/api
  ```
- [ ] Deploy and verify:
  - Test browser navigation across client-side routes (`/`, `/movies`, `/admin/login`, `/admin/dashboard`, `/admin/analytics`).
  - Refresh the page on deep routes (e.g. `/admin/analytics`) to confirm `vercel.json` SPA rewrite works properly.

---

## 4. 🧪 End-to-End Smoke Tests
- [ ] **Customer Journey**:
  - Browse available movies and click a showtime.
  - Test interactive seat map selection and verify the 5-minute seat lock timer.
  - Complete simulated checkout and verify the QR ticket generation.
  - Verify booking appears in "My Bookings" with ticket download option.
- [ ] **Cinema Operations (Staff/Admin)**:
  - Log into Admin Portal (`/admin/login`).
  - Verify live statistics on Admin Dashboard.
  - Open Ticket Scanner (`/admin/scanner`) and scan the customer QR ticket pass.
  - Verify entrance check-in updates status to `Checked-In`.
  - Scan the ticket a second time and confirm immediate duplicate rejection (HTTP 409).
- [ ] **Executive Analytics**:
  - Open Executive Analytics (`/admin/analytics`).
  - Verify KPI Ribbon, 7D × 4 Diurnal Slots Occupancy Heatmap, and Revenue curves.
  - Click "Export Report" and verify CSV download and PDF brief generation.
- [ ] **Security**:
  - Confirm cookies are sent with `HttpOnly`, `SameSite: Lax`, and `Secure` attributes over HTTPS.
  - Verify rate limiter headers (`RateLimit-Limit: 300`) on `/api/movies`.

---

## 5. 🏷 Release Tagging
- [ ] Create annotated release tag:
  ```bash
  git tag -a v1.0.0 -m "Release v1.0.0 - Production MERN Stack Suite"
  git push origin v1.0.0
  ```
- [ ] Create GitHub Release in web UI using `RELEASE_NOTES.md`.
