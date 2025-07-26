# Business API Documentation

Base URL:
- Dev: `http://localhost:5000`
- Prod: `https://backendelevante-production.up.railway.app`

---

## POST /api/businesses

**Headers:**
- `Content-Type: multipart/form-data`
- `Authorization: Bearer {token}`

**Request Body (FormData):**
- `name` (string, required)
- `category` (string, required)
- `description` (string, required)
- `location` (object or JSON string, optional)
- `contact` (object or JSON string, optional)
- `financial` (object or JSON string, optional)
- `tags` (array or JSON string, optional)
- `status` (string, optional)
- **Files:**
  - `files` (array of files, optional, up to 10, PDF/PNG/JPG, max 5MB each)

**Middleware:**
- `protect` (auth required)
- `restrictTo('entrepreneur')` (role: entrepreneur only)
- `uploadMultipleFilesToCloudinary('files', 'businesses')` (multer, 5MB/file, up to 10 files, field name: `files`)

**Response (201):**
```json
{
  "success": true,
  "data": { /* business object */ }
}
```

**Errors:**
- `400 Bad Request` – missing required fields, invalid JSON in fields, forbidden content in attachments
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – user lacks entrepreneur role
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: Entrepreneur (must be logged in and approved)
- File uploads must use field name `files` (array)
- All file types allowed, but max 5MB each, up to 10 files
- Attachments are checked for forbidden content (contact info, etc.)

---

## GET /api/businesses/all

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Query Params (optional):**
- `status` (string)
- `owner` (user ID)
- `stage` (string)
- `keyword` (string, searches name/description)
- `sort` (`progressAsc` or `progressDesc`)

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [ /* business objects */ ]
}
```

**Errors:**
- `401 Unauthorized` – missing or invalid token
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: All authenticated users (all roles)
- Returns all businesses (admin sees deleted too)

---

## GET /api/businesses

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Query Params:**
- Same as `/all` above

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [ /* business objects */ ]
}
```

**Errors:**
- `401 Unauthorized` – missing or invalid token
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: All authenticated users (all roles)

---

## GET /api/businesses/my

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "count": 1,
  "data": [ /* business objects owned by current entrepreneur */ ]
}
```

**Errors:**
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – user lacks entrepreneur role
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: Entrepreneur only
- Returns businesses owned by the current user

---

## GET /api/businesses/:id

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "data": { /* business object */ }
}
```

**Errors:**
- `400 Bad Request` – invalid business ID format
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – not owner or admin
- `404 Not Found` – business not found
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: Owner or admin
- Returns business by ID

---

## PATCH /api/businesses/:businessId/progress

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "message": "Business progress recalculated successfully"
}
```

**Errors:**
- `400 Bad Request` – invalid business ID format
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – not owner or admin
- `404 Not Found` – business not found
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: Entrepreneur (owner) or admin
- Recalculates progress based on milestones

---

## PUT /api/businesses/:id

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Request Body:**
```json
{
  // Any updatable business fields
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Business updated successfully",
  "data": { /* updated business object */ }
}
```

**Errors:**
- `400 Bad Request` – invalid business ID format
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – not owner or admin
- `404 Not Found` – business not found
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: Owner or admin
- Updates all fields (PUT)

---

## PATCH /api/businesses/:id

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Request Body:**
```json
{
  // Any updatable business fields (partial update)
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Business updated",
  "data": { /* updated business object */ }
}
```

**Errors:**
- `400 Bad Request` – invalid business ID format
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – not owner or admin
- `404 Not Found` – business not found
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: Owner or admin
- Partial update (PATCH)

---

## DELETE /api/businesses/:id

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "message": "Business deleted successfully"
}
```

**Errors:**
- `400 Bad Request` – invalid business ID format
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – not owner or admin
- `404 Not Found` – business not found
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: Owner or admin
- Soft-deletes the business

---

## PATCH /api/businesses/:id/pause

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "message": "Business paused successfully",
  "data": { /* business object */ }
}
```

**Errors:**
- `400 Bad Request` – invalid business ID format
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – not owner or admin
- `404 Not Found` – business not found
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: Owner or admin
- Sets business status to `Paused`

---

## PATCH /api/businesses/:id/status

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "status": "string",
  "statusReason": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Status updated successfully",
  "data": { /* business object */ }
}
```

**Errors:**
- `400 Bad Request` – invalid business ID format
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – not owner or admin
- `404 Not Found` – business not found
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: Owner or admin
- Updates business status and reason

---

**All field names, file upload requirements, and permissions are mirrored exactly from the backend code.** 