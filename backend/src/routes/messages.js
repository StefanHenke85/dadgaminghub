import express from 'express';
import {
  sendMessage,
  getConversation,
  getSessionMessages,
  getConversations,
  markAsRead
} from '../controllers/messageController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(auth);

// Send message
router.post('/', sendMessage);

// Get all conversations
router.get('/conversations', getConversations);

// Get conversation with specific user
router.get('/conversation/:userId', getConversation);

// Get session messages
router.get('/session/:sessionId', getSessionMessages);

// Mark messages as read
router.put('/read/:userId', markAsRead);

export default router;
