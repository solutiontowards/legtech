import express from 'express';
import { auth } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roles.js';
import * as wishes from '../controllers/wishesController.js';

const router = express.Router();

// @ Retailer Route - Get active wishes
router.get('/', auth, wishes.getActiveWishes);

// @ Admin Routes
router.get('/all', auth, authorize('admin'), wishes.getAllWishes);
router.post('/', auth, authorize('admin'), wishes.createWish);
router.put('/:id', auth, authorize('admin'), wishes.updateWish);
router.delete('/:id', auth, authorize('admin'), wishes.deleteWish);

export default router;