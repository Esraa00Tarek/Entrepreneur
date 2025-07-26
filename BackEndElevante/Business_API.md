# Business API Documentation

## 1. Create Business (POST /api/businesses)

### Request Format
- **Type:** `multipart/form-data`
- **Why:** File uploads (companyProfileFile, attachments) require FormData.

### Fields
| Field Name           | Type    | Required | Description / Notes                                 | Example Value           |
|----------------------|---------|----------|-----------------------------------------------------|-------------------------|
| name                 | text    | Yes      | Business name                                       | "Acme Inc."             |
| description          | text    | Yes      | Description (min 50, max 1000)                      | "Leading provider..."   |
| industry             | text    | Yes      | Industry (enum: "tech", "finance", ...)            | "tech"                  |
| owner                | text    | Yes      | UserId (ObjectId)                                   | "64a1b2c3d4e5f6..."     |
| companyProfileFile   | file    | Yes      | PDF/PNG/JPG, max 5MB                                | (file upload)           |
| website              | text    | No       | Valid URL                                           | "https://acme.com"      |
| phone                | text    | No       | Valid phone number                                  | "+1234567890"           |
| attachments[]        | file[]  | No       | Additional files (PDF/PNG/JPG, max 5MB each)        | (multiple files)        |

### Middleware
- **uploadMultipleFilesToCloudinary**: Handles file uploads, validates type/size, stores in Cloudinary.
- **protect**: Requires JWT token in Authorization header.

### Authentication & Authorization
- **Token Required:** Yes (`Authorization: Bearer <token>`)
- **Roles:** entrepreneur or admin

### Controller Flow
1. Validate all required fields.
2. Upload files to Cloudinary, get URLs.
3. Create Business document in MongoDB.
4. Return success response with business data.

### Response
#### Success
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6...",
    "name": "Acme Inc.",
    "description": "...",
    "industry": "tech",
    "owner": "64a1b2c3d4e5f6...",
    "companyProfileFile": "https://res.cloudinary.com/...",
    "website": "https://acme.com",
    "phone": "+1234567890",
    "attachments": [
      "https://res.cloudinary.com/..."
    ]
  }
}
```
#### Error
```json
{
  "success": false,
  "message": "Field 'name' is required"
}
```
Or
```json
{
  "success": false,
  "message": "File type not allowed. Only PDF, PNG, JPG are accepted."
}
```

### Validation Rules (Frontend must mirror)
- name: required, min 3, max 120
- description: required, min 50, max 1000
- industry: required, must be one of allowed enums
- companyProfileFile: required, type PDF/PNG/JPG, max 5MB
- website: optional, must be valid URL
- phone: optional, must be valid phone number
- attachments: optional, each file type PDF/PNG/JPG, max 5MB

---

## 2. Other CRUD Endpoints

### GET /api/businesses/:id
- **Returns:** Business data by id.
- **Auth:** Required.
- **Response:** Same as success above.

### PUT /api/businesses/:id
- **Type:** `multipart/form-data` (if updating files)
- **Fields:** Same as above (all optional).
- **Auth:** Must be owner or admin.

### DELETE /api/businesses/:id
- **Auth:** Must be owner or admin.
- **Response:** `{ "success": true, "message": "Business deleted" }`

---

## 3. Postman Collection Scenarios
- POST /api/businesses (FormData)
  - All fields valid → Success
  - Missing required field → Error
  - Wrong file type → Error
  - File too large → Error
  - Missing/invalid token → Error

---

## 4. Environment & Performance
- **BASE_URL:**
  - Dev: `http://localhost:5000/api/businesses`
  - Prod: `https://api.yourdomain.com/api/businesses`
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Rate-Limiting:** 60 requests/minute per user
- **Pagination:**
  - GET /api/businesses?page=1&limit=10
  - Response:
    ```json
    {
      "success": true,
      "data": [...],
      "meta": { "total": 100, "page": 1, "pages": 10 }
    }
    ```

---

## Notes
- Any error in fields, permissions, or file type will result in a clear error message.
- Frontend must strictly follow field names, types, and formats.
- Enum values and status must be from allowed values only. 