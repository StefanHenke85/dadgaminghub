import express from 'express';
import {
  getUserStatistics,
  getLeaderboard,
  getPlatformStats
} from '../controllers/statisticsController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(auth);

// Get user statistics
router.get('/user', getUserStatistics);

// Get leaderboard
router.get('/leaderboard', getLeaderboard);

// Get platform statistics
router.get('/platforms', getPlatformStats);

export default router;
