import express from 'express';
import {
  getUsers,
  getUser,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  getFriends,
  getFriendRequests,
  updateOnlineStatus
} from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(auth);

// Get all users
router.get('/', getUsers);

// Friends
router.get('/friends/list', getFriends);
router.get('/friends/requests', getFriendRequests);

// Get single user
router.get('/:id', getUser);

// Friend management
router.post('/:id/friend-request', sendFriendRequest);
router.post('/friend-requests/:id/accept', acceptFriendRequest);
router.post('/friend-requests/:id/decline', declineFriendRequest);
router.delete('/:id/friend', removeFriend);

// Update online status
router.put('/status', updateOnlineStatus);

export default router;
