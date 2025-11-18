import { Router } from 'express';
import * as supplierController from '../controllers/supplierController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('ADMIN', 'MANAGER'), supplierController.getSuppliers);
router.get('/:id', authenticate, authorize('ADMIN', 'MANAGER'), supplierController.getSupplier);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), supplierController.createSupplier);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), supplierController.updateSupplier);
router.delete('/:id', authenticate, authorize('ADMIN'), supplierController.deleteSupplier);

export default router;
