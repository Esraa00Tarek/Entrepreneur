# Deal API – Practical Integration Guide (Accurate)

## 1. Create Deal (POST /api/deals)

### Request Format
- **Type:** `multipart/form-data`
- **Why:** File uploads (attachments) require FormData.

### Fields Table
| Field Name           | Type    | Required | Description / Notes                                 | Allowed Values / Format         | Example Value           |
|----------------------|---------|----------|-----------------------------------------------------|-------------------------------|-------------------------|
| participants         | text    | Yes      | JSON string: Array of {user: ObjectId, role: 'entrepreneur'/'investor'} | JSON string              | '[{"user":"64a1b2...","role":"entrepreneur"},{"user":"64a1b2...","role":"investor"}]' |
| relatedBusiness      | text    | Yes      | BusinessId (ObjectId)                               | 24-char hex                   | "64a1b2c3d4e5f6..."     |
| relatedRequest       | text    | No       | RequestId (ObjectId, if related to public request)  | 24-char hex                   | "64a1b2c3d4e5f6..."     |
| amount              | number  | Yes      | Deal amount                                         | positive number               | 10000                   |
| status              | text    | No       | Deal status                                         | enum: pending, in Progress, rejected, cancelled, completed, withdrawn, funded | "pending" |
| attachments         | file[]  | No       | Supporting files (PDF/PNG/JPG, max 5MB each)        | .pdf, .png, .jpg              | (multiple files)        |

### Field Dependencies
- All fields required except relatedRequest, status, attachments.
- All files: Only PDF, PNG, JPG. Max 5MB per file.
- اسم الحقل الصحيح للملفات هو **attachments** فقط.
- **participants** يجب أن يكون JSON string في FormData.

### Middleware
- **uploadMultipleFilesToCloudinary('attachments', 'deals')**: Handles file uploads, validates type/size, stores in Cloudinary.
- **protect**: Requires JWT token in Authorization header.

### Auth & Permissions
- **Token Required:** Yes (`Authorization: Bearer <token>`)
- **Roles:** participant in deal or admin

### Controller Flow
1. يتحقق من جميع الحقول المطلوبة.
2. يتحقق من الملفات (النوع والحجم).
3. يرفع الملفات إلى Cloudinary.
4. ينشئ Deal جديد في قاعدة البيانات.
5. يرجع الرد بنجاح مع بيانات الصفقة.

### Example: Valid FormData Request (Postman/JS)
```
POST /api/deals
Headers:
  Authorization: Bearer <token>
  Content-Type: multipart/form-data
Body (form-data):
  participants: [{"user":"64a1b2c3d4e5f6...","role":"entrepreneur"},{"user":"64a1b2c3d4e5f6...","role":"investor"}]
  relatedBusiness: 64a1b2c3d4e5f6...
  amount: 10000
  attachments: (attach multiple files)
```

### Example: JS (fetch)
```js
const formData = new FormData();
formData.append('participants', JSON.stringify([
  {user: '64a1b2c3d4e5f6...', role: 'entrepreneur'},
  {user: '64a1b2c3d4e5f6...', role: 'investor'}
]));
formData.append('relatedBusiness', '64a1b2c3d4e5f6...');
formData.append('amount', 10000);
formData.append('attachments', fileInput.files[0]);

fetch('/api/deals', {
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
  "data": { ... }
}
```
#### Error: Missing Required Field
```json
{
  "success": false,
  "message": "participants, relatedBusiness, and amount are required"
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
- participants: required, JSON string, must include both roles
- relatedBusiness: required, valid ObjectId
- amount: required, positive number
- status: optional, enum: pending, in Progress, rejected, cancelled, completed, withdrawn, funded
- attachments: optional, each file type PDF/PNG/JPG, max 5MB

### Notes
- أي اختلاف في اسم الحقل أو نوعه سيؤدي لرفض الطلب من الـ backend.
- جميع الردود:
  - Success: `{ success: true, data: {...} }`
  - Error: `{ success: false, message }`
- **اسم الحقل للملفات هو attachments فقط كما في الكود الفعلي.**

---

## 2. Get Deal (GET /api/deals/:id)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "data": { ... }
}
```
- **Errors:**
  - 404 إذا لم يوجد deal
  - 401 إذا لم يوجد توكن

---

## 3. Update Deal Status (PATCH /api/deals/:id/status)
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  - status: new status (required)
  - statusReason: string (optional)
- **Response:**
```json
{
  "success": true,
  "message": "Deal status updated",
  "data": { ... }
}
```
- **Errors:**
  - 404 إذا لم يوجد deal
  - 401 إذا لم يوجد توكن
  - 403 إذا لم تكن مشاركًا
  - 400 إذا كان الانتقال غير مسموح

---

## 4. Withdraw Deal (PATCH /api/deals/:id/withdraw)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "message": "Deal withdrawn successfully",
  "data": { ... }
}
```
- **Errors:**
  - 404 إذا لم يوجد deal
  - 401 إذا لم يوجد توكن
  - 403 إذا لم تكن المرسل
  - 400 إذا كان الطلب غير قابل للسحب

---

## 5. Delete Deal (DELETE /api/deals/:id)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "message": "Deal deleted successfully"
}
```
- **Errors:**
  - 404 إذا لم يوجد deal
  - 401 إذا لم يوجد توكن
  - 403 إذا لم يكن لديك صلاحية

---

## 6. List My Deals (GET /api/deals/my)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [ ... ]
}
```

---

## 7. ملاحظات عامة
- جميع أسماء الحقول مطابقة للكود الفعلي في routes والميدلوير.
- أي اختلاف في اسم الحقل أو نوعه سيؤدي لرفض الطلب من الـ backend.
- جميع عمليات CRUD موثقة بأمثلة عملية. 