# Dispute API – Practical Integration Guide (Accurate)

## 1. Create Dispute (POST /api/disputes)

### Request Format
- **Type:** `application/json`
- **Auth:** Bearer token required (protect)

### Fields Table
| Field Name | Type      | Required | Description / Notes                                 | Allowed Values / Format         | Example Value           |
|------------|-----------|----------|-----------------------------------------------------|-------------------------------|-------------------------|
| type       | string    | Yes      | Dispute type                                        | milestone, withdrawal          | "milestone"            |
| targetId   | ObjectId  | Yes      | Target entity ID (milestoneId or withdrawalId)      | 24-char hex                    | "60f7..."              |
| reason     | string    | Yes      | Reason for dispute                                  | Any string                     | "Payment not released"  |

### Example (JSON)
```json
{
  "type": "milestone",
  "targetId": "60f7...",
  "reason": "Milestone not completed as agreed."
}
```

### Response (Success)
```json
{
  "success": true,
  "message": "Dispute opened and target frozen.",
  "data": { ...disputeObject }
}
```

### Response (Error)
```json
{
  "success": false,
  "message": "Milestone not found."
}
```

---

## 2. Resolve Dispute (PATCH /api/disputes/:id/resolve)
- **Auth:** Bearer token required (admin only)
- **Body:**
  - resolution (string): Resolution text
  - releaseTo (string): entrepreneur, refund
- **Example:**
```json
{
  "resolution": "Funds released to entrepreneur.",
  "releaseTo": "entrepreneur"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Dispute resolved.",
  "data": { ...disputeObject }
}
```

---

## 3. Add Message to Dispute (POST /api/disputes/:id/messages)
- **Auth:** Bearer token required
- **Body:**
  - message (string): Message content
- **Example:**
```json
{
  "message": "I have attached proof of payment."
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Message added to dispute.",
  "data": { ...disputeObject }
}
```

---

## 4. Get My Disputes (GET /api/disputes/my)
- **Auth:** Bearer token required
- **Response:**
```json
{
  "success": true,
  "data": [ ...disputeObjects ]
}
```

---

## 5. Get Dispute by ID (GET /api/disputes/:id)
- **Auth:** Bearer token required
- **Response:**
```json
{
  "success": true,
  "data": { ...disputeObject }
}
```

---

## 6. Validation & Error Handling
- All ObjectId fields are validated.
- All referenced entities (milestone, withdrawal) are checked for existence.
- All responses are unified (success, message, data, error).

---

## 7. Advanced Scenarios
- Create dispute with all required fields (milestone/withdrawal)
- Create dispute with missing/invalid fields
- Resolve dispute as admin (all possible releaseTo values)
- Add message to dispute (valid/invalid)
- Get disputes for user with/without results
- Get dispute by invalid ID

---

## 8. Notes
- All operations require a valid token.
- All referenced fields must be valid ObjectId.
- All responses are unified and easy to handle for frontend. 