# Product API – Practical Integration Guide (Accurate)

## 1. Create Product (POST /api/products)

### Request Format
- **Type:** `multipart/form-data`
- **Why:** File uploads (images) require FormData.

### Fields Table
| Field Name    | Type    | Required | Description / Notes                                 | Allowed Values / Format         | Example Value           |
|---------------|---------|----------|-----------------------------------------------------|-------------------------------|-------------------------|
| name          | text    | Yes      | Product name                                        | string                        | "Laptop"               |
| category      | text    | Yes      | Product category                                    | string                        | "Electronics"          |
| price         | number  | Yes      | Product price                                       | positive number               | 2500                    |
| stock         | number  | No       | Available stock                                     | integer                       | 50                      |
| description   | text    | No       | Product description                                 | string                        | "High performance..."   |
| images        | file[]  | No       | Product images (PNG/JPG/JPEG, max 5MB each)         | .png, .jpg, .jpeg             | (multiple files)        |

### Field Dependencies
- Only name, category, price are required.
- images: يقبل حتى 10 صور (PNG/JPG/JPEG)، كل صورة حتى 5MB.
- اسم الحقل للصور هو **images** فقط.

### Middleware
- **uploadMultipleImagesToCloudinary('images', 'products')**: Handles file uploads, validates type/size, stores in Cloudinary.
- **protect**: Requires JWT token in Authorization header.
- **restrictTo('supplier')**: Only supplier can create.

### Auth & Permissions
- **Token Required:** Yes (`Authorization: Bearer <token>`)
- **Roles:** supplier فقط

### Controller Flow
1. يتحقق من جميع الحقول المطلوبة.
2. يتحقق من الصور (النوع والحجم).
3. يرفع الصور إلى Cloudinary (req.imageUrls).
4. ينشئ Product جديد في قاعدة البيانات.
5. يرجع الرد بنجاح مع بيانات المنتج.

### Example: Valid FormData Request (Postman/JS)
```
POST /api/products
Headers:
  Authorization: Bearer <token>
  Content-Type: multipart/form-data
Body (form-data):
  name: Laptop
  category: Electronics
  price: 2500
  stock: 50
  description: High performance laptop
  images: (attach multiple images)
```

### Example: JS (fetch)
```js
const formData = new FormData();
formData.append('name', 'Laptop');
formData.append('category', 'Electronics');
formData.append('price', 2500);
formData.append('stock', 50);
formData.append('description', 'High performance laptop');
formData.append('images', imageInput.files[0]);
formData.append('images', imageInput.files[1]);

fetch('/api/products', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer <token>' },
  body: formData
});
```

### Response Examples
#### Success
```json
{
  "_id": "...",
  "name": "Laptop",
  ...
}
```
#### Error: Missing Required Field
```json
{
  "error": "name, category, and price are required"
}
```
#### Error: Wrong File Type
```json
{
  "error": "File type not allowed. Only PNG, JPG, JPEG are accepted."
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
- stock: optional, integer
- description: optional, string
- images: optional, each file type PNG/JPG/JPEG, max 5MB

### Notes
- أي اختلاف في اسم الحقل أو نوعه سيؤدي لرفض الطلب من الـ backend.
- جميع الردود:
  - Success: المنتج كامل
  - Error: `{ error }`
- **اسم الحقل للصور هو images فقط كما في الكود الفعلي.**

---

## 2. Update Product (PUT /api/products/:productId)
- **Type:** `multipart/form-data` (إذا كان هناك تحديث صور)
- **Headers:** `Authorization: Bearer <token>`
- **Fields:**
  - name, category, price, stock, description, isActive (اختياري)
  - images (اختياري)
- **Response:**
```json
{
  "_id": "...",
  "name": "...",
  ...
}
```
- **Errors:**
  - 404 إذا لم يوجد المنتج
  - 401 إذا لم يوجد توكن
  - 403 إذا لم تكن المورد

---

## 3. Delete Product (DELETE /api/products/:productId)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "message": "Product deleted successfully"
}
```
- **Errors:**
  - 404 إذا لم يوجد المنتج
  - 401 إذا لم يوجد توكن
  - 403 إذا لم تكن المورد

---

## 4. Toggle Product Active Status (PATCH /api/products/:productId/toggle-active)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "message": "Product is now active",
  "isActive": true
}
```
- **Errors:**
  - 404 إذا لم يوجد المنتج
  - 401 إذا لم يوجد توكن
  - 403 إذا لم تكن المورد

---

## 5. Get Product by ID (GET /api/products/:productId)
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
  - 404 إذا لم يوجد المنتج
  - 401 إذا لم يوجد توكن
  - 403 إذا لم تكن المورد

---

## 6. Get Products by Supplier (GET /api/products/supplier/:supplierId)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
[
  { "_id": "...", ... },
  ...
]
```

---

## 7. Filter Products (GET /api/products)
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

## 8. ملاحظات عامة
- جميع أسماء الحقول مطابقة للكود الفعلي في routes والميدلوير.
- أي اختلاف في اسم الحقل أو نوعه سيؤدي لرفض الطلب من الـ backend.
- جميع عمليات CRUD موثقة بأمثلة عملية. 