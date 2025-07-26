# DirectRequest API – Practical Integration Guide (Accurate)

## 1. Create Direct Request (POST /api/direct-requests)

### Request Format
- **Type:** `multipart/form-data`
- **Why:** File uploads (attachments) require FormData.

### Fields Table
| Field Name           | Type    | Required | Description / Notes                                 | Allowed Values / Format         | Example Value           |
|----------------------|---------|----------|-----------------------------------------------------|-------------------------------|-------------------------|
| type                 | text    | Yes      | Request type                                        | enum: deal, order             | "deal"                 |
| targetUser           | text    | Yes      | UserId (ObjectId)                                   | 24-char hex                   | "64a1b2c3d4e5f6..."     |
| business             | text    | Yes      | BusinessId (ObjectId)                               | 24-char hex                   | "64a1b2c3d4e5f6..."     |
| relatedRequest       | text    | No       | RequestId (ObjectId, if related to public request)  | 24-char hex                   | "64a1b2c3d4e5f6..."     |
| offerDetails         | text    | No       | Offer details (JSON string)                         | JSON string                   | '{"amount":5000}'       |
| attachments          | file[]  | No       | Supporting files (PDF/PNG/JPG, max 5MB each)        | .pdf, .png, .jpg              | (multiple files)        |

### Field Dependencies
- All fields required except relatedRequest, offerDetails, attachments.
- All files: Only PDF, PNG, JPG. Max 5MB per file.
- اسم الحقل الصحيح للملفات هو **attachments** فقط.
- **offerDetails** يجب أن يكون JSON string في FormData.

### Middleware
- **uploadMultipleFilesToCloudinary('attachments', 'direct-requests')**: Handles file uploads, validates type/size, stores in Cloudinary.
- **protect**: Requires JWT token in Authorization header.

### Auth & Permissions
- **Token Required:** Yes (`Authorization: Bearer <token>`)
- **Roles:** أي مستخدم مسجل

### Controller Flow
1. يتحقق من جميع الحقول المطلوبة.
2. يتحقق من الملفات (النوع والحجم وعدم وجود بيانات تواصل).
3. يرفع الملفات إلى Cloudinary.
4. ينشئ DirectRequest جديد في قاعدة البيانات.
5. يرجع الرد بنجاح مع بيانات الطلب.

### Example: Valid FormData Request (Postman/JS)
```
POST /api/direct-requests
Headers:
  Authorization: Bearer <token>
  Content-Type: multipart/form-data
Body (form-data):
  type: deal
  targetUser: 64a1b2c3d4e5f6...
  business: 64a1b2c3d4e5f6...
  offerDetails: {"amount":5000}
  attachments: (attach multiple files)
```

### Example: JS (fetch)
```js
const formData = new FormData();
formData.append('type', 'deal');
formData.append('targetUser', '64a1b2c3d4e5f6...');
formData.append('business', '64a1b2c3d4e5f6...');
formData.append('offerDetails', JSON.stringify({amount: 5000}));
formData.append('attachments', fileInput.files[0]);

fetch('/api/direct-requests', {
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
  "message": "type, targetUser, and business are required"
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
- type: required, enum: deal, order
- targetUser: required, valid ObjectId
- business: required, valid ObjectId
- offerDetails: optional, valid JSON string
- attachments: optional, each file type PDF/PNG/JPG, max 5MB

### Notes
- أي اختلاف في اسم الحقل أو نوعه سيؤدي لرفض الطلب من الـ backend.
- جميع الردود:
  - Success: `{ success: true, data: {...} }`
  - Error: `{ success: false, message }`
- **اسم الحقل للملفات هو attachments فقط كما في الكود الفعلي.**

---

## 2. Get DirectRequest (GET /api/direct-requests/:id)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "data": { ... }
}
```
- **Errors:**
  - 404 إذا لم يوجد direct request
  - 401 إذا لم يوجد توكن

---

## 3. Respond to DirectRequest (PATCH /api/direct-requests/:id/respond)
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  - decision: accepted | rejected (required)
- **Response:**
```json
{
  "success": true,
  "data": { ... } // updated request or created deal/order
}
```
- **Errors:**
  - 404 إذا لم يوجد direct request
  - 401 إذا لم يوجد توكن
  - 403 إذا لم تكن المستهدف
  - 400 إذا كان القرار غير صحيح أو تم الرد مسبقًا

---

## 4. Withdraw DirectRequest (PATCH /api/direct-requests/:id/withdraw)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "message": "Request withdrawn successfully",
  "data": { ... }
}
```
- **Errors:**
  - 404 إذا لم يوجد direct request
  - 401 إذا لم يوجد توكن
  - 403 إذا لم تكن المرسل
  - 400 إذا كان الطلب غير قابل للسحب

---

## 5. List My DirectRequests (GET /api/direct-requests/my)
- **Headers:** `Authorization: Bearer <token>`
- **Query:** `status`, `type`, `search`, `sort`, `page`, `limit` (اختياري)
- **Response:**
```json
{
  "success": true,
  "count": 2,
  "total": 2,
  "page": 1,
  "pages": 1,
  "data": [ ... ]
}
```

---

## 6. ملاحظات عامة
- جميع أسماء الحقول مطابقة للكود الفعلي في routes والميدلوير.
- أي اختلاف في اسم الحقل أو نوعه سيؤدي لرفض الطلب من الـ backend.
- جميع عمليات CRUD موثقة بأمثلة عملية. 