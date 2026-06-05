# SAMSKRUTHI an Educational Teaching Platform
A full-stack web application that connects students and teachers, featuring AI-powered doubt resolution, real-time chat, and role-based dashboards.

# Tech Stack
Frontend : React 19, React Router v7, Axios
Backend  : Node.js, Express.js
Database : MongoDB, Mongoose
Auth     : JWT, bcrypt
AI       : Google Gemini 2.0 Flash

# Features

Authentication         — Signup/login for Students and Teachers with JWT-based session management
Role-based Dashboards  — Separate views and permissions for students and teachers
Doubt Management       — Students post doubts; AI instantly generates a reply in the background; teachers can review and accept
Chat System            — Messaging between students and teachers, linked to doubts
TutorBot               — Floating AI chatbot available on all pages, powered by Gemini with conversation history
Study Plans            — AI-generated study recommendations based on doubt patterns



# Project Structure

```
ETPproject/
├── backend/
│   ├── controllers/        # Route logic
│   │   ├── authController.js
│   │   ├── chatbotController.js
│   │   ├── chatController.js
│   │   └── doubtController.js
│   ├── models/            # MongoDB schemas
│   │   ├── UserSchema.js
│   │   ├── ChatSchema.js
│   │   ├── DoubtSchema.js
│   │   └── MessageSchema.js
│   ├── routes/            # API endpoints
│   │   ├── authRoutes.js
│   │   ├── chatbotRoutes.js
│   │   ├── chatRoutes.js
│   │   └── doubtRoutes.js
│   ├── middleware/        # JWT auth middleware
│   │   └── authMiddleware.js
│   ├── utils/             # Utility functions
│   │   └── gemini.js      # Google Gemini API integration
│   ├── database/
│   │   └── connection.js
│   ├── index.js           # Express server entry point
│   ├── package.json
│   └── .env               # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── api/           # API calls
│   │   │   └── api.js
│   │   ├── contexts/      # React contexts
│   │   │   └── UserContext.js
│   │   ├── App.js
│   │   ├── Login.js
│   │   ├── Signup.js
│   │   ├── StudentDashboard.js
│   │   ├── TeacherDashboard.js
│   │   ├── Chat.js
│   │   ├── ChatbotWidget.js
│   │   ├── styles/        # CSS files
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   └── .env
│
└── README.md
```
