import express from 'express';
import * as admin from '../controllers/adminController.js';
import { auth } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roles.js';

const router = express.Router();

router.use(auth);
router.use(authorize('admin'));

router.get('/pending-retailers', admin.getPendingRetailers);
router.post('/verify-retailer', admin.verifyRetailer);
router.get('/retailers', admin.getRetailers);

router.post('/service', admin.createService);
router.post('/sub-service', admin.createSubService);
router.post('/option', admin.createOption);
router.post('/form-field', admin.createFormField);

router.put('/service/:id', admin.updateService);
router.put('/sub-service/:id', admin.updateSubService);
router.put('/option/:id', admin.updateOption);

// Get service by ID
router.get('/service/id/:id', admin.getServiceById);
router.get('/service/slug/:slug', admin.getServiceBySlug);

// Get sub service bty  slug
router.get('/sub-service/slug/:serviceSlug/:subServiceSlug', admin.getSubServiceBySlug);

router.get('/option/slug/:serviceSlug/:subServiceSlug/:optionSlug', admin.getOptionBySlug);

router.get('/service-count', admin.getServiceCount);
router.get('/pending-retailer-count', admin.getPendingRetailerCount);
router.get('/retailer-count', admin.getRetailerCount);



export default router;
