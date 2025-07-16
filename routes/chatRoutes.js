import express from 'express';
import multer from 'multer';
import { handleChatWithPDF } from '../controllers/chatController.js';

const router = express.Router();

// In-memory file handling:
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('pdf'), handleChatWithPDF);

export default router;
