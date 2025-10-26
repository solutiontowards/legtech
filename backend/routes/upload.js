import express from 'express';
import { auth } from '../middlewares/auth.js';
import { uploadImage } from '../controllers/uploadController.js';

const router = express.Router();

router.post("/image", uploadImage.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({
    ok: true,
    url: req.file.location,
    meta: {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
});

export default router;
