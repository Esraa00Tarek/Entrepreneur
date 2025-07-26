# Milestone API Documentation

Base URL:
- Dev: `http://localhost:5000`
- Prod: `https://backendelevante-production.up.railway.app`

---

## POST /api/milestones?businessId=BUSINESS_ID

**Headers:**
- `Content-Type: multipart/form-data`
- `Authorization: Bearer {token}`

**Request Body (FormData):**
- `title` (string, required, max 200)
- `description` (string, optional, max 2000)
- `stageUpdate` (string, optional)
- **Files:**
  - `files` (array of files, optional, up to 10, PDF/PNG/JPG, max 5MB each)

**Query Params:**
- `businessId` (string, required, must be a valid Business ObjectId)

**Middleware:**
- `protect` (auth required)
- `restrictTo('entrepreneur')` (role: entrepreneur only)
- `uploadMultipleFilesToCloudinary('files', 'milestones')` (multer, 5MB/file, up to 10 files, field name: `files`)

**Response (201):**
```json
{
  "success": true,
  "message": "Milestone created successfully",
  "data": { /* milestone object */ }
}
```

**Errors:**
- `400 Bad Request` – missing businessId, invalid businessId, forbidden content in attachments
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – not owner of business
- `404 Not Found` – business not found
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: Entrepreneur (must be logged in and approved)
- File uploads must use field name `files` (array)
- Attachments are checked for forbidden content (contact info, etc.)
- Milestone is always bound to a business via `businessId`

---

## GET /api/milestones/business/:businessId

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [ /* milestone objects for the business */ ]
}
```

**Errors:**
- `400 Bad Request` – missing or invalid businessId
- `401 Unauthorized` – missing or invalid token
- `500 Server Error` – unhandled backend failure

**Notes:**
- Returns all milestones for a given business
- Each milestone includes its `business` binding

---

## GET /api/milestones/:id

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "data": { /* milestone object */ }
}
```

**Errors:**
- `400 Bad Request` – invalid milestone ID format
- `401 Unauthorized` – missing or invalid token
- `404 Not Found` – milestone not found
- `500 Server Error` – unhandled backend failure

**Notes:**
- Returns a single milestone by ID

---

## PUT /api/milestones/:id

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "stageUpdate": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Milestone updated successfully",
  "data": { /* updated milestone object */ }
}
```

**Errors:**
- `400 Bad Request` – invalid milestone ID format
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – not creator
- `404 Not Found` – milestone not found
- `500 Server Error` – unhandled backend failure

**Notes:**
- Only the creator (entrepreneur) can update

---

## DELETE /api/milestones/:id

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "message": "Milestone deleted successfully"
}
```

**Errors:**
- `400 Bad Request` – invalid milestone ID format
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – not owner or admin
- `404 Not Found` – milestone not found
- `500 Server Error` – unhandled backend failure

**Notes:**
- Only the business owner or admin can delete
- Milestone is removed from the business's milestones array

---

## PATCH /api/milestones/:id/status

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "status": "pending|in_progress|completed|rejected|paused|..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Status updated",
  "data": { /* milestone object */ }
}
```

**Errors:**
- `400 Bad Request` – invalid milestone ID format
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – not creator or admin
- `404 Not Found` – milestone not found
- `500 Server Error` – unhandled backend failure

**Notes:**
- Allowed status transitions (enforced by frontend):
  - `pending` → `in_progress` → `completed`
  - `pending`/`in_progress` → `rejected`/`paused`
- Status is a free string in backend, but frontend must enforce allowed values

---

## PATCH /api/milestones/:id/progress

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "progress": 0-100
}
```

**Response (200):**
```json
{
  "message": "Progress updated successfully",
  "milestone": { /* updated milestone object */ }
}
```

**Errors:**
- `400 Bad Request` – invalid milestone ID format, progress out of range
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – not creator or admin
- `404 Not Found` – milestone not found
- `500 Server Error` – unhandled backend failure

**Notes:**
- Only the creator (entrepreneur) or admin can update
- Progress must be between 0 and 100

---

## POST /api/milestones/:id/notes

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "body": "string (max 1000)"
}
```

**Response (201):**
```json
{
  "message": "Note added successfully",
  "milestone": { /* updated milestone object */ }
}
```

**Errors:**
- `400 Bad Request` – invalid milestone ID format
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – not creator or admin
- `404 Not Found` – milestone not found
- `500 Server Error` – unhandled backend failure

**Notes:**
- Only the creator (entrepreneur) or admin can add notes
- Notes are stored with author and timestamp

---

**Milestone Schema Fields:**
- `business` (ObjectId, required): Project binding
- `title` (string, required, max 200)
- `description` (string, max 2000)
- `files` (array): Each file has `url`, `public_id`, `originalName`, `uploadedAt`
- `status` (string): Allowed values (frontend-enforced): `pending`, `in_progress`, `completed`, `rejected`, `paused`
- `progress` (number, 0-100)
- `notes` (array): Each note has `body`, `author`, `createdAt`
- `createdBy` (ObjectId, required)

**All field names, file upload requirements, status flow, and permissions are mirrored exactly from the backend code.** 