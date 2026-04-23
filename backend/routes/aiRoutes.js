import express from 'express';
import { getMatchScore, optimizeResume, generateCoverLetter } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/match/:jobId', protect, getMatchScore);
router.post('/optimize/:jobId', protect, optimizeResume);
router.post('/cover-letter/:jobId', protect, generateCoverLetter);

export default router;
