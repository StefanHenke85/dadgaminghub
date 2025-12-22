import express from 'express';
import {
  getUsers,
  getUser,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  updateOnlineStatus
} from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(auth);

// Get all users
router.get('/', getUsers);

// Get single user
router.get('/:id', getUser);

// Friend management
router.post('/:id/friend-request', sendFriendRequest);
router.post('/:id/accept-friend', acceptFriendRequest);
router.post('/:id/decline-friend', declineFriendRequest);
router.delete('/:id/friend', removeFriend);

// Update online status
router.put('/status', updateOnlineStatus);

export default router;
