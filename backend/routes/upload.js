import express from 'express';
import { auth } from '../middlewares/auth.js';
import { uploadImage } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/image', auth, uploadImage);

export default router;
