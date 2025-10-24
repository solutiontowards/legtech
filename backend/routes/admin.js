import express from 'express';
import * as admin from '../controllers/adminController.js';
import { auth } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roles.js';

const router = express.Router();

router.use(auth);
router.use(authorize('admin'));

router.get('/pending-retailers', admin.getPendingRetailers);
router.post('/verify-retailer', admin.verifyRetailer);

router.post('/service', admin.createService);
router.post('/sub-service', admin.createSubService);
router.post('/option', admin.createOption);
router.post('/form-field', admin.createFormField);

export default router;
