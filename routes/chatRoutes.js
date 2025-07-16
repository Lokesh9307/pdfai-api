import express from 'express';
import multer from 'multer';
import { handleChatWithPDF } from '../controllers/chatController.js';

const router = express.Router();

// Render-optimized multer configuration (smaller limits for better performance)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit (Render friendly)
        files: 1,
        fieldSize: 1024 * 1024 // 1MB field size limit
    },
    fileFilter: (req, file, cb) => {
        console.log(`File upload attempt: ${file.originalname}, type: ${file.mimetype}`);
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

// Middleware to handle multer errors
const handleUpload = (req, res, next) => {
    upload.single('pdf')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'File size too large. Maximum 5MB allowed.' });
            }
            if (err.code === 'LIMIT_FIELD_VALUE') {
                return res.status(400).json({ error: 'Field value too large.' });
            }
            return res.status(400).json({ error: `Upload error: ${err.message}` });
        } else if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({ error: err.message });
        }
        
        // Log successful file upload
        if (req.file) {
            console.log(`File uploaded successfully: ${req.file.originalname} (${req.file.size} bytes)`);
        }
        
        next();
    });
};

router.post('/upload', handleUpload, handleChatWithPDF);

export default router;