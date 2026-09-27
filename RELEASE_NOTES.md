# Release Notes — v1.0.0 (Production Release)

🚀 **BookMyShow MERN Clone v1.0.0** is officially released!

This milestone release transforms the repository from a feature-complete development build into a hardened, production-ready enterprise ticketing platform configured for cloud deployments on **Railway** (Backend) and **Vercel** (Frontend) backed by **MongoDB Atlas**.

---

## 🌟 What's New in v1.0.0

### 🛡 Backend Hardening & Cloud Readiness
- **Reverse Proxy Trust**: Enabled `app.set("trust proxy", 1)` ensuring real client IP extraction behind Railway and Render reverse proxies.
- **Production Healthcheck**: Implemented `GET /api/health` providing uptime, environment, and service health without database mutation.
- **Global Rate Limiting**: Added `apiRateLimiter` capping traffic to 300 requests/15m in production (1000 in development) while bypassing health checks.
- **Graceful Shutdown**: Added synchronized `SIGINT` and `SIGTERM` handlers that cleanly close the HTTP server and MongoDB connections.
- **Fail-Fast Environment Validation**: Validates `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL` on production startup.

### ⚡ Frontend Optimization & Portability
- **Dynamic API Target**: Configured `VITE_API_URL` environment resolution throughout Axios API client and Socket.IO.
- **Vite & Rolldown Chunk Splitting**: Added optimized manual chunks separating `vendor` (React, Router), `charts` (Recharts), and `icons` (Lucide React).
- **SPA Routing Rewrites**: Provided `vercel.json` configurations preventing 404s on browser reloads.

### 📊 Complete Full-Stack Feature Set
- **Authentication**: HTTP-only JWT cookies with bcrypt password hashing (12 rounds).
- **Storefront**: Movie discovery, multi-city filtering, format badges (IMAX, Dolby Atmos, Standard).
- **Seat Grid & Locking**: Real-time 5-minute temporary seat reservation engine via Socket.IO.
- **Booking & Payments**: Simulated checkout flow with fee calculation and signed QR ticket passes.
- **Customer Portal**: My Bookings dashboard with self-service cancellations and PDF downloads.
- **Admin Console**: Multiplex builder, conflict-aware show scheduler, and camera-based gate entry scanner.
- **Executive Analytics**: 7D × 4 Diurnal Slots occupancy heatmap, revenue curves, format utilization, and CSV/PDF export.

---

## 📦 Deployment Matrix

| Service | Recommended Platform | Config File | Health Check |
|:--------|:---------------------|:------------|:-------------|
| **Backend API & Sockets** | Railway (or Render) | `railway.json` | `GET /api/health` |
| **Frontend Client** | Vercel | `vercel.json` | `GET /` |
| **Database** | MongoDB Atlas | N/A (Cloud Cluster) | Monitored by Mongoose |

---

## 📝 GitHub Tagging Command
```bash
git tag -a v1.0.0 -m "Release v1.0.0 - Production MERN Stack Suite"
git push origin v1.0.0
```
