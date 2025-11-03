import express from 'express';
import { auth } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roles.js';
import {
  getAllNotices,
  getActiveNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} from '../controllers/noticeController.js';

const router = express.Router();

router.get('/', getActiveNotices); // Public route for retailers
router.get('/all', auth, authorize('admin'), getAllNotices); // Admin route
router.post('/', auth, authorize('admin'), createNotice);
router.put('/:id', auth, authorize('admin'), updateNotice);
router.delete('/:id', auth, authorize('admin'), deleteNotice);

export default router;