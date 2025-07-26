# Users API Documentation

Base URL:
- Dev: `http://localhost:5000`
- Prod: `https://backendelevante-production.up.railway.app`

---

## GET /api/users/profile

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "_id": "USER_ID",
  "username": "username",
  "email": "user@example.com",
  "role": "entrepreneur",
  // ...other user fields (minus password)
}
```

**Errors:**
- `401 Unauthorized` – missing or invalid token
- `404 Not Found` – user not found
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: Authenticated users (all roles)
- Returns the profile of the currently logged-in user

---

## PUT /api/users/profile

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Request Body:**
```json
{
  // Any updatable user fields (e.g., fullName, phone, etc.)
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": { /* updated user object */ }
}
```

**Errors:**
- `401 Unauthorized` – missing or invalid token
- `404 Not Found` – user not found
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: Authenticated users (all roles)
- All fields are updated as provided (no field-level validation in controller)

---

## DELETE /api/users/delete

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "message": "User account deleted successfully"
}
```

**Errors:**
- `401 Unauthorized` – missing or invalid token
- `404 Not Found` – user not found or already deleted
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: Authenticated users (all roles)
- Soft-deletes the user's own account

---

## GET /api/users/all

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Response (200):**
```json
[
  {
    "_id": "USER_ID",
    "username": "username",
    "email": "user@example.com",
    "role": "entrepreneur",
    // ...other user fields (minus password)
  },
  // ...
]
```

**Errors:**
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – user lacks admin permission
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: Admin only
- Returns all users (including deleted) for admin

---

## PUT /api/users/:userId/block

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "blockReason": "Reason for blocking the user"
}
```

**Response (200):**
```json
{
  "message": "User has been blocked",
  "userId": "USER_ID"
}
```

**Errors:**
- `400 Bad Request` – missing block reason, cannot block admin or self
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – user lacks admin permission
- `404 Not Found` – user not found
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: Admin only

---

## PUT /api/users/:userId/unblock

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "message": "User has been unblocked",
  "userId": "USER_ID"
}
```

**Errors:**
- `400 Bad Request` – cannot unblock admin
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – user lacks admin permission
- `404 Not Found` – user not found
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: Admin only

---

## PUT /api/users/:userId/status

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "action": "approve|reject|pending",
  "rejectionReason": "Reason for rejection (required if action is reject)"
}
```

**Response (200):**
```json
{
  "message": "User approved/rejected/pending successfully",
  "userId": "USER_ID"
}
```

**Errors:**
- `400 Bad Request` – invalid action, missing rejection reason
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – user lacks admin permission
- `404 Not Found` – user not found
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: Admin only
- Sends email notification to user

---

## GET /api/users/:userId

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "_id": "USER_ID",
  "username": "username",
  "email": "user@example.com",
  "role": "entrepreneur",
  // ...other user fields (minus password)
}
```

**Errors:**
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – user lacks admin permission
- `404 Not Found` – user not found
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: Admin only
- Returns any user by ID

---

## PATCH /api/users/:userId/restore

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "message": "User restored successfully",
  "user": { /* restored user object */ }
}
```

**Errors:**
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – user lacks admin permission
- `404 Not Found` – user not found or not deleted
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: Admin only

---

## GET /api/users/admin/dashboard-stats

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "users": {
    "total": 100,
    "entrepreneurs": 40,
    "suppliers": 30,
    "investors": 20,
    "admins": 10
  },
  "deals": 50,
  "requests": 60,
  "offers": 70,
  "orders": 80,
  "directRequests": 90,
  "products": 100,
  "services": 110,
  "activityLast7Days": [
    { "date": "2024-05-01", "count": 10 },
    // ...
  ]
}
```

**Errors:**
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – user lacks admin permission
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: Admin only
- Returns dashboard stats for admin

---

## PATCH /api/users/admin/:userId/change-role

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "newRole": "entrepreneur|supplier|investor"
}
```

**Response (200):**
```json
{
  "message": "User role updated successfully.",
  "userId": "USER_ID",
  "oldRole": "supplier",
  "newRole": "entrepreneur"
}
```

**Errors:**
- `400 Bad Request` – invalid role, missing required fields for new role, cannot change admin role, already has role
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – user lacks admin permission
- `404 Not Found` – user not found
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: Admin only
- Required fields for new role:
  - `entrepreneur`: must have `startupName`
  - `supplier`: must have `supplierType`
  - `investor`: must have `investmentRange`

---

## DELETE /api/users/admin/:userId/soft-delete

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "message": "User soft deleted successfully",
  "userId": "USER_ID"
}
```

**Errors:**
- `400 Bad Request` – cannot delete admin, cannot delete self, already deleted
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – user lacks admin permission
- `404 Not Found` – user not found
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: Admin only

---

## GET /api/users/admin/uploaded-files

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "count": 123,
  "files": [
    {
      "url": "https://...",
      "owner": "USER_ID",
      "ownerName": "User Name",
      "type": "User|Business|Milestone|Deal|Request|Offer|Message|DirectRequest",
      // ...other file fields
    },
    // ...
  ]
}
```

**Errors:**
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – user lacks admin permission
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: Admin only
- Returns all uploaded files from all entities

---

## DELETE /api/users/admin/delete-uploaded-file

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "entityType": "User|Business|Milestone|Deal|Request|Offer|Message|DirectRequest",
  "entityId": "ENTITY_ID",
  "fileField": "fieldName",
  "fileUrl": "https://...",
  "public_id": "cloudinary_public_id"
}
```

**Response (200):**
```json
{
  "message": "File deleted successfully."
}
```

**Errors:**
- `400 Bad Request` – invalid entityType, file not found or already deleted
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – user lacks admin permission
- `404 Not Found` – entity not found
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: Admin only
- Deletes file from Cloudinary and DB

---

## GET /api/users/admin/financial-overview

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Query Params:**
- `status` (optional): filter by status

**Response (200):**
```json
{
  "withdrawals": [ /* WithdrawalRequest[] */ ],
  "disputes": [ /* Dispute[] */ ],
  "deals": [ /* Deal[] */ ]
}
```

**Errors:**
- `401 Unauthorized` – missing or invalid token
- `403 Forbidden` – user lacks admin permission
- `500 Server Error` – unhandled backend failure

**Notes:**
- Available to: Admin only
- Returns financial and operational overview

---

**All field names, validation rules, and permissions are mirrored exactly from the backend code.** 