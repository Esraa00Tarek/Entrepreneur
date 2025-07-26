# Message API – Practical Integration Guide (Accurate)

## 1. Create Message (POST /api/messages)

### Request Format
- **Type:** `multipart/form-data`
- **Why:** File uploads (attachments) require FormData.
- **Middleware:** `uploadMultipleImagesToCloudinary('attachments', 'messages')`
- **Auth:** Bearer token required (protect)

### Fields Table
| Field Name         | Type    | Required | Description / Notes                                 | Allowed Values / Format         | Example Value           |
|--------------------|---------|----------|-----------------------------------------------------|-------------------------------|-------------------------|
| content            | text    | Yes      | Message content                                     | Any string                    | "Hello, how are you?"  |
| receiverId         | ObjectId| Yes*     | Receiver user ID (required if threadId not sent)    | 24-char hex                    | "60f7..."              |
| threadId           | ObjectId| Yes*     | Existing thread ID (required if receiverId not sent)| 24-char hex                    | "60f7..."              |
| attachments        | file[]  | No       | Attachments (images, files, max 5MB each)           | .jpg, .png, .pdf, ...          | (multiple files)        |
| relatedDealId      | ObjectId| No       | Related deal ID (for deal-progress threads)         | 24-char hex                    | "60f7..."              |
| relatedOrderId     | ObjectId| No       | Related order ID (for order threads)                | 24-char hex                    | "60f7..."              |
| relatedOfferId     | ObjectId| No       | Related offer ID (for offer-negotiation threads)    | 24-char hex                    | "60f7..."              |
| relatedRequestId   | ObjectId| No       | Related request ID (for pre-deal threads)           | 24-char hex                    | "60f7..."              |
| type               | string  | No       | Thread type                                         | general, pre-deal, deal-progress, ost-order, offer-negotiation, support | "deal-progress"         |

### Notes
- **attachments**: اسم الحقل للملفات هو `attachments` فقط كما في الكود الفعلي.
- **receiverId** أو **threadId** أحدهما مطلوب.
- **الميدلوير**: يتم رفع الملفات عبر upload.js وليس multer مباشرة.
- **التحقق من المرفقات**: يتم فحص كل ملف للتأكد من عدم وجود بيانات تواصل.

### Example (FormData)
| Key           | Value                |
|---------------|----------------------|
| content       | "مرحبا، كيف حالك؟"  |
| receiverId    | 60f7...              |
| attachments   | (file1.jpg)          |
| type          | deal-progress        |

### Response (Success)
```json
{
  "success": true,
  "message": "Message sent",
  "data": {
    "message": { ... },
    "threadId": "..."
  }
}
```

### Response (Error)
```json
{
  "success": false,
  "message": "Your attachment contains contact information or forbidden content"
}
```

---

## 2. Get User Threads (GET /api/messages/threads)
- **Auth:** Bearer token required
- **Query params:** type, relatedDealId, relatedOrderId, relatedOfferId, relatedRequestId, page, limit
- **Response:**
```json
{
  "success": true,
  "data": {
    "threads": [ ... ],
    "pagination": { ... }
  }
}
```

---

## 3. Get Thread Messages (GET /api/messages/thread/:threadId)
- **Auth:** Bearer token required
- **Query params:** messageType, senderId, status, search, page, limit
- **Response:**
```json
{
  "success": true,
  "data": {
    "messages": [ ... ],
    "pagination": { ... }
  }
}
```

---

## 4. Mark Thread Messages as Read (PATCH /api/messages/thread/:threadId/read)
- **Auth:** Bearer token required
- **Response:**
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

---

## 5. Real-time Events (Socket.IO)
- **Events:**
  - `receiveMessage`, `typingStopped`, `threadUpdated`, `newThreadCreated`, `messagesRead`, ...
- **Payloads:**
  - حسب الكود الفعلي (انظر controller)

---

## 6. Admin Endpoints
- **GET /api/messages/admin/threads**: Get all threads (admin only)
- **GET /api/messages/admin/messages**: Get all messages (admin only)
- **DELETE /api/messages/admin/message/:messageId**: Soft delete message
- **DELETE /api/messages/admin/thread/:threadId**: Soft delete thread

---

## 7. Validation & Error Handling
- جميع الحقول ObjectId يتم التحقق من صحتها.
- جميع الملفات يتم فحصها لمنع بيانات التواصل.
- جميع الردود موحدة (success, message, data, error).

---

## 8. أمثلة متقدمة (سيناريوهات)
- إرسال رسالة نصية فقط
- إرسال رسالة مع مرفقات
- إرسال رسالة في محادثة دعم (type=support)
- جلب رسائل محادثة مرتبطة بصفقة/طلب/عرض
- حذف رسالة (admin)

---

## 9. ملاحظات
- جميع العمليات تتطلب توكن صالح.
- جميع الحقول المرجعية يجب أن تكون ObjectId صحيحة.
- جميع الملفات ترفع عبر Cloudinary تلقائيًا.
- جميع الردود موحدة وسهلة المعالجة للفرونت. 