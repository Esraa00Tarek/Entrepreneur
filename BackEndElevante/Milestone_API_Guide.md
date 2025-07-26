# Milestone API – Practical Integration Guide (Accurate)

## 1. Create Milestone (POST /api/milestones?businessId=...)

### Request Format
- **Type:** `multipart/form-data`
- **Why:** File uploads (files) require FormData.

### Fields Table
| Field Name           | Type    | Required | Description / Notes                                 | Allowed Values / Format         | Example Value           |
|----------------------|---------|----------|-----------------------------------------------------|-------------------------------|-------------------------|
| title                | text    | Yes      | Milestone title                                     | min 5, max 200                | "First Payment"         |
| description          | text    | No       | Milestone description                               | max 2000                      | "This covers..."        |
| stageUpdate          | text    | No       | Update business status to this value                | (enum/any string)              | "in progress"           |
| files                | file[]  | No       | Supporting files (PDF/PNG/JPG, max 5MB each)        | .pdf, .png, .jpg              | (multiple files)        |

### Field Dependencies
- Only `title` is required.
- All files: Only PDF, PNG, JPG. Max 5MB per file.
- اسم الحقل الصحيح للملفات هو **files** فقط.
- **businessId** يجب أن يكون في query string وليس في body.

### Middleware
- **uploadMultipleFilesToCloudinary('files', 'milestones')**: Handles file uploads, validates type/size, stores in Cloudinary.
- **protect**: Requires JWT token in Authorization header.
- **restrictTo('entrepreneur')**: Only entrepreneur can create.

### Auth & Permissions
- **Token Required:** Yes (`Authorization: Bearer <token>`)
- **Roles:** entrepreneur only

### Controller Flow
1. يتأكد من وجود businessId في query.
2. يتحقق من ملكية المشروع.
3. يرفع الملفات (إن وجدت) إلى Cloudinary.
4. ينشئ Milestone جديد ويربطه بالمشروع.
5. يرجع الرد بنجاح مع بيانات milestone.

### Example: Valid FormData Request (Postman/JS)
```
POST /api/milestones?businessId=64a1b2c3d4e5f6...
Headers:
  Authorization: Bearer <token>
  Content-Type: multipart/form-data
Body (form-data):
  title: First Payment
  description: This covers the initial payment for ...
  stageUpdate: in progress
  files: (attach multiple files)
```

### Example: JS (fetch)
```js
const formData = new FormData();
formData.append('title', 'First Payment');
formData.append('description', 'This covers the initial payment for ...');
formData.append('stageUpdate', 'in progress');
formData.append('files', fileInput.files[0]);

fetch('/api/milestones?businessId=64a1b2c3d4e5f6...', {
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
  "message": "Milestone created successfully",
  "data": { ... }
}
```
#### Error: Missing Required Field
```json
{
  "success": false,
  "message": "Business ID is required in query"
}
```
#### Error: Not Authorized
```json
{
  "success": false,
  "message": "Not authorized to update this project"
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
- title: required, min 5, max 200
- description: optional, max 2000
- files: optional, each file type PDF/PNG/JPG, max 5MB
- businessId: required في query

### Notes
- أي اختلاف في اسم الحقل أو نوعه سيؤدي لرفض الطلب من الـ backend.
- جميع الردود:
  - Success: `{ success: true, message, data }`
  - Error: `{ success: false, message }`
- **اسم الحقل للملفات هو files فقط كما في الكود الفعلي.**

---

## 2. Get Milestone (GET /api/milestones/:id)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "data": { ... }
}
```
- **Errors:**
  - 404 إذا لم يوجد milestone
  - 401 إذا لم يوجد توكن

---

## 3. Update Milestone (PUT /api/milestones/:id)
- **Type:** `application/json`
- **Headers:** `Authorization: Bearer <token>`
- **Fields:**
  - title (اختياري)
  - description (اختياري)
  - stageUpdate (اختياري)
- **ملاحظات:**
  - لا يمكن رفع ملفات جديدة في التحديث.
- **Response:** نفس شكل النجاح أعلاه.
- **Errors:**
  - 404 إذا لم يوجد milestone
  - 401 إذا لم يوجد توكن
  - 400 إذا كان هناك خطأ في البيانات

---

## 4. Delete Milestone (DELETE /api/milestones/:id)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "message": "Milestone deleted successfully"
}
```
- **Errors:**
  - 404 إذا لم يوجد milestone
  - 401 إذا لم يوجد توكن
  - 403 إذا لم يكن لديك صلاحية

---

## 5. List Milestones (GET /api/milestones/business/:businessId)
- **Headers:** `Authorization: Bearer <token>`
- **Query:** `page`, `limit` (اختياري)
- **Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [ ... ]
}
```

---

## 6. ملاحظات عامة
- جميع أسماء الحقول مطابقة للكود الفعلي في routes والميدلوير.
- أي اختلاف في اسم الحقل أو نوعه سيؤدي لرفض الطلب من الـ backend.
- جميع عمليات CRUD موثقة بأمثلة عملية. 