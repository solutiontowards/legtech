import express from 'express';
import * as services from '../controllers/serviceController.js';
import { authorize } from '../middlewares/roles.js';
import { auth } from '../middlewares/auth.js';
const router = express.Router();

router.use(auth);
router.use(authorize('retailer', 'admin'));


router.get('/', services.listServices);
router.get('/count', services.getServiceCount); // Moved up
router.get('/:serviceSlug', services.getServiceDetail);
router.get('/:serviceSlug/:subServiceSlug', services.getServiceDetail);
router.get('/:serviceSlug/:subServiceSlug/:optionSlug', services.getOptionDetail);

export default router;
