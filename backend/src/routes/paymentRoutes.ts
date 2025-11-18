import { Router } from 'express';
import * as paymentController from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Stripe routes
router.post('/stripe/create-payment-intent', authenticate, paymentController.createStripePaymentIntent);
router.post('/stripe/confirm', authenticate, paymentController.confirmStripePayment);

// PayPal routes
router.post('/paypal/create-order', authenticate, paymentController.createPayPalOrder);
router.post('/paypal/capture', authenticate, paymentController.capturePayPalPayment);

// Klarna routes
router.post('/klarna/create-session', authenticate, paymentController.createKlarnaSession);
router.post('/klarna/confirm', authenticate, paymentController.confirmKlarnaPayment);

export default router;
