import express from 'express';
import chatController from '../controllers/chatController.js';

const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
router.use(protect)
router.get('/getchats', chatController.getChats);
router.post('/', chatController.createChat);
router.get('/:chatId', chatController.getChatById);
router.get('/:chatId/messages', chatController.getChatMessages);
router.post('/:chatId/messages', chatController.sendMessage);

export default router;
