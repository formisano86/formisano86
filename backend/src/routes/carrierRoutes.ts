import { Router } from 'express';
import * as carrierController from '../controllers/carrierController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', carrierController.getCarriers);
router.get('/:id', carrierController.getCarrier);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), carrierController.createCarrier);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), carrierController.updateCarrier);
router.delete('/:id', authenticate, authorize('ADMIN'), carrierController.deleteCarrier);

export default router;
