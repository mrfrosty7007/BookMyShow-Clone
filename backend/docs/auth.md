# BookMyShow Clone — Authentication API Documentation

This document provides complete API reference documentation for the authentication endpoints of the BookMyShow Clone backend.

---

## Architecture & Authentication Flow

- **Session Strategy**: Stateless JSON Web Token (JWT) transmitted via secure HTTP-only cookies (`jwt`).
- **Security Considerations**:
  - The JWT is **never** exposed to client-side JavaScript, eliminating the risk of token theft via Cross-Site Scripting (XSS).
  - Rate limiting protects the `/login` endpoint against brute-force attacks.
  - MongoDB query sanitization strips keys starting with `$` or containing `.` from request payloads to mitigate NoSQL injection.
  - Helmet configures HTTP security headers.
  - CORS strictly allows whitelisted frontend origins with credentials (`credentials: true`).

### Base URL
- Local: `http://localhost:5000/api/auth`

---

## Authentication Endpoints

### 1. Register User
Registers a new account, issues a signed JWT, and sets the HTTP-only cookie.

- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Access**: Public (Not rate-limited)
- **Headers**:
  - `Content-Type: application/json`

#### Request Body
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "Password123!"
}
```

| Field | Type | Required | Description / Constraints |
| :--- | :--- | :--- | :--- |
| `name` | String | Yes | Non-empty string, max 60 characters |
| `email` | String | Yes | Valid email address, normalized to lowercase |
| `password` | String | Yes | Minimum 8 characters |
| `role` | String | No | Optional (`user`, `partner`, `admin`). Defaults to `user`. |

#### Success Response (201 Created)
- **Set-Cookie**: `jwt=<token>; Path=/; HttpOnly; SameSite=Lax`
```json
{
  "status": "ok",
  "message": "Account registered successfully",
  "user": {
    "_id": "6740bc1d9e2a4a75878345ab",
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "role": "user",
    "createdAt": "2026-09-27T05:00:00.000Z"
  }
}
```

#### Error Responses
- **400 Bad Request** — Validation error:
```json
{
  "status": "error",
  "message": "Password must be at least 8 characters long",
  "errors": [
    {
      "type": "field",
      "value": "123",
      "msg": "Password must be at least 8 characters long",
      "path": "password",
      "location": "body"
    }
  ]
}
```
- **400 Bad Request** — Duplicate email:
```json
{
  "status": "error",
  "message": "A user with this email address already exists"
}
```

---

### 2. Login User
Authenticates user credentials, issues a signed JWT, and sets the HTTP-only cookie.

- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Access**: Public
- **Rate Limit**: **5 requests per 15-minute window** per IP address.
- **Headers**:
  - `Content-Type: application/json`

#### Request Body
```json
{
  "email": "jane.doe@example.com",
  "password": "Password123!"
}
```

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | String | Yes | Registered account email |
| `password` | String | Yes | User account password |

#### Success Response (200 OK)
- **Set-Cookie**: `jwt=<token>; Path=/; HttpOnly; SameSite=Lax`
```json
{
  "status": "ok",
  "message": "Logged in successfully",
  "user": {
    "_id": "6740bc1d9e2a4a75878345ab",
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "role": "user",
    "createdAt": "2026-09-27T05:00:00.000Z"
  }
}
```

#### Error Responses
- **400 Bad Request** — Missing required fields / invalid format:
```json
{
  "status": "error",
  "message": "Password is required"
}
```
- **401 Unauthorized** — Invalid credentials:
```json
{
  "status": "error",
  "message": "Invalid email or password credentials"
}
```
- **429 Too Many Requests** — Rate limit exceeded:
```json
{
  "status": "error",
  "message": "Too many login attempts. Please try again after 15 minutes."
}
```

---

### 3. Logout User
Clears the HTTP-only authentication cookie.

- **Method**: `POST`
- **Path**: `/api/auth/logout`
- **Access**: Public / Authenticated
- **Headers**:
  - `Content-Type: application/json`

#### Request Body
None.

#### Success Response (200 OK)
- **Set-Cookie**: `jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
```json
{
  "status": "ok",
  "message": "Logged out successfully"
}
```

---

### 4. Current User Profile
Retrieves the profile of the currently logged-in user verified via the HTTP-only cookie.

- **Method**: `GET`
- **Path**: `/api/auth/me`
- **Access**: Private (Requires valid `jwt` cookie)
- **Credentials**: Cookies must be included (`credentials: 'include'`)

#### Request Body
None.

#### Success Response (200 OK)
```json
{
  "status": "ok",
  "user": {
    "_id": "6740bc1d9e2a4a75878345ab",
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "role": "user",
    "createdAt": "2026-09-27T05:00:00.000Z"
  }
}
```

#### Error Responses
- **401 Unauthorized** — Missing token:
```json
{
  "status": "error",
  "message": "Not authorized, no session token provided"
}
```
- **401 Unauthorized** — Invalid or expired token:
```json
{
  "status": "error",
  "message": "Not authorized, session token is invalid or expired"
}
```

---

## Common HTTP Status Codes

| Code | Reason | Description |
| :--- | :--- | :--- |
| **200** | OK | Request succeeded (Login, Logout, Current User). |
| **201** | Created | User account created successfully. |
| **400** | Bad Request | Validation failure or duplicate email address. |
| **401** | Unauthorized | Invalid login credentials or missing/expired JWT cookie. |
| **404** | Not Found | Route or user not found. |
| **429** | Too Many Requests | Rate limit exceeded (more than 5 login attempts within 15 minutes). |
| **500** | Internal Server Error | Unhandled server exception. |
