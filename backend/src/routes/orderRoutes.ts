import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, orderController.getOrders);
router.get('/:id', authenticate, orderController.getOrder);
router.post('/', authenticate, orderController.createOrder);
router.patch('/:id/status', authenticate, authorize('ADMIN', 'MANAGER'), orderController.updateOrderStatus);

export default router;
