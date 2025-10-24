import express from 'express';
import * as services from '../controllers/serviceController.js';
const router = express.Router();

router.get('/', services.listServices);
router.get('/:serviceSlug', services.getServiceDetail);
router.get('/:serviceSlug/:subServiceSlug', services.getServiceDetail);

export default router;
