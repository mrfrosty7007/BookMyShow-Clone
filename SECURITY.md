# Security Policy — BookMyShow MERN Clone

We take the security and integrity of the **BookMyShow MERN Clone** seriously. This document outlines our responsible disclosure policies, supported release lines, and security reporting channels.

---

## 🛡 Supported Versions

Only the latest major and minor release versions receive active security patches and vulnerability mitigations.

| Version | Supported | Status |
| :--- | :---: | :--- |
| **`v1.0.x`** | **YES** | Active Production Support |
| `< 1.0.0` | **NO** | Deprecated / Educational Pre-release |

---

## 🔒 Implemented Security Controls

This repository incorporates multi-layered defense-in-depth security measures:

1. **Authentication & Session Tokens:**
   - JSON Web Tokens (JWT) issued with strict expiration and stored in **HTTP-only, SameSite: Lax, Secure** cookies to prevent client-side JavaScript theft (XSS mitigation).
   - Passwords hashed using `bcryptjs` with 12 salt rounds.
2. **Access Control (RBAC):**
   - Public registration endpoints hardcode `role: 'user'`. Administrative and partner accounts cannot be elevated through API manipulation.
   - Protected route middleware verifies JWT payload signatures and database permissions before handler execution.
3. **Injection & ReDoS Defense:**
   - `express-mongo-sanitize` strips reserved MongoDB operator prefixes (`$` and `.`) from request bodies and query parameters.
   - Dynamic RegExp queries sanitize user input via `escapeRegex()` to eliminate regular expression Denial of Service (ReDoS) and syntax crashes.
4. **Network & Transport Security:**
   - HTTP response headers hardened using `helmet` (HSTS, DNS prefetch control, frameguard, X-Content-Type-Options).
   - Socket.IO CORS configuration explicitly whitelists trusted domains and verified Vercel preview environments.
5. **Denial of Service Prevention:**
   - Global IP-based rate limiting via `express-rate-limit` (300 requests / 15 minutes in production).
   - Dedicated brute-force limiters on authentication endpoints (`/api/auth/login`).

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability or potential threat in this repository, **please do not disclose it publicly in GitHub issues or discussions**.

Instead, please send a responsible disclosure report directly to the project maintainers:

- **Security Contact:** `mk5625@srmist.edu.in`
- **Subject Line:** `[SECURITY] Potential Vulnerability in BookMyShow-Clone - <Brief Description>`

### Report Template
Please include the following details in your report to help us reproduce and resolve the issue quickly:

```text
Title: Brief summary of the vulnerability
Component: Backend Controller / Middleware / Frontend Component / Socket.IO
Severity: Critical / High / Medium / Low
Affected Endpoint / Route: (e.g. POST /api/shows)

Steps to Reproduce:
1.
2.
3.

Proof of Concept (PoC) / Payload:
[Include cURL, JSON body, or script if applicable]

Impact Assessment:
[Describe the consequences if exploited]

Suggested Remediation / Fix:
[Optional recommendations]
```

### Response Timeline
- **Initial Response:** Within 48 hours of receipt.
- **Triage & Assessment:** Within 5 business days.
- **Patch Release:** Security patches will be tagged and published in a maintenance release as soon as validated.
