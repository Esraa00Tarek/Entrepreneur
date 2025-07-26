# Order API – Practical Integration Guide (Accurate)

## 1. Create Order (POST /api/orders)

### ملاحظة هامة
- لا يمكن للـ frontend إنشاء order مباشرة مع ملفات أو FormData.
- الإنشاء يتم تلقائيًا بعد قبول عرض (offer) أو من directRequest.
- جميع الحقول المطلوبة تُرسل من الـ backend وليس من المستخدم مباشرة.

### الحقول التي يتم إنشاؤها تلقائيًا:
| Field Name           | Type    | Required | Description / Notes                                 |
|----------------------|---------|----------|-----------------------------------------------------|
| entrepreneurId       | ObjectId| Yes      | رائد الأعمال (مالك الطلب)                          |
| supplierId           | ObjectId| Yes      | المورد                                              |
| relatedBusiness      | ObjectId| Yes      | المشروع المرتبط                                     |
| relatedRequest       | ObjectId| No       | الطلب العام المرتبط (إن وجد)                        |
| sourceType           | text    | Yes      | offer أو direct                                     |
| sourceId             | ObjectId| Yes      | رقم العرض أو directRequest                          |
| products             | array   | No       | المنتجات (Product)                                  |
| services             | array   | No       | الخدمات (Service)                                   |
| totalAmount          | number  | Yes      | المبلغ الإجمالي                                     |
| orderNumber          | text    | Yes      | رقم الطلب (يُولد تلقائيًا)                          |
| status               | text    | No       | processing, cancelled, done (افتراضي processing)    |
| platformFee          | number  | No       | عمولة المنصة (تُحسب تلقائيًا عند التأكيد)            |

### Auth & Permissions
- **Token Required:** Yes (`Authorization: Bearer <token>`)
- **Roles:**
  - إنشاء تلقائي: backend فقط
  - عرض/تعديل: supplier أو entrepreneur حسب العملية

---

## 2. Get Order by ID (GET /api/orders/:orderId)
- **Headers:** `Authorization: Bearer <token>`
- **Roles:** supplier فقط
- **Response:**
```json
{
  "_id": "...",
  "entrepreneurId": "...",
  "supplierId": "...",
  "relatedBusiness": "...",
  "products": [ ... ],
  "services": [ ... ],
  "totalAmount": 1000,
  "status": "processing",
  ...
}
```
- **Errors:**
  - 404 إذا لم يوجد order
  - 401 إذا لم يوجد توكن
  - 403 إذا لم تكن المورد

---

## 3. Update Order Status (PUT /api/orders/:orderId/status)
- **Headers:** `Authorization: Bearer <token>`
- **Roles:** supplier فقط
- **Body:**
  - status: processing | cancelled | done (مطلوب)
- **Response:**
```json
{
  "_id": "...",
  "status": "done",
  ...
}
```
- **Errors:**
  - 404 إذا لم يوجد order
  - 401 إذا لم يوجد توكن
  - 403 إذا لم تكن المورد
  - 400 إذا كانت الحالة غير مسموحة

---

## 4. Withdraw Order (PATCH /api/orders/:orderId/withdraw)
- **Headers:** `Authorization: Bearer <token>`
- **Roles:** فقط من أنشأ الطلب (ريادي)
- **Response:**
```json
{
  "success": true,
  "message": "Order withdrawn successfully",
  "data": { ... }
}
```
- **Errors:**
  - 404 إذا لم يوجد order
  - 401 إذا لم يوجد توكن
  - 403 إذا لم تكن المالك
  - 400 إذا لم يكن الطلب pending

---

## 5. Confirm Order Receipt (PATCH /api/orders/:orderId/confirm-receipt)
- **Headers:** `Authorization: Bearer <token>`
- **Roles:** entrepreneur فقط
- **Response:**
```json
{
  "message": "Order completed, payment released to supplier (after platform fee deduction).",
  "platformFee": 20,
  "netAmount": 980
}
```
- **Errors:**
  - 404 إذا لم يوجد order
  - 401 إذا لم يوجد توكن
  - 403 إذا لم تكن الريادي
  - 400 إذا لم يكن الطلب processing

---

## 6. Get Orders for Supplier (GET /api/orders/supplier)
- **Headers:** `Authorization: Bearer <token>`
- **Roles:** supplier فقط
- **Response:**
```json
[
  { "_id": "...", ... },
  ...
]
```

---

## 7. Filter Orders for Supplier (GET /api/orders/supplier/filter)
- **Headers:** `Authorization: Bearer <token>`
- **Roles:** supplier فقط
- **Query:** status, startDate, endDate, entrepreneurId (اختياري)
- **Response:**
```json
[
  { "_id": "...", ... },
  ...
]
```

---

## 8. ملاحظات عامة
- لا يوجد رفع ملفات في أي عملية تخص Order.
- جميع الحقول مطابقة للكود الفعلي.
- جميع عمليات CRUD موثقة بأمثلة عملية. 