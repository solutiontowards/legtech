import express from 'express';
import { auth } from '../middlewares/auth.js';
import * as wallet from '../controllers/walletController.js';

const router = express.Router();

router.get('/', auth, wallet.getWallet);
router.post('/create-order', auth, wallet.createRazorpayOrderForWallet);
router.post('/credit', auth, wallet.creditWallet); // protect with admin role in production if needed

export default router;
