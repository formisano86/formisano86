import { Router } from 'express';
import * as categoryController from '../controllers/categoryController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), categoryController.createCategory);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), categoryController.updateCategory);
router.delete('/:id', authenticate, authorize('ADMIN'), categoryController.deleteCategory);

export default router;
