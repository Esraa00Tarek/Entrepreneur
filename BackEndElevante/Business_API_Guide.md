# Business API – Practical Integration Guide (Accurate)

## 1. Create Business (POST /api/businesses)

### Request Format
- **Type:** `multipart/form-data`
- **Why:** File uploads (files) require FormData.

### Fields Table
| Field Name           | Type    | Required | Description / Notes                                 | Allowed Values / Format         | Example Value           |
|----------------------|---------|----------|-----------------------------------------------------|-------------------------------|-------------------------|
| name                 | text    | Yes      | Business name                                       | min 3, max 100                | "Acme Inc."             |
| category             | text    | Yes      | Business category                                   | string                        | "tech"                  |
| description          | text    | Yes      | Description                                         | min 10, max 5000              | "Leading provider..."   |
| location             | object  | No       | Location info (JSON)                                | object or JSON string          | {"city":"Cairo"}      |
| contact              | object  | No       | Contact info (JSON)                                 | object or JSON string          | {"email":"..."}        |
| financial            | object  | No       | Financial info (JSON)                               | object or JSON string          | {"investmentNeeded":10000} |
| tags                 | array   | No       | Tags (JSON array)                                   | array or JSON string           | ["startup","AI"]       |
| status               | text    | No       | Business status                                     | string                        | "active"                |
| files                | file[]  | No       | Supporting files (PDF/PNG/JPG, max 5MB each)        | .pdf, .png, .jpg              | (multiple files)        |

### Field Dependencies
- All fields required except location, contact, financial, tags, status, files.
- All files: Only PDF, PNG, JPG. Max 5MB per file.
- اسم الحقل الصحيح للملفات هو **files** فقط.

### Middleware
- **uploadMultipleFilesToCloudinary('files', 'businesses')**: Handles file uploads, validates type/size, stores in Cloudinary.
- **protect**: Requires JWT token in Authorization header.

### Auth & Permissions
- **Token Required:** Yes (`Authorization: Bearer <token>`)
- **Roles:** entrepreneur only

### Controller Flow
1. Validate all required fields and file types/sizes.
2. Upload files to Cloudinary, get URLs.
3. Create Business document in MongoDB.
4. Return success response with business data.

### Example: Valid FormData Request (Postman/JS)
```
POST /api/businesses
Headers:
  Authorization: Bearer <token>
  Content-Type: multipart/form-data
Body (form-data):
  name: Acme Inc.
  category: tech
  description: Leading provider of ...
  location: {"city":"Cairo"}
  contact: {"email":"info@acme.com"}
  financial: {"investmentNeeded":10000}
  tags: ["startup","AI"]
  status: active
  files: (attach multiple files)
```

### Example: JS (fetch)
```js
const formData = new FormData();
formData.append('name', 'Acme Inc.');
formData.append('category', 'tech');
formData.append('description', 'Leading provider of ...');
formData.append('location', JSON.stringify({city: 'Cairo'}));
formData.append('contact', JSON.stringify({email: 'info@acme.com'}));
formData.append('financial', JSON.stringify({investmentNeeded: 10000}));
formData.append('tags', JSON.stringify(['startup','AI']));
formData.append('status', 'active');
formData.append('files', fileInput.files[0]);

fetch('/api/businesses', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer <token>' },
  body: formData
});
```

### Response Examples
#### Success
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6...",
    "name": "Acme Inc.",
    "category": "tech",
    "description": "...",
    "location": {"city":"Cairo"},
    "contact": {"email":"info@acme.com"},
    "financial": {"investmentNeeded":10000},
    "tags": ["startup","AI"],
    "status": "active",
    "files": [
      {
        "filename": "https://res.cloudinary.com/...",
        "originalName": "file.pdf",
        "fileType": "application/pdf",
        "fileSize": 123456,
        "uploadedAt": "2024-07-01T12:00:00Z"
      }
    ]
  }
}
```
#### Error: Missing Required Field
```json
{
  "success": false,
  "message": "name, category, and description are required"
}
```
#### Error: Wrong File Type
```json
{
  "success": false,
  "message": "File type not allowed. Only PDF, PNG, JPG are accepted."
}
```
#### Error: File Too Large
```json
{
  "success": false,
  "message": "File size exceeds 5MB limit."
}
```
#### Error: Invalid Token
```json
{
  "success": false,
  "message": "Not authorized, token failed"
}
```

### Validation Rules (Frontend must mirror)
- name: required, min 3, max 100
- category: required, string
- description: required, min 10, max 5000
- location: optional, valid JSON object
- contact: optional, valid JSON object
- financial: optional, valid JSON object
- tags: optional, array
- status: optional, string
- files: optional, each file type PDF/PNG/JPG, max 5MB

### Notes
- Any deviation from required fields, types, or formats will result in backend rejection.
- All file uploads must use multipart/form-data and field names as above.
- All responses follow:
  - Success: `{ success: true, data: {...} }`
  - Error: `{ success: false, message: "Reason of failure" }`
- **اسم الحقل للملفات هو files فقط كما في الكود الفعلي.**

---

## 2. Get Business (GET /api/businesses/:id)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6...",
    "name": "Acme Inc.",
    "category": "tech",
    "description": "...",
    "location": {"city":"Cairo"},
    "contact": {"email":"info@acme.com"},
    "financial": {"investmentNeeded":10000},
    "tags": ["startup","AI"],
    "status": "active",
    "files": [ ... ]
  }
}
```
- **Errors:**
  - 404 إذا لم يوجد business
  - 401 إذا لم يوجد توكن

---

## 3. Update Business (PUT /api/businesses/:id)
- **Type:** `multipart/form-data` (إذا كان هناك تحديث ملفات)
- **Headers:** `Authorization: Bearer <token>`
- **Fields:** نفس الحقول أعلاه (كلها optional، لكن يجب إرسال ما تريد تعديله فقط)
- **ملاحظات:**
  - إذا أرسلت files سيتم استبدال الملفات القديمة بالجديدة.
  - إذا لم ترسل files ستبقى الملفات القديمة كما هي.
- **Response:** نفس شكل النجاح أعلاه.
- **Errors:**
  - 404 إذا لم يوجد business
  - 401 إذا لم يوجد توكن
  - 400 إذا كان هناك خطأ في البيانات أو الملفات

---

## 4. Patch Business (PATCH /api/businesses/:id)
- **Type:** `multipart/form-data` (إذا كان هناك تحديث ملفات)
- **Headers:** `Authorization: Bearer <token>`
- **Fields:** نفس الحقول أعلاه (كلها optional، لكن يجب إرسال ما تريد تعديله فقط)
- **ملاحظات:**
  - إذا أرسلت files سيتم استبدال الملفات القديمة بالجديدة.
  - إذا لم ترسل files ستبقى الملفات القديمة كما هي.
- **Response:** نفس شكل النجاح أعلاه.
- **Errors:**
  - 404 إذا لم يوجد business
  - 401 إذا لم يوجد توكن
  - 400 إذا كان هناك خطأ في البيانات أو الملفات

---

## 5. Delete Business (DELETE /api/businesses/:id)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "message": "Business deleted successfully"
}
```
- **Errors:**
  - 404 إذا لم يوجد business
  - 401 إذا لم يوجد توكن
  - 403 إذا لم يكن لديك صلاحية

---

## 6. List Businesses (GET /api/businesses)
- **Headers:** `Authorization: Bearer <token>`
- **Query:** `page`, `limit` (اختياري)
- **Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "meta": { "total": 100, "page": 1, "pages": 10 }
}
```

---

## 7. ملاحظات عامة
- جميع أسماء الحقول مطابقة للكود الفعلي في routes والميدلوير.
- أي اختلاف في اسم الحقل أو نوعه سيؤدي لرفض الطلب من الـ backend.
- جميع عمليات CRUD موثقة بأمثلة عملية. 