# Withdrawal API – Practical Integration Guide (Accurate)

## 1. Create Withdrawal Request (POST /api/withdrawals)

### Request Format
- **Type:** `application/json`
- **Auth:** Bearer token required (protect)

### Fields Table
| Field Name   | Type      | Required | Description / Notes                                 | Allowed Values / Format         | Example Value           |
|--------------|-----------|----------|-----------------------------------------------------|-------------------------------|-------------------------|
| dealId       | ObjectId  | Yes      | Deal ID to withdraw from                           | 24-char hex                    | "60f7..."              |
| amount       | number    | Yes      | Amount to withdraw                                 | >0, <= virtualBalance          | 1000                    |
| reason       | string    | Yes      | Reason for withdrawal                              | Any string                     | "Project expenses"      |

### Example (JSON)
```json
{
  "dealId": "60f7...",
  "amount": 1000,
  "reason": "Project expenses"
}
```

### Response (Success)
```json
{
  "success": true,
  "message": "Withdrawal request submitted for admin approval.",
  "data": { ...withdrawalObject }
}
```

### Response (Error)
```json
{
  "success": false,
  "message": "Insufficient balance."
}
```

---

## 2. Approve Withdrawal Request (PATCH /api/withdrawals/:id/approve)
- **Auth:** Bearer token required (admin only)
- **Response:**
```json
{
  "success": true,
  "message": "Withdrawal approved and balance deducted.",
  "data": { ...withdrawalObject }
}
```

---

## 3. Upload Withdrawal Proof (POST /api/withdrawals/:id/proof)
- **Auth:** Bearer token required (entrepreneur only)
- **Body:**
  - url (string): Proof file URL
- **Example:**
```json
{
  "url": "https://cloudinary.com/proof1.jpg"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Proof uploaded and withdrawal marked as completed.",
  "data": { ...withdrawalObject }
}
```

---

## 4. Get My Withdrawals (GET /api/withdrawals/my)
- **Auth:** Bearer token required
- **Response:**
```json
{
  "success": true,
  "data": [ ...withdrawalObjects ]
}
```

---

## 5. Validation & Error Handling
- All ObjectId fields are validated.
- All referenced entities (deal, user) are checked for existence.
- All responses are unified (success, message, data, error).

---

## 6. Advanced Scenarios
- Create withdrawal with all required fields
- Create withdrawal with missing/invalid fields
- Approve withdrawal as admin (valid/invalid)
- Upload proof (valid/invalid)
- Get withdrawals for user with/without results
- Get withdrawal by invalid ID

---

## 7. Notes
- All operations require a valid token.
- All referenced fields must be valid ObjectId.
- All responses are unified and easy to handle for frontend. 