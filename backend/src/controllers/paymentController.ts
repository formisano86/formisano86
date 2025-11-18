import { Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../config/database';
import { config } from '../config/config';
import { AppError } from '../middleware/errorHandler';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2024-12-18.acacia',
});

// Stripe Payment
export const createStripePaymentIntent = async (req: any, res: Response) => {
  try {
    const { orderId } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.userId !== req.userId) {
      throw new AppError('Access denied', 403);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Convert to cents
      currency: 'eur',
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        method: 'STRIPE',
        paymentIntentId: paymentIntent.id,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    throw error;
  }
};

export const confirmStripePayment = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const payment = await prisma.payment.findFirst({
      where: { paymentIntentId },
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (paymentIntent.status === 'succeeded') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          transactionId: paymentIntent.id,
        },
      });

      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'PROCESSING' },
      });

      res.json({ message: 'Payment confirmed', status: 'succeeded' });
    } else {
      res.json({ status: paymentIntent.status });
    }
  } catch (error) {
    throw error;
  }
};

// PayPal Payment
export const createPayPalOrder = async (req: any, res: Response) => {
  try {
    const { orderId } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.userId !== req.userId) {
      throw new AppError('Access denied', 403);
    }

    // Create PayPal order
    const paypalOrder = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'EUR',
          value: order.total.toFixed(2),
        },
        reference_id: order.orderNumber,
      }],
    };

    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        method: 'PAYPAL',
        metadata: JSON.stringify(paypalOrder),
      },
    });

    res.json({
      paypalOrder,
      message: 'PayPal order created',
    });
  } catch (error) {
    throw error;
  }
};

export const capturePayPalPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, paypalOrderId } = req.body;

    const payment = await prisma.payment.findFirst({
      where: { orderId },
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        transactionId: paypalOrderId,
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PROCESSING' },
    });

    res.json({ message: 'PayPal payment captured successfully' });
  } catch (error) {
    throw error;
  }
};

// Klarna Payment
export const createKlarnaSession = async (req: any, res: Response) => {
  try {
    const { orderId } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
        shippingAddress: true,
      },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.userId !== req.userId) {
      throw new AppError('Access denied', 403);
    }

    // Create Klarna session
    const klarnaSession = {
      purchase_country: order.shippingAddress.country,
      purchase_currency: 'EUR',
      locale: 'it-IT',
      order_amount: Math.round(order.total * 100),
      order_tax_amount: Math.round(order.tax * 100),
      order_lines: order.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        unit_price: Math.round(item.price * 100),
        total_amount: Math.round(item.total * 100),
      })),
    };

    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        method: 'KLARNA',
        metadata: JSON.stringify(klarnaSession),
      },
    });

    res.json({
      klarnaSession,
      message: 'Klarna session created',
    });
  } catch (error) {
    throw error;
  }
};

export const confirmKlarnaPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, klarnaOrderId } = req.body;

    const payment = await prisma.payment.findFirst({
      where: { orderId },
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        transactionId: klarnaOrderId,
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PROCESSING' },
    });

    res.json({ message: 'Klarna payment confirmed successfully' });
  } catch (error) {
    throw error;
  }
};
