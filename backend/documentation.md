# 🔐 Authentication API - Backend Documentation

## Base URL
```
http://localhost:5000/api/auth
```

---

## 📍 API Endpoints

### 1. Register User (Signup)

**POST** `/api/auth/signup`

**Access:** Public

**Description:** Create a new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "gender": "Male"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "gender": "Male",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `400` - Missing fields or email already exists
- `500` - Server error

---

### 2. Login User

**POST** `/api/auth/login`

**Access:** Public

**Description:** Authenticate user and get JWT token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "gender": "Male",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `400` - Missing email or password
- `401` - Invalid credentials
- `500` - Server error

---

### 3. Get User Profile

**GET** `/api/auth/profile`

**Access:** Private 🔒

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "gender": "Male",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
- `401` - No token or invalid token
- `404` - User not found
- `500` - Server error

---

### 4. Update User Profile

**PUT** `/api/auth/profile`

**Access:** Private 🔒

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:** (all fields optional)
```json
{
  "name": "John Updated",
  "email": "newemail@example.com",
  "password": "newpassword123",
  "gender": "Male"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Updated",
    "email": "newemail@example.com",
    "gender": "Male"
  }
}
```

**Errors:**
- `400` - Email already in use
- `401` - No token or invalid token
- `404` - User not found
- `500` - Server error

---

### 5. Delete User Account

**DELETE** `/api/auth/profile`

**Access:** Private 🔒

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**Errors:**
- `401` - No token or invalid token
- `404` - User not found
- `500` - Server error

---

### 6. Logout User

**POST** `/api/auth/logout`

**Access:** Private 🔒

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Description:** Logout user (remove token on client side)

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Errors:**
- `401` - No token or invalid token
- `500` - Server error

---

### 7. Get All Users

**GET** `/api/auth/users`

**Access:** Private 🔒 (Admin)

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Description:** Retrieve all registered users

**Response (200):**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "gender": "Male",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "gender": "Female",
      "createdAt": "2024-01-16T11:20:00.000Z",
      "updatedAt": "2024-01-16T11:20:00.000Z"
    }
  ]
}
```

**Errors:**
- `401` - No token or invalid token
- `500` - Server error

---

## 🔧 Implementation Details

### File Structure
```
backend/
├── models/
│   └── UserSchema.js              # Mongoose User schema
├── controllers/
│   └── authController.js    # Controller functions
├── routes/
│   └── authRoutes.js       # Route definitions
├── middleware/
│   └── authMiddleware.js   # JWT verification
├── index.js                   # Main server file
├── .env                     # Environment variables
└── package.json
```

### User Schema
```javascript
{
  name: String (required),
  email: String (required, unique, validated),
  password: String (required, min 6 chars, hashed),
  gender: String (enum: Male/Female/Other),
  timestamps: true
}
```

### Authentication Flow
1. **Signup/Login** → User receives JWT token
2. **Token Storage** → Client stores token (localStorage/cookies)
3. **Protected Routes** → Client sends token in Authorization header
4. **Middleware** → Verifies token and attaches user to request
5. **Access Granted** → Controller processes request

### Password Security
- Passwords hashed using **bcryptjs** with 10 salt rounds
- Password never returned in responses
- Comparison method: `user.comparePassword(password)`

### JWT Token
- **Algorithm:** HS256
- **Expiration:** 30 days
- **Payload:** User ID
- **Format:** `Bearer <token>`

---

## 🧪 Testing with Postman/Thunder Client

### 1. Register a User
```
POST http://localhost:5000/api/auth/signup
Body (JSON):
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "test123",
  "gender": "Male"
}
```

### 2. Login
```
POST http://localhost:5000/api/auth/login
Body (JSON):
{
  "email": "test@example.com",
  "password": "test123"
}
```
**Copy the token from response**

### 3. Get Profile (Protected)
```
GET http://localhost:5000/api/auth/profile
Headers:
Authorization: Bearer <paste_your_token_here>
```

### 4. Update Profile (Protected)
```
PUT http://localhost:5000/api/auth/profile
Headers:
Authorization: Bearer <your_token>
Body (JSON):
{
  "name": "Updated Name"
}
```

### 5. Delete Account (Protected)
```
DELETE http://localhost:5000/api/auth/profile
Headers:
Authorization: Bearer <your_token>
```

---

## 🛠 Environment Setup

### .env File
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/auth_db
JWT_SECRET=your_secret_key_minimum_32_characters
NODE_ENV=development
```

### Installation
```bash
npm install express mongoose bcryptjs jsonwebtoken dotenv
npm install --save-dev nodemon
```

### Run Server
```bash
# Development
npm run dev

# Production
npm start
```

---

## ⚠️ Error Response Format

All errors follow this structure:
```json
{
  "success": false,
  "message": "Error description here"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔐 Security Features

✅ Password hashing with bcrypt  
✅ JWT token authentication  
✅ Email validation  
✅ Password minimum length (6 chars)  
✅ Unique email constraint  
✅ Protected routes with middleware  
✅ Token expiration (30 days)  
✅ Password excluded from responses  

---

## 📝 Notes

- Token expires after 30 days
- Client must handle token storage
- Logout removes token client-side only
- All protected routes need `Authorization: Bearer <token>` header
- Passwords are case-sensitive
- Emails are stored in lowercase