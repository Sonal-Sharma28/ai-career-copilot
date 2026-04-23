import express from 'express';
import { scrapeJobs, getJobs } from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/scrape', protect, scrapeJobs);
router.get('/', protect, getJobs);

export default router;
