# API Endpoints Documentation


**Base URL:** `https://backendelevante-production.up.railway.app`

---

## Users

| Method | Path | Description | Request Body | Query Params | Example Response | Status Codes |
|--------|------|-------------|--------------|--------------|------------------|--------------|
| POST   | `/api/users/register` | Register a new user | `{ "name": "string", "email": "string", "password": "string" }` | - | `{ "success": true, "user": { ... } }` | 201, 400, 409 |
| POST   | `/api/users/login` | User login | `{ "email": "string", "password": "string" }` | - | `{ "token": "jwt", "user": { ... } }` | 200, 401 |
| POST   | `/api/users/logout` | User logout | - | - | `{ "success": true }` | 200 |
| GET    | `/api/users/profile` | Get current user profile | - | - | `{ "user": { ... } }` | 200, 401 |
| PUT    | `/api/users/profile` | Update current user profile | `{ "name": "string", ... }` | - | `{ "success": true, "user": { ... } }` | 200, 400 |
| DELETE | `/api/users/delete` | Soft delete current user | - | - | `{ "success": true }` | 200, 401 |
| PATCH  | `/api/users/:userId/restore` | Restore user (admin only) | - | - | `{ "success": true }` | 200, 403 |
| GET    | `/api/users/all` | Get all users (admin) | - | `?page=1&limit=20` | `{ "users": [ ... ] }` | 200, 403 |
| PUT    | `/api/users/:userId/block` | Block user (admin) | - | - | `{ "success": true }` | 200, 403 |
| PUT    | `/api/users/:userId/unblock` | Unblock user (admin) | - | - | `{ "success": true }` | 200, 403 |
| PUT    | `/api/users/:userId/status` | Approve/Reject user (admin) | `{ "status": "approved|rejected" }` | - | `{ "success": true }` | 200, 403 |
| GET    | `/api/users/:userId` | Get user by ID (admin) | - | - | `{ "user": { ... } }` | 200, 403, 404 |

---

## Businesses

| Method | Path | Description | Request Body | Query Params | Example Response | Status Codes |
|--------|------|-------------|--------------|--------------|------------------|--------------|
| GET    | `/api/businesses` | List all businesses | - | `?page=1&limit=20` | `{ "businesses": [ ... ] }` | 200 |
| POST   | `/api/businesses` | Create a business | `{ "name": "string", ... }` | - | `{ "success": true, "business": { ... } }` | 201, 400 |
| GET    | `/api/businesses/:id` | Get business by ID | - | - | `{ "business": { ... } }` | 200, 404 |
| PUT    | `/api/businesses/:id` | Update business | `{ ... }` | - | `{ "success": true, "business": { ... } }` | 200, 400 |
| PATCH  | `/api/businesses/:id` | Patch business | `{ ... }` | - | `{ "success": true, "business": { ... } }` | 200, 400 |
| DELETE | `/api/businesses/:id` | Soft delete business | - | - | `{ "success": true }` | 200, 403 |
| PATCH  | `/api/businesses/:id/restore` | Restore business (admin only) | - | - | `{ "success": true }` | 200, 403 |

---

## Milestones

| Method | Path | Description | Request Body | Query Params | Example Response | Status Codes |
|--------|------|-------------|--------------|--------------|------------------|--------------|
| POST   | `/api/milestones` | Create milestone | `{ ... }` | - | `{ "success": true, "milestone": { ... } }` | 201, 400 |
| GET    | `/api/milestones/business/:businessId` | Get milestones for business | - | - | `{ "milestones": [ ... ] }` | 200 |
| GET    | `/api/milestones/:id` | Get milestone by ID | - | - | `{ "milestone": { ... } }` | 200, 404 |
| PUT    | `/api/milestones/:id` | Update milestone | `{ ... }` | - | `{ "success": true, "milestone": { ... } }` | 200, 400 |
| DELETE | `/api/milestones/:id` | Delete milestone | - | - | `{ "success": true }` | 200, 403 |
| PATCH  | `/api/milestones/:id/status` | Update milestone status | `{ "status": "string" }` | - | `{ "success": true }` | 200, 400 |
| PATCH  | `/api/milestones/:id/progress` | Update milestone progress | `{ "progress": "number" }` | - | `{ "success": true }` | 200, 400 |
| POST   | `/api/milestones/:id/notes` | Add note to milestone | `{ "note": "string" }` | - | `{ "success": true, "note": { ... } }` | 201, 400 |

---

## Products

| Method | Path | Description | Request Body | Query Params | Example Response | Status Codes |
|--------|------|-------------|--------------|--------------|------------------|--------------|
| GET    | `/api/products` | List products | - | `?page=1&limit=20` | `{ "products": [ ... ] }` | 200 |
| POST   | `/api/products` | Create product | `{ ... }` | - | `{ "success": true, "product": { ... } }` | 201, 400 |
| GET    | `/api/products/:id` | Get product by ID | - | - | `{ "product": { ... } }` | 200, 404 |
| PUT    | `/api/products/:id` | Update product | `{ ... }` | - | `{ "success": true, "product": { ... } }` | 200, 400 |
| DELETE | `/api/products/:id` | Delete product | - | - | `{ "success": true }` | 200, 403 |

---

## Services

| Method | Path | Description | Request Body | Query Params | Example Response | Status Codes |
|--------|------|-------------|--------------|--------------|------------------|--------------|
| GET    | `/api/services` | List services | - | `?page=1&limit=20` | `{ "services": [ ... ] }` | 200 |
| POST   | `/api/services` | Create service | `{ ... }` | - | `{ "success": true, "service": { ... } }` | 201, 400 |
| GET    | `/api/services/:id` | Get service by ID | - | - | `{ "service": { ... } }` | 200, 404 |
| PUT    | `/api/services/:id` | Update service | `{ ... }` | - | `{ "success": true, "service": { ... } }` | 200, 400 |
| DELETE | `/api/services/:id` | Delete service | - | - | `{ "success": true }` | 200, 403 |

---

## Orders

| Method | Path | Description | Request Body | Query Params | Example Response | Status Codes |
|--------|------|-------------|--------------|--------------|------------------|--------------|
| GET    | `/api/orders` | List orders | - | `?page=1&limit=20` | `{ "orders": [ ... ] }` | 200 |
| POST   | `/api/orders` | Create order | `{ ... }` | - | `{ "success": true, "order": { ... } }` | 201, 400 |
| GET    | `/api/orders/:id` | Get order by ID | - | - | `{ "order": { ... } }` | 200, 404 |
| PUT    | `/api/orders/:id` | Update order | `{ ... }` | - | `{ "success": true, "order": { ... } }` | 200, 400 |
| DELETE | `/api/orders/:id` | Delete order | - | - | `{ "success": true }` | 200, 403 |

---

## Supplier Offers

| Method | Path | Description | Request Body | Query Params | Example Response | Status Codes |
|--------|------|-------------|--------------|--------------|------------------|--------------|
| GET    | `/api/supplier-offers` | List offers | - | `?page=1&limit=20` | `{ "offers": [ ... ] }` | 200 |
| POST   | `/api/supplier-offers` | Create offer | `{ ... }` | - | `{ "success": true, "offer": { ... } }` | 201, 400 |
| GET    | `/api/supplier-offers/:id` | Get offer by ID | - | - | `{ "offer": { ... } }` | 200, 404 |
| PUT    | `/api/supplier-offers/:id` | Update offer | `{ ... }` | - | `{ "success": true, "offer": { ... } }` | 200, 400 |
| DELETE | `/api/supplier-offers/:id` | Delete offer | - | - | `{ "success": true }` | 200, 403 |

---

## Investors

| Method | Path | Description | Request Body | Query Params | Example Response | Status Codes |
|--------|------|-------------|--------------|--------------|------------------|--------------|
| GET    | `/api/investors` | List investors | - | `?page=1&limit=20` | `{ "investors": [ ... ] }` | 200 |
| POST   | `/api/investors` | Create investor | `{ ... }` | - | `{ "success": true, "investor": { ... } }` | 201, 400 |
| GET    | `/api/investors/:id` | Get investor by ID | - | - | `{ "investor": { ... } }` | 200, 404 |
| PUT    | `/api/investors/:id` | Update investor | `{ ... }` | - | `{ "success": true, "investor": { ... } }` | 200, 400 |
| DELETE | `/api/investors/:id` | Delete investor | - | - | `{ "success": true }` | 200, 403 |

---

## Deals

| Method | Path | Description | Request Body | Query Params | Example Response | Status Codes |
|--------|------|-------------|--------------|--------------|------------------|--------------|
| GET    | `/api/deals` | List deals | - | `?page=1&limit=20` | `{ "deals": [ ... ] }` | 200 |
| POST   | `/api/deals` | Create deal | `{ ... }` | - | `{ "success": true, "deal": { ... } }` | 201, 400 |
| GET    | `/api/deals/my` | Get my deals | - | - | `{ "deals": [ ... ] }` | 200 |
| GET    | `/api/deals/:id` | Get deal by ID | - | - | `{ "deal": { ... } }` | 200, 404 |
| PATCH  | `/api/deals/:id/status` | Update deal status | `{ "status": "string" }` | - | `{ "success": true }` | 200, 400 |
| DELETE | `/api/deals/:id` | Soft delete deal | - | - | `{ "success": true }` | 200, 403 |
| PATCH  | `/api/deals/:id/restore` | Restore deal (admin only) | - | - | `{ "success": true }` | 200, 403 |

---

## Requests

| Method | Path | Description | Request Body | Query Params | Example Response | Status Codes |
|--------|------|-------------|--------------|--------------|------------------|--------------|
| GET    | `/api/requests` | List requests | - | `?page=1&limit=20` | `{ "requests": [ ... ] }` | 200 |
| POST   | `/api/requests` | Create request | `{ ... }` | - | `{ "success": true, "request": { ... } }` | 201, 400 |
| GET    | `/api/requests/:id` | Get request by ID | - | - | `{ "request": { ... } }` | 200, 404 |
| PUT    | `/api/requests/:id` | Update request | `{ ... }` | - | `{ "success": true, "request": { ... } }` | 200, 400 |
| DELETE | `/api/requests/:id` | Delete request | - | - | `{ "success": true }` | 200, 403 |

---

## Messages

| Method | Path | Description | Request Body | Query Params | Example Response | Status Codes |
|--------|------|-------------|--------------|--------------|------------------|--------------|
| GET    | `/api/messages/threads` | Get user threads | - | `?page=1&limit=20` | `{ "threads": [ ... ] }` | 200 |
| GET    | `/api/messages/thread/:threadId` | Get messages in thread (paginated) | - | `?page=1&limit=20` | `{ "messages": [ ... ] }` | 200 |
| POST   | `/api/messages/send` | Send message | `{ "threadId": "string", "content": "string" }` | - | `{ "success": true, "message": { ... } }` | 201, 400 |
| PATCH  | `/api/messages/thread/:threadId/read` | Mark messages as read | - | - | `{ "success": true }` | 200 |

---

## Notifications

| Method | Path | Description | Request Body | Query Params | Example Response | Status Codes |
|--------|------|-------------|--------------|--------------|------------------|--------------|
| GET    | `/api/notifications` | Get user notifications (with filter/pagination) | - | `?page=1&limit=20` | `{ "notifications": [ ... ] }` | 200 |
| PATCH  | `/api/notifications/:id/read` | Mark notification as read | - | - | `{ "success": true }` | 200 |
| PATCH  | `/api/notifications/markAllRead` | Mark all notifications as read | - | - | `{ "success": true }` | 200 |
| POST   | `/api/notifications/admin/send` | Admin send manual notification | `{ "title": "string", "body": "string", ... }` | - | `{ "success": true }` | 201, 403 |

---

## Reviews

| Method | Path | Description | Request Body | Query Params | Example Response | Status Codes |
|--------|------|-------------|--------------|--------------|------------------|--------------|
| POST   | `/api/reviews/platform` | Submit platform review | `{ "rating": 1-5, "comment": "string" }` | - | `{ "success": true, "review": { ... } }` | 201, 400 |
| GET    | `/api/reviews/platform` | Get all platform reviews | - | - | `{ "reviews": [ ... ] }` | 200 |
| DELETE | `/api/reviews/platform/:id` | Soft delete platform review | - | - | `{ "success": true }` | 200, 403 |
| PATCH  | `/api/reviews/platform/:id/restore` | Restore platform review (admin only) | - | - | `{ "success": true }` | 200, 403 |
| POST   | `/api/reviews/user` | Submit user-to-user review | `{ "userId": "string", "rating": 1-5, "comment": "string" }` | - | `{ "success": true, "review": { ... } }` | 201, 400 |
| GET    | `/api/reviews/user/:userId` | Get reviews for a user | - | - | `{ "reviews": [ ... ] }` | 200 |
| DELETE | `/api/reviews/user/:id` | Soft delete user review | - | - | `{ "success": true }` | 200, 403 |
| PATCH  | `/api/reviews/user/:id/restore` | Restore user review (admin only) | - | - | `{ "success": true }` | 200, 403 |

---

## Reports

| Method | Path | Description | Request Body | Query Params | Example Response | Status Codes |
|--------|------|-------------|--------------|--------------|------------------|--------------|
| POST   | `/api/reports` | Submit report/feedback | `{ "type": "string", "content": "string" }` | - | `{ "success": true, "report": { ... } }` | 201, 400 |
| GET    | `/api/reports` | Get all reports (admin) | - | - | `{ "reports": [ ... ] }` | 200, 403 |
| PATCH  | `/api/reports/:id` | Update report status (admin) | `{ "status": "string" }` | - | `{ "success": true }` | 200, 403 |

---

## Activity Logs

| Method | Path | Description | Request Body | Query Params | Example Response | Status Codes |
|--------|------|-------------|--------------|--------------|------------------|--------------|
| POST   | `/api/activity-logs` | Create activity log (auto, rarely needed) | `{ ... }` | - | `{ "success": true, "log": { ... } }` | 201, 400 |
| GET    | `/api/activity-logs` | Query activity logs (admin only, filter by user, target, date) | - | `?userId=&targetId=&date=` | `{ "logs": [ ... ] }` | 200, 403 |

---

> **Note:**
> All endpoints require authentication (JWT) unless otherwise noted. Some endpoints are admin-only (see description). 