# Offer API – Practical Integration Guide (Accurate)

## 1. Create Offer (POST /api/offers/:requestId)

### Request Format
- **Type:** `multipart/form-data`
- **Why:** File uploads (files) require FormData.

### Fields Table
| Field Name           | Type    | Required | Description / Notes                                 | Allowed Values / Format         | Example Value           |
|----------------------|---------|----------|-----------------------------------------------------|-------------------------------|-------------------------|
| amount               | number  | Yes      | Offer amount                                        | positive number               | 5000                    |
| message              | text    | No       | Optional message                                    | string                        | "Best price..."        |
| items                | text    | No       | JSON string: array of items                         | JSON string                   | '[{"itemType":"Product","itemId":"64a...","quantity":2,"price":100}]' |
| files                | file[]  | No       | Supporting files (PDF/PNG/JPG, max 5MB each)        | .pdf, .png, .jpg              | (multiple files)        |

### Field Dependencies
- Only amount is required.
- All files: Only PDF, PNG, JPG. Max 5MB per file.
- اسم الحقل الصحيح للملفات هو **files** فقط.
- **items** يجب أن يكون JSON string في FormData.

### Middleware
- **uploadMultipleFilesToCloudinary('files')**: Handles file uploads, validates type/size, stores in Cloudinary.
- **protect**: Requires JWT token in Authorization header.

### Auth & Permissions
- **Token Required:** Yes (`Authorization: Bearer <token>`)
- **Roles:** supplier/investor

### Controller Flow
1. يتحقق من جميع الحقول المطلوبة.
2. يتحقق من الملفات (النوع والحجم).
3. يرفع الملفات إلى Cloudinary.
4. ينشئ Offer جديد في قاعدة البيانات.
5. يرجع الرد بنجاح مع بيانات العرض.

### Example: Valid FormData Request (Postman/JS)
```
POST /api/offers/:requestId
Headers:
  Authorization: Bearer <token>
  Content-Type: multipart/form-data
Body (form-data):
  amount: 5000
  message: Best price for your request
  items: [{"itemType":"Product","itemId":"64a...","quantity":2,"price":100}]
  files: (attach multiple files)
```

### Example: JS (fetch)
```js
const formData = new FormData();
formData.append('amount', 5000);
formData.append('message', 'Best price for your request');
formData.append('items', JSON.stringify([
  {itemType: 'Product', itemId: '64a...', quantity: 2, price: 100}
]));
formData.append('files', fileInput.files[0]);

fetch('/api/offers/REQUEST_ID', {
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
  "message": "amount is required"
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
- amount: required, positive number
- message: optional, string
- items: optional, valid JSON string
- files: optional, each file type PDF/PNG/JPG, max 5MB

### Notes
- أي اختلاف في اسم الحقل أو نوعه سيؤدي لرفض الطلب من الـ backend.
- جميع الردود:
  - Success: `{ success: true, data: {...} }`
  - Error: `{ success: false, message }`
- **اسم الحقل للملفات هو files فقط كما في الكود الفعلي.**

---

## 2. Update Offer (PATCH /api/offers/:id)
- **Type:** `multipart/form-data` (إذا كان هناك تحديث ملفات)
- **Headers:** `Authorization: Bearer <token>`
- **Fields:**
  - price (اختياري)
  - description (اختياري)
  - equityPercentage (اختياري)
  - durationInDays (اختياري)
  - items (اختياري، JSON string)
  - files (اختياري)
  - attachmentsToDelete (اختياري، array of public_id)
- **Response:**
```json
{
  "success": true,
  "message": "Offer updated successfully",
  "data": { ... }
}
```
- **Errors:**
  - 404 إذا لم يوجد offer
  - 401 إذا لم يوجد توكن
  - 403 إذا لم تكن المالك

---

## 3. Get Offer (GET /api/offers/:id)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "data": { ... }
}
```
- **Errors:**
  - 404 إذا لم يوجد offer
  - 401 إذا لم يوجد توكن
  - 403 إذا لم تكن المالك أو صاحب الطلب أو أدمن

---

## 4. Accept Offer (PATCH /api/offers/:id/accept)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "message": "Offer accepted",
  "data": { ... }
}
```
- **Errors:**
  - 404 إذا لم يوجد offer
  - 401 إذا لم يوجد توكن
  - 403 إذا لم تكن صاحب الطلب
  - 400 إذا كان العرض مقبول مسبقًا

---

## 5. Reject Offer (PATCH /api/offers/:id/reject)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "message": "Offer rejected"
}
```
- **Errors:**
  - 404 إذا لم يوجد offer
  - 401 إذا لم يوجد توكن
  - 403 إذا لم تكن صاحب الطلب
  - 400 إذا لم يكن العرض pending

---

## 6. Withdraw Offer (PATCH /api/offers/:id/withdraw)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "message": "Offer withdrawn successfully",
  "data": { ... }
}
```
- **Errors:**
  - 404 إذا لم يوجد offer
  - 401 إذا لم يوجد توكن
  - 403 إذا لم تكن المالك
  - 400 إذا لم يكن العرض pending

---

## 7. Delete Offer (DELETE /api/offers/:id)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "message": "Offer deleted"
}
```
- **Errors:**
  - 404 إذا لم يوجد offer
  - 401 إذا لم يوجد توكن
  - 403 إذا لم تكن المالك أو أدمن

---

## 8. List My Offers (GET /api/offers/my)
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

## 9. ملاحظات عامة
- جميع أسماء الحقول مطابقة للكود الفعلي في routes والميدلوير.
- أي اختلاف في اسم الحقل أو نوعه سيؤدي لرفض الطلب من الـ backend.
- جميع عمليات CRUD موثقة بأمثلة عملية. 