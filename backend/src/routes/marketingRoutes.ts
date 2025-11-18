import { Router } from 'express';
import * as marketingController from '../controllers/marketingController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Newsletter routes
router.post('/newsletter/subscribe', marketingController.subscribeNewsletter);
router.post('/newsletter/unsubscribe', marketingController.unsubscribeNewsletter);
router.get('/newsletter/subscribers', authenticate, authorize('ADMIN', 'MANAGER'), marketingController.getNewsletterSubscribers);

// Discount routes
router.get('/discounts', authenticate, authorize('ADMIN', 'MANAGER'), marketingController.getDiscounts);
router.get('/discounts/:code', marketingController.getDiscount);
router.post('/discounts', authenticate, authorize('ADMIN', 'MANAGER'), marketingController.createDiscount);
router.put('/discounts/:id', authenticate, authorize('ADMIN', 'MANAGER'), marketingController.updateDiscount);
router.delete('/discounts/:id', authenticate, authorize('ADMIN'), marketingController.deleteDiscount);

export default router;
