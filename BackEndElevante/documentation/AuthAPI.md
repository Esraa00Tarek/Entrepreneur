# Auth API Documentation

Base URL:
- Dev: `http://localhost:5000`
- Prod: `https://backendelevante-production.up.railway.app`

---

## POST /api/users/register

**Headers:**
- `Content-Type: multipart/form-data`

**Request Body (FormData):**
- `username` (string, required)
- `email` (string, required, valid email)
- `password` (string, required)
- `confirmPassword` (string, required, must match `password`)
- `role` (string, required: `"entrepreneur"`, `"supplier"`, `"investor"`, or `"admin"`)
- `pitchDeckLink` (string, optional, valid URL)
- `companyProfileLink` (string, optional, valid URL)
- **Files:**
  - `idCardFront` (file, required, PNG/JPG/PDF, max 5MB)
  - `idCardBack` (file, required, PNG/JPG/PDF, max 5MB)
  - `pitchDeckFile` (file, optional, PDF/PNG/JPG, max 5MB)
  - `companyProfile` (file, optional, PDF/PNG/JPG, max 5MB)

**Middleware:**
- `uploadUserFiles` (multer, memory storage, 5MB/file, field names as above)

**Response (201):**
```json
{
  "message": "User registered successfully. Awaiting admin approval.",
  "userId": "USER_ID"
}
```
If role is `admin`:
```json
{
  "message": "Admin registered successfully.",
  "userId": "USER_ID"
}
```

**Errors:**
- `400` – Missing required fields, passwords don’t match, username/email exists, missing ID card images, file too large, etc.
- `500` – Server error during registration

**Notes:**
- Available to: Anyone (no auth required)
- Account approval required for all except admin
- File uploads must use correct field names and types

---

## POST /api/users/login

**Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "login": "username_or_email",
  "password": "user_password"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "JWT_TOKEN",
  "user": {
    "id": "USER_ID",
    "fullName": "User Name",
    "username": "username",
    "email": "user@example.com",
    "role": "entrepreneur"
  }
}
```

**Errors:**
- `400` – Invalid username/email or password
- `403` – Account not approved or blocked
- `500` – Server error during login

**Notes:**
- Available to: Anyone (no auth required)
- Account must be approved and not blocked

---

## POST /api/users/logout

**Headers:**
- `Content-Type: application/json`

**Response (200):**
```json
{
  "message": "Logout successful."
}
```

**Errors:**
- `500` – Server error during logout

**Notes:**
- Available to: Anyone (no auth required)
- Stateless (no token invalidation on backend)

---

**All field names, file requirements, and validation rules are mirrored exactly from the backend code.** 