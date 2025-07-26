# Service API – Practical Integration Guide (Accurate)

## 1. Create Service (POST /api/services)

### Request Format
- **Type:** `multipart/form-data`
- **Why:** File uploads (images, serviceFile) require FormData.

### Fields Table
| Field Name    | Type    | Required | Description / Notes                                 | Allowed Values / Format         | Example Value           |
|---------------|---------|----------|-----------------------------------------------------|-------------------------------|-------------------------|
| name          | text    | Yes      | Service name                                        | string                        | "Web Design"           |
| category      | text    | Yes      | Service category                                    | string                        | "IT"                   |
| price         | number  | Yes      | Service price                                       | positive number               | 1500                    |
| description   | text    | Yes      | Service description                                 | string                        | "Professional ..."      |
| images        | file[]  | No       | Service images (PNG/JPG/JPEG, max 5MB each)         | .png, .jpg, .jpeg             | (multiple files)        |
| serviceFile   | file    | No       | Single file (PDF/Word, max 5MB)                     | .pdf, .doc, .docx             | (one file)              |

### Field Dependencies
- Only name, category, price, description are required.
- images: يقبل عدة صور (PNG/JPG/JPEG)، كل صورة حتى 5MB.
- serviceFile: ملف واحد فقط (PDF أو Word)، حتى 5MB.
- اسم الحقل للصور هو **images**، واسم الحقل للملف هو **serviceFile**.

### Middleware
- **uploadServiceFiles('images', 'serviceFile', 'services')**: Handles file uploads, validates type/size, stores in Cloudinary.
- **protect**: Requires JWT token in Authorization header.
- **restrictTo('supplier')**: Only supplier can create.

### Auth & Permissions
- **Token Required:** Yes (`Authorization: Bearer <token>`)
- **Roles:** supplier فقط

### Controller Flow
1. يتحقق من جميع الحقول المطلوبة.
2. يتحقق من الصور والملفات (النوع والحجم).
3. يرفع الصور إلى Cloudinary (req.imageUrls)، ويرفع الملف إلى Cloudinary (req.cloudinaryFileUrl).
4. ينشئ Service جديد في قاعدة البيانات.
5. يرجع الرد بنجاح مع بيانات الخدمة.

### Example: Valid FormData Request (Postman/JS)
```
POST /api/services
Headers:
  Authorization: Bearer <token>
  Content-Type: multipart/form-data
Body (form-data):
  name: Web Design
  category: IT
  price: 1500
  description: Professional web design service
  images: (attach multiple images)
  serviceFile: (attach one file)
```

### Example: JS (fetch)
```js
const formData = new FormData();
formData.append('name', 'Web Design');
formData.append('category', 'IT');
formData.append('price', 1500);
formData.append('description', 'Professional web design service');
formData.append('images', imageInput.files[0]);
formData.append('images', imageInput.files[1]);
formData.append('serviceFile', fileInput.files[0]);

fetch('/api/services', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer <token>' },
  body: formData
});
```

### Response Examples
#### Success
```json
{
  "message": "Service created successfully",
  "service": { ... }
}
```
#### Error: Missing Required Field
```json
{
  "error": "Missing required fields: name, category, price, and description are required"
}
```
#### Error: Wrong File Type
```json
{
  "error": "File type not allowed. Only PNG, JPG, JPEG, PDF, DOC, DOCX are accepted."
}
```
#### Error: File Too Large
```json
{
  "error": "File size exceeds 5MB limit."
}
```
#### Error: Invalid Token
```json
{
  "error": "Not authorized, token failed"
}
```

### Validation Rules (Frontend must mirror)
- name: required, string
- category: required, string
- price: required, positive number
- description: required, string
- images: optional, each file type PNG/JPG/JPEG, max 5MB
- serviceFile: optional, file type PDF/DOC/DOCX, max 5MB

### Notes
- أي اختلاف في اسم الحقل أو نوعه سيؤدي لرفض الطلب من الـ backend.
- جميع الردود:
  - Success: `{ message, service }`
  - Error: `{ error }`
- **اسم الحقل للصور هو images، واسم الحقل للملف هو serviceFile فقط كما في الكود الفعلي.**

---

## 2. Update Service (PUT /api/services/:serviceId)
- **Type:** `multipart/form-data` (إذا كان هناك تحديث صور/ملفات)
- **Headers:** `Authorization: Bearer <token>`
- **Fields:**
  - name, category, price, description, isActive, status (اختياري)
  - images (اختياري)
  - serviceFile (اختياري)
- **Response:**
```json
{
  "_id": "...",
  "name": "...",
  ...
}
```
- **Errors:**
  - 404 إذا لم يوجد service
  - 401 إذا لم يوجد توكن
  - 403 إذا لم تكن المورد

---

## 3. Delete Service (DELETE /api/services/:serviceId)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "message": "Service deleted successfully"
}
```
- **Errors:**
  - 404 إذا لم يوجد service
  - 401 إذا لم يوجد توكن
  - 403 إذا لم تكن المورد

---

## 4. Toggle Service Active Status (PATCH /api/services/:serviceId/toggle-active)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "message": "Service is now active",
  "isActive": true
}
```
- **Errors:**
  - 404 إذا لم يوجد service
  - 401 إذا لم يوجد توكن
  - 403 إذا لم تكن المورد

---

## 5. Get Service by ID (GET /api/services/:serviceId)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "_id": "...",
  "name": "...",
  ...
}
```
- **Errors:**
  - 404 إذا لم يوجد service
  - 401 إذا لم يوجد توكن
  - 403 إذا لم تكن المورد

---

## 6. Get Services by Supplier (GET /api/services/supplier/:supplierId)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
[
  { "_id": "...", ... },
  ...
]
```

---

## 7. Filter Services (GET /api/services)
- **Headers:** `Authorization: Bearer <token>`
- **Query:** name, category, isActive, supplierId (اختياري)
- **Response:**
```json
[
  { "_id": "...", ... },
  ...
]
```

---

## 8. Upload File to Service (POST /api/services/:serviceId/upload-file)
- **Type:** `multipart/form-data`
- **Headers:** `Authorization: Bearer <token>`
- **Fields:**
  - serviceFile (مطلوب)
- **Response:**
```json
{
  "message": "File uploaded and attached to service successfully",
  "fileUrl": "...",
  "service": { ... }
}
```
- **Errors:**
  - 404 إذا لم يوجد service
  - 401 إذا لم يوجد توكن
  - 403 إذا لم تكن المورد
  - 400 إذا لم يتم رفع ملف

---

## 9. ملاحظات عامة
- جميع أسماء الحقول مطابقة للكود الفعلي في routes والميدلوير.
- أي اختلاف في اسم الحقل أو نوعه سيؤدي لرفض الطلب من الـ backend.
- جميع عمليات CRUD موثقة بأمثلة عملية. 