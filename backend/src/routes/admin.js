import express from 'express';
import {
  getAllUsers,
  banUser,
  unbanUser,
  deleteUser,
  updateUserRole,
  getAdminLogs,
  getAdminStats
} from '../controllers/adminController.js';
import { auth } from '../middleware/auth.js';
import { requireAdmin, requireSuperAdmin } from '../middleware/admin.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Stats (Admin & Moderator)
router.get('/stats', requireAdmin, getAdminStats);

// User management (Admin & Moderator)
router.get('/users', requireAdmin, getAllUsers);

// Ban/Unban (Admin & Moderator)
router.post('/users/:userId/ban', requireAdmin, banUser);
router.post('/users/:userId/unban', requireAdmin, unbanUser);

// Delete user (Admin only)
router.delete('/users/:userId', requireSuperAdmin, deleteUser);

// Update role (Admin only)
router.put('/users/:userId/role', requireSuperAdmin, updateUserRole);

// Logs (Admin & Moderator)
router.get('/logs', requireAdmin, getAdminLogs);

export default router;
