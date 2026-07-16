import express from 'express';
import { startSession, chat, submitSession } from '../controllers/feedbackController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Only logged in students can start a session (to verify they are real students)
router.post('/start', protect, startSession);

// Chat and submit use the anonymous token, so they don't require the JWT protect middleware
router.post('/chat', chat);
router.post('/submit', submitSession);

export default router;
