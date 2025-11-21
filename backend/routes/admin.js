import express from 'express';
import * as admin from '../controllers/adminController.js';
import { auth } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roles.js';

const router = express.Router();

router.use(auth);
router.use(authorize('admin'));

router.get('/pending-retailers', admin.getPendingRetailers);
router.get('/retailers', admin.getRetailers);
router.get('/admins', admin.getAdmins);
router.post('/user', admin.createUser); 
router.put('/user', admin.updateUser);

router.post('/service', admin.createService);
router.post('/sub-service', admin.createSubService);
router.post('/option', admin.createOption);
router.post('/form-field', admin.createFormField);

router.get('/services', admin.getAllServices);
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

// Submission Management
router.get('/submissions', admin.adminListSubmissions);
router.get('/submission/:submissionId', admin.getSubmissionById);
router.put('/submission/:submissionId/status', admin.updateSubmissionStatus);
router.put('/submission/:submissionId/upload-final', admin.uploadFinalDocument);

// KYC Management
router.get('/kyc-pending', admin.getPendingKycRequests);
router.get('/kyc/:id', admin.getKycRequestById);
router.put('/kyc/:id/status', admin.updateKycStatus);
router.get('/kyc/retailer/:retailerId', admin.getKycDetailsByRetailerId);



export default router;
