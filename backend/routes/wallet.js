import express from 'express';
import { auth } from '../middlewares/auth.js';
import * as wallet from '../controllers/walletController.js';
import { authorize } from '../middlewares/roles.js';

const router = express.Router();

router.get('/', auth, wallet.getWallet);
router.post('/create-order', auth, wallet.createPaymentOrderForWallet);
router.post('/check-order-status', auth, wallet.checkOrderStatus);
router.post('/credit-wallet', auth,authorize('admin'), wallet.creditWallet); // protect with admin role in production if needed
router.get('/wallet-balance', auth, wallet.getWalletBalance);
router.get('/transactions', auth, wallet.getTransactions);
router.get('/recent-transactions', auth, wallet.getRecentTransactions);

export default router;
