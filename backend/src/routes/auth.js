import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile
} from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';
import { upload, uploadAvatar } from '../controllers/uploadController.js';

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Benutzername muss mindestens 3 Zeichen lang sein'),
    body('email').isEmail().withMessage('Ungültige E-Mail-Adresse'),
    body('password').isLength({ min: 6 }).withMessage('Passwort muss mindestens 6 Zeichen lang sein'),
    body('name').trim().notEmpty().withMessage('Name ist erforderlich'),
    body('age').isInt({ min: 18 }).withMessage('Mindestalter ist 18 Jahre')
  ],
  register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Ungültige E-Mail-Adresse'),
    body('password').notEmpty().withMessage('Passwort ist erforderlich')
  ],
  login
);

// Logout (protected)
router.post('/logout', auth, logout);

// Get profile (protected)
router.get('/profile', auth, getProfile);

// Update profile (protected)
router.put('/profile', auth, updateProfile);

// Upload avatar (protected)
router.post('/upload-avatar', auth, upload.single('avatar'), uploadAvatar);

export default router;
