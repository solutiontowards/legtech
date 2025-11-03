import express from 'express';
import * as services from '../controllers/serviceController.js';
const router = express.Router();

router.get('/', services.listServices);
router.get('/count', services.getServiceCount); // Moved up
router.get('/:serviceSlug', services.getServiceDetail);
router.get('/:serviceSlug/:subServiceSlug', services.getServiceDetail);
router.get('/:serviceSlug/:subServiceSlug/:optionSlug', services.getOptionDetail);

export default router;
