// backend/routes/chatbotRoutes.js
import express from 'express';
import { postMessage } from '../controllers/chatbotController.js';
const router = express.Router();

// Middleware to log incoming requests
router.use((req, res, next) => {
  console.log("🔌 [ChatbotRoutes] Incoming request:", req.method, req.path);
  next();
});

// POST /api/chatbot/message
router.post('/message', (req, res, next) => {
  console.log("📍 [ChatbotRoutes] POST /message route handler called");
  postMessage(req, res, next);
});

export default router;
