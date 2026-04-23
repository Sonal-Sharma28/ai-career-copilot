import express from 'express';
import multer from 'multer';
import { uploadResume, getResume } from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.get('/', protect, getResume);

export default router;
