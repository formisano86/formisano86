import { Router } from 'express';
import * as productController from '../controllers/productController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), productController.createProduct);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), productController.updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN'), productController.deleteProduct);

export default router;
