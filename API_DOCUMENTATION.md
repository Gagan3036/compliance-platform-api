# QA API Documentation

## Base URL

```
http://localhost:3000
```

## 🔐 Authentication Overview

This API uses **JWT (JSON Web Tokens)** for authentication. Think of JWT like a digital ID card that proves who you are.

### How JWT Authentication Works:

1. **Register/Login** → Get a token (your digital ID)
2. **Include token** in requests → Prove your identity
3. **Token expires** → Get a new one when needed

---

## 🚀 Getting Started with Authentication

### Step 1: Register a New User

**Endpoint:** `POST /api/auth/register`

```json
{
  "email": "Test@example.com",
  "password": "password123",
  "userType": "user",
  "name": "Test",
  "phone": "+1234567890"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "64a1b2c3d4e5f6789abcdef0",
    "email": "test@example.com",
    "userType": "user",
    "profile": {
      "name": "Test Name",
      "isActive": true
    }
  }
}
```

### Step 2: Login to Get Your Token

**Endpoint:** `POST /api/auth/login`

```json
{
  "email": "Test@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a1b2c3d4e5f6789abcdef0",
    "email": "Test@example.com",
    "userType": "user"
  }
}
```

**💡 Important:** Save the `accessToken` - you'll need it for protected endpoints!

### Step 3: Use Your Token in Requests

For any protected endpoint, include your token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example using cURL:**

```bash
curl -X GET "http://localhost:3000/api/auth/profile" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Example using JavaScript/Fetch:**

```javascript
fetch('http://localhost:3000/api/auth/profile', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
    'Content-Type': 'application/json'
  }
})
```

---

## 👥 User Types & Permissions

| User Type         | Can Create Questions | Can View All Users | Can Manage Company | Can Access Analytics |
| ----------------- | -------------------- | ------------------ | ------------------ | -------------------- |
| **user**    | ❌                   | ❌                 | ❌                 | ❌                   |
| **company** | ✅                   | ❌                 | ✅                 | ✅                   |
| **admin**   | ✅                   | ✅                 | ✅                 | ✅                   |

---

## 🔒 Authentication Endpoints

### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "userType": "user|company|admin",
  "name": "Full Name",
  "phone": "+1234567890",
  "companyName": "Company Inc",  
  "department": "IT"           
}
```

**Status Codes:**

- `201 Created` - User registered successfully
- `400 Bad Request` - Invalid data or email already exists
- `500 Internal Server Error` - Server error

---

### 2. Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a1b2c3d4e5f6789abcdef0",
    "email": "user@example.com",
    "userType": "user",
    "permissions": {
      "canCreateQuestions": false,
      "canViewAllUsers": false,
      "canManageCompany": false,
      "canAccessAnalytics": false
    }
  }
}
```

**Status Codes:**

- `200 OK` - Login successful
- `401 Unauthorized` - Invalid credentials
- `403 Forbidden` - Account deactivated
- `500 Internal Server Error` - Server error

---

### 3. Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Request Body:**

```json
{
  "refreshToken": "your_refresh_token_here"
}
```

**Response:**

```json
{
  "accessToken": "new_access_token_here"
}
```

**💡 Use this when your access token expires (every 15 minutes)**

---

### 4. Get Profile

**Endpoint:** `GET /api/auth/profile`

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**

```json
{
  "id": "64a1b2c3d4e5f6789abcdef0",
  "email": "user@example.com",
  "userType": "user",
  "profile": {
    "name": "John Doe",
    "phone": "+1234567890",
    "isActive": true
  },
  "permissions": {
    "canCreateQuestions": false,
    "canViewAllUsers": false,
    "canManageCompany": false,
    "canAccessAnalytics": false
  },
  "lastLogin": "2025-07-03T10:30:00.000Z"
}
```

---

### 5. Update Profile

**Endpoint:** `PUT /api/auth/profile`

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**

```json
{
  "name": "New Name",
  "phone": "+9876543210",
  "department": "New Department"
}
```

---

### 6. Logout

**Endpoint:** `POST /api/auth/logout`

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**

```json
{
  "message": "Logged out successfully"
}
```

---

### 7. Get All Users (Admin Only)

**Endpoint:** `GET /api/auth/users`

**Headers:** `Authorization: Bearer {accessToken}`

**Required:** Admin user type

**Response:**

```json
[
  {
    "id": "64a1b2c3d4e5f6789abcdef0",
    "email": "user@example.com",
    "userType": "user",
    "profile": {
      "name": "John Doe",
      "isActive": true
    },
    "createdAt": "2025-07-03T10:00:00.000Z"
  }
]
```

---

## 🔒 Protected Admin Endpoints (Question Management)

**All admin endpoints require authentication and appropriate permissions.**

### 1. Add Question

**Endpoint:** `POST /api/admin/add-question`

**Headers:** `Authorization: Bearer {accessToken}`

**Required Permission:** `canCreateQuestions`

**Request Body:**

```json
{
  "question": "What does GDPR stand for?",
  "options": [
    "General Data Protection Regulation",
    "Global Data Privacy Rules",
    "General Database Protection Requirements",
    "Global Data Protection Registry"
  ],
  "correctAnswer": 0,
  "complianceName": "GDPR",
  "questionWeight": 2
}
```

**Field Descriptions:**

- `question` - The question text (required)
- `options` - Array of answer options (required)
- `correctAnswer` - Index of correct answer (0-based, required)
- `complianceName` - Category/compliance type (required)
- `questionWeight` - Weight of the question (optional, default: 1)

**Response:**

```json
{
  "message": "Question added successfully"
}
```

**Status Codes:**

- `201 Created` - Question added successfully
- `500 Internal Server Error` - Server error

---

### 2. Get All Questions

**Endpoint:** `GET /api/questions`

**No authentication required for basic access**

**Query Parameters:**

- `complianceName` (optional) - Filter by compliance type

**Examples:**

- `GET /api/questions` - Get all questions
- `GET /api/questions?complianceName=GDPR` - Get GDPR questions only

**Response:**

```json
[
  {
    "_id": "6864af340d94bd297654bce2",
    "question": "What does GDPR stand for?",
    "options": [
      "General Data Protection Regulation",
      "Global Data Privacy Rules",
      "General Database Protection Requirements", 
      "Global Data Protection Registry"
    ],
    "correctAnswer": 0,
    "complianceName": "GDPR",
    "questionWeight": 2,
    "responses": 0,
    "createdAt": "2025-07-02T10:30:00.000Z",
    "updatedAt": "2025-07-02T10:30:00.000Z",
    "__v": 0
  }
]
```

**Status Codes:**

- `200 OK` - Questions retrieved successfully
- `500 Internal Server Error` - Server error

---

### 3. Get Single Question

**Endpoint:** `GET /api/admin/question/:id`

**Headers:** `Authorization: Bearer {accessToken}`

**Required Permission:** `canCreateQuestions`

**URL Parameters:**

- `id` - Question ID (MongoDB ObjectId)

**Example:** `GET /api/admin/question/6864af340d94bd297654bce2`

**Response:**

```json
{
  "_id": "6864af340d94bd297654bce2",
  "question": "What does GDPR stand for?",
  "options": [
    "General Data Protection Regulation",
    "Global Data Privacy Rules",
    "General Database Protection Requirements",
    "Global Data Protection Registry"
  ],
  "correctAnswer": 0,
  "complianceName": "GDPR",
  "responses": 0,
  "__v": 0
}
```

**Status Codes:**

- `200 OK` - Question found
- `404 Not Found` - Question not found
- `500 Internal Server Error` - Server error

---

### 4. Update Question

**Endpoint:** `PUT /api/admin/update-question/:id`

**Headers:** `Authorization: Bearer {accessToken}`

**Required Permission:** `canCreateQuestions`

**URL Parameters:**

- `id` - Question ID (MongoDB ObjectId)

**Request Body:**

```json
{
  "question": "Updated: What does GDPR stand for?",
  "options": [
    "General Data Protection Regulation",
    "Global Data Privacy Rules",
    "General Database Protection Requirements",
    "Global Data Protection Registry"
  ],
  "correctAnswer": 0,
  "complianceName": "GDPR"
}
```

**Response:**

```json
{
  "message": "Question updated successfully",
  "question": {
    "_id": "6864af340d94bd297654bce2",
    "question": "Updated: What does GDPR stand for?",
    "options": [
      "General Data Protection Regulation",
      "Global Data Privacy Rules",
      "General Database Protection Requirements",
      "Global Data Protection Registry"
    ],
    "correctAnswer": 0,
    "complianceName": "GDPR",
    "responses": 0,
    "__v": 0
  }
}
```

**Status Codes:**

- `200 OK` - Question updated successfully
- `404 Not Found` - Question not found
- `500 Internal Server Error` - Server error

---

### 5. Delete Question

**Endpoint:** `DELETE /api/admin/delete-question/:id`

**Headers:** `Authorization: Bearer {accessToken}`

**Required Permission:** `canCreateQuestions`

**URL Parameters:**

- `id` - Question ID (MongoDB ObjectId)

**Example:** `DELETE /api/admin/delete-question/6864af340d94bd297654bce2`

**Response:**

```json
{
  "message": "Question deleted successfully",
  "question": {
    "_id": "6864af340d94bd297654bce2",
    "question": "What does GDPR stand for?",
    "options": [
      "General Data Protection Regulation",
      "Global Data Privacy Rules",
      "General Database Protection Requirements",
      "Global Data Protection Registry"
    ],
    "correctAnswer": 0,
    "complianceName": "GDPR",
    "responses": 0,
    "__v": 0
  }
}
```

**Status Codes:**

- `200 OK` - Question deleted successfully
- `404 Not Found` - Question not found
- `500 Internal Server Error` - Server error

---

## 🎯 User Quiz Endpoints

### 1. Submit Answer

**Endpoint:** `POST /api/user/submit`

**No authentication required currently**

**Request Body:**

```json
{
  "userId": "u1",
  "name": "Gagan",
  "questionId": "6864af340d94bd297654bce2",
  "selectedOption": 0
}
```

**Response:**

```json
{
  "isCorrect": true,
  "scoreEarned": 3,
  "categoryScore": {
    "complianceName": "GDPR",
    "totalScored": 5,
    "totalWeighted": 8,
    "percentageScore": 62.5
  },
  "overallPercentage": 58.3
}
```

**Response Field Descriptions:**

- `isCorrect` - Whether the answer was correct
- `scoreEarned` - Weighted score earned for this question
- `categoryScore` - Performance in this specific category
- `overallPercentage` - Overall performance across all categories

**Status Codes:**

- `200 OK` - Answer submitted successfully
- `404 Not Found` - Question not found
- `500 Internal Server Error` - Server error

---

### 2. Get User History

**Endpoint:** `GET /api/user/history/:userId`

**No authentication required currently**

**URL Parameters:**

- `userId` - Custom user identifier

**Example:** `GET /api/user/history/u1`

**Response:**

```json
{
  "_id": "6864af340d94bd297654bce3",
  "userId": "u1",
  "name": "John Doe",
  "categoryScores": [
    {
      "complianceName": "GDPR",
      "totalScored": 5,
      "totalWeighted": 8,
      "percentageScore": 62.5,
      "questionsAnswered": 3,
      "lastActivity": "2025-07-02T14:30:00.000Z"
    }
  ],
  "questionHistory": [
    {
      "questionId": "6864af340d94bd297654bce2",
      "complianceName": "GDPR",
      "selectedOption": 0,
      "isCorrect": true,
      "questionWeight": 3,
      "scoreEarned": 3,
      "answeredAt": "2025-07-02T14:30:00.000Z"
    }
  ],
  "totalScore": 5,
  "totalPossibleScore": 8,
  "overallPercentage": 62.5,
  "lastActivity": "2025-07-02T14:30:00.000Z",
  "__v": 1
}
```

**Status Codes:**

- `200 OK` - User history retrieved successfully
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

### 3. Get User Analytics

**Endpoint:** `GET /api/user/analytics/:userId`

**No authentication required currently**

**URL Parameters:**

- `userId` - Custom user identifier

**Example:** `GET /api/user/analytics/u1`

**Response:**

```json
{
  "userId": "u1",
  "name": "John Doe",
  "categoryScores": [
    {
      "complianceName": "GDPR",
      "totalScored": 5,
      "totalWeighted": 8,
      "percentageScore": 62.5,
      "questionsAnswered": 3,
      "lastActivity": "2025-07-02T14:30:00.000Z"
    },
    {
      "complianceName": "SOX",
      "totalScored": 2,
      "totalWeighted": 5,
      "percentageScore": 40.0,
      "questionsAnswered": 2,
      "lastActivity": "2025-07-02T13:15:00.000Z"
    }
  ],
  "overallPercentage": 53.8,
  "totalScore": 7,
  "totalPossibleScore": 13,
  "lastActivity": "2025-07-02T14:30:00.000Z",
  "recentActivity": [
    {
      "questionId": {
        "_id": "6864af340d94bd297654bce2",
        "question": "What does GDPR stand for?",
        "complianceName": "GDPR"
      },
      "selectedOption": 0,
      "isCorrect": true,
      "questionWeight": 3,
      "scoreEarned": 3,
      "answeredAt": "2025-07-02T14:30:00.000Z"
    }
  ]
}
```

**Status Codes:**

- `200 OK` - User analytics retrieved successfully
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

### 4. Show All Users

**Endpoint:** `GET /api/user/showUsers`

**No authentication required currently**

**Response:**

```json
[
  {
    "_id": "6864af340d94bd297654bce3",
    "userId": "u1",
    "name": "John Doe",
    "scores": [
      {
        "questionId": "6864af340d94bd297654bce2",
        "selectedOption": 0,
        "isCorrect": true
      }
    ],
    "totalSocre": 1,
    "__v": 1
  }
]
```

**Status Codes:**

- `200 OK` - Users retrieved successfully
- `500 Internal Server Error` - Server error

---

## Data Models

### Question Model

```javascript
{
  "_id": ObjectId,
  "question": String,
  "options": [String],
  "correctAnswer": Number,
  "complianceName": String,
  "questionWeight": Number,
  "responses": Number,
  "createdAt": Date,
  "updatedAt": Date,
  "__v": Number
}
```

### User Model

```javascript
{
  "_id": ObjectId,
  "userId": String,
  "name": String,
  "categoryScores": [
    {
      "complianceName": String,
      "totalScored": Number,
      "totalWeighted": Number,
      "percentageScore": Number,
      "questionsAnswered": Number,
      "lastActivity": Date
    }
  ],
  "questionHistory": [
    {
      "questionId": ObjectId,
      "complianceName": String,
      "selectedOption": Number,
      "isCorrect": Boolean,
      "questionWeight": Number,
      "scoreEarned": Number,
      "answeredAt": Date
    }
  ],
  "totalScore": Number,
  "totalPossibleScore": Number,
  "overallPercentage": Number,
  "lastActivity": Date,
  "createdAt": Date,
  "updatedAt": Date,
  "__v": Number
}
```

---

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": "Error message description"
}
```

Common error scenarios:

- Invalid question ID format
- Question not found
- User not found
- Missing required fields
- Database connection issues

---

## Notes for Frontend Team

1. **Base URL**: Update the base URL when deploying to production
2. **Authentication**: Currently no authentication required
3. **CORS**: Ensure CORS is configured if frontend runs on different port
4. **Question IDs**: Use the `_id` field returned from question endpoints
5. **User IDs**: Can use custom string IDs (like "u1", "u2", etc.)
6. **Answer Options**: Answers are 0-indexed (first option = 0, second = 1, etc.)
7. **Compliance Types**: Common values include "GDPR", "SOX", "HIPAA"
8. **Question Weights**: Each question has a weight (default: 1) affecting the score calculation
9. **Category Scoring**: Users get scored per category as (totalScored/totalWeighted) * 100
10. **Activity Tracking**: All user activities are timestamped for analytics
11. **New Analytics Endpoint**: Use `/user/analytics/:userId` for detailed performance data

---

## Testing Examples

### Adding a Question (cURL)

```bash
curl -X POST http://localhost:3000/api/admin/add-question \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What does GDPR stand for?",
    "options": ["General Data Protection Regulation", "Global Data Privacy Rules", "General Database Protection Requirements", "Global Data Protection Registry"],
    "correctAnswer": 0,
    "complianceName": "GDPR",
    "questionWeight": 2
  }'
```

### Submitting an Answer (cURL)

```bash
curl -X POST http://localhost:3000/api/user/submit \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "u1",
    "name": "John Doe",
    "questionId": "6864af340d94bd297654bce2",
    "selectedOption": 0
  }'
```

### Getting User Analytics (cURL)

```bash
curl -X GET http://localhost:3000/api/user/analytics/u1 \
  -H "Content-Type: application/json"
```
