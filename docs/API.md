# API Documentation

## Base URL
```
http://localhost:3001/api/v1
```

## Authentication

Most endpoints require authentication using a JWT token obtained after wallet connection.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

---

## Users

### Register User
```http
POST /users/register
```

**Body:**
```json
{
  "wallet_address": "0x...",
  "username": "string",
  "email": "string (optional)",
  "signature": "string"
}
```

### Login
```http
POST /users/login
```

**Body:**
```json
{
  "wallet_address": "0x...",
  "signature": "string"
}
```

### Get User Profile
```http
GET /users/profile
```
Requires authentication.

### Get Public Profile
```http
GET /users/:userId
```

---

## Effort Records

### Create Effort Record
```http
POST /efforts
```
Requires authentication.

**Body:**
```json
{
  "title": "string",
  "description": "string",
  "category": "volunteering|caregiving|work|education|...",
  "effort_type": "contribution|need_verification",
  "estimated_hours": 10,
  "location": {
    "latitude": 0,
    "longitude": 0,
    "address": "string"
  },
  "proof_files": ["ipfs_hash1", "ipfs_hash2"]
}
```

### Get All Efforts
```http
GET /efforts?category=volunteering&status=verified&page=1&limit=20
```

### Get Specific Effort
```http
GET /efforts/:effortId
```

### Upload Proof Files
```http
POST /efforts/:effortId/proof
Content-Type: multipart/form-data
```

---

## Verifications

### Submit Verification
```http
POST /verifications
```
Requires authentication.

**Body:**
```json
{
  "effort_id": "uuid",
  "verification_type": "peer_review|authority_endorsement|...",
  "status": "approved|rejected|needs_more_info",
  "confidence_score": 95,
  "comments": "string",
  "is_fraudulent": false
}
```

### Get Pending Verifications
```http
GET /verifications/pending
```
Requires authentication.

### Report Fraud
```http
POST /verifications/report-fraud
```
Requires authentication.

---

## Trust Scores

### Get User Trust Score
```http
GET /trust-scores/:userId
```

### Get Trust Score Breakdown
```http
GET /trust-scores/:userId/breakdown
```

### Get Trust Score History
```http
GET /trust-scores/:userId/history
```

### Get Leaderboard
```http
GET /trust-scores/leaderboard/global?limit=100
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

- 100 requests per 15 minutes per IP
- Authenticated users: 200 requests per 15 minutes

---

## WebSocket Events (Future)

For real-time updates:
- `effort:verified`
- `verification:received`
- `trust_score:updated`
