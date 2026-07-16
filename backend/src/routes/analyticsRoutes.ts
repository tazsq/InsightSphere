import express from 'express';
import { getDashboardMetrics, getRecentFeedback, askDeanAssistant } from '../controllers/analyticsController';
import { protect, adminProtect } from '../middleware/authMiddleware';

const router = express.Router();

// All analytics routes are protected and require admin role
router.use(protect);
router.use(adminProtect);

router.get('/dashboard', getDashboardMetrics);
router.get('/recent', getRecentFeedback);
router.post('/dean-assistant', askDeanAssistant);

export default router;
