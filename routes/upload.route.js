import express from 'express';
import { uploadImage, uploadImages, upload } from '../controllers/uploadController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All upload routes require authentication
router.use(authenticate);

router.post('/image', upload.single('image'), uploadImage);
router.post('/images', upload.array('images', 10), uploadImages);

export default router;