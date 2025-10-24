import asyncHandler from 'express-async-handler';
import { uploadSingle } from '../utils/s3.js';

export const uploadImage = [
  uploadSingle.single('file'),
  asyncHandler(async (req,res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ ok: true, url: req.file.location, meta: { originalname: req.file.originalname, size: req.file.size, mimetype: req.file.mimetype } });
  })
];
