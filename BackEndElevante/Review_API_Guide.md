# Review API – Practical Integration Guide (Accurate)

## 1. Submit Platform Review (POST /api/reviews/platform)

### Request Format
- **Type:** `application/json`
- **Auth:** Bearer token required (protect)

### Fields Table
| Field Name | Type      | Required | Description / Notes                                 | Allowed Values / Format         | Example Value           |
|------------|-----------|----------|-----------------------------------------------------|-------------------------------|-------------------------|
| rating     | number    | Yes      | Platform rating                                     | 1-5                            | 5                       |
| content    | string    | Yes      | Review content                                      | Any string                     | "Great platform!"       |
| title      | string    | No       | Review title                                        | Any string                     | "My Experience"         |

### Example (JSON)
```json
{
  "rating": 5,
  "content": "Great platform!",
  "title": "My Experience"
}
```

---

## 2. Submit User Review (POST /api/reviews/user)

### Request Format
- **Type:** `application/json`
- **Auth:** Bearer token required (protect)

### Fields Table
| Field Name | Type      | Required | Description / Notes                                 | Allowed Values / Format         | Example Value           |
|------------|-----------|----------|-----------------------------------------------------|-------------------------------|-------------------------|
| toUser     | ObjectId  | Yes      | User being reviewed                                 | 24-char hex                    | "60f7..."              |
| rating     | number    | Yes      | User rating                                         | 1-5                            | 4                       |
| comment    | string    | Yes      | Review comment                                      | Any string                     | "Very professional."    |
| dealId     | ObjectId  | No*      | Related deal ID (required if no orderId)            | 24-char hex                    | "60f7..."              |
| orderId    | ObjectId  | No*      | Related order ID (required if no dealId)            | 24-char hex                    | "60f7..."              |

### Example (JSON)
```json
{
  "toUser": "60f7...",
  "rating": 4,
  "comment": "Very professional.",
  "dealId": "60f7..."
}
```

---

## 3. Get Platform Reviews (GET /api/reviews/platform)
- **Auth:** Optional (public)
- **Response:** Array of platform reviews

---

## 4. Get User Reviews (GET /api/reviews/user/:userId)
- **Auth:** Optional (public)
- **Response:** Array of user reviews

---

## 5. Delete/Restore Platform Review (DELETE/PATCH /api/reviews/platform/:id)
- **Auth:** Bearer token required (owner or admin)
- **Response:**
```json
{
  "message": "Review deleted successfully"
}
```

---

## 6. Delete/Restore User Review (DELETE/PATCH /api/reviews/user/:id)
- **Auth:** Bearer token required (owner or admin)
- **Response:**
```json
{
  "message": "Review deleted successfully"
}
```

---

## 7. Update Platform Review Status (PATCH /api/reviews/platform/:id/status)
- **Auth:** Bearer token required (admin only)
- **Body:**
  - status (string): Pending, Accepted, Rejected, Resolved
- **Example:**
```json
{
  "status": "Accepted"
}
```

---

## 8. Admin: Get All Platform/User Reviews with Filters
- **GET /api/reviews/admin/platform-reviews**
- **GET /api/reviews/admin/user-reviews**
- **Query params:** status, userId, fromUser, toUser, isDeleted, fromDate, toDate, rating

---

## 9. Validation & Error Handling
- All ObjectId fields are validated.
- All referenced entities (user, deal, order) are checked for existence.
- All responses are unified (success, message, data, error).

---

## 10. Advanced Scenarios
- Submit platform/user review with all required fields
- Submit review with missing/invalid fields
- Delete/restore review (owner/admin)
- Update status (admin)
- Get reviews for user/platform with/without results
- Get review by invalid ID

---

## 11. Notes
- All operations require a valid token (except GET for public reviews).
- All referenced fields must be valid ObjectId.
- All responses are unified and easy to handle for frontend. 