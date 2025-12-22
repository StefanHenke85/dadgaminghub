import express from 'express';
import { body } from 'express-validator';
import {
  createSession,
  getSessions,
  getSession,
  joinSession,
  updateParticipantStatus,
  deleteSession
} from '../controllers/sessionController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(auth);

// Create session
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Titel ist erforderlich'),
    body('game').trim().notEmpty().withMessage('Spiel ist erforderlich'),
    body('platform').isIn(['PC', 'PS5', 'Xbox', 'Switch']).withMessage('Ungültige Plattform'),
    body('scheduledDate').isISO8601().withMessage('Ungültiges Datum')
  ],
  createSession
);

// Get all sessions
router.get('/', getSessions);

// Get single session
router.get('/:id', getSession);

// Join session
router.post('/:id/join', joinSession);

// Update participant status
router.put('/:id/participant', updateParticipantStatus);

// Delete session
router.delete('/:id', deleteSession);

export default router;
