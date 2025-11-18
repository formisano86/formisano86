import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

// Newsletter
export const subscribeNewsletter = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const existing = await prisma.newsletter.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.isActive) {
        throw new AppError('Email already subscribed', 400);
      }
      // Reactivate subscription
      await prisma.newsletter.update({
        where: { email },
        data: { isActive: true, unsubscribedAt: null },
      });
    } else {
      await prisma.newsletter.create({
        data: { email },
      });
    }

    res.json({ message: 'Successfully subscribed to newsletter' });
  } catch (error) {
    throw error;
  }
};

export const unsubscribeNewsletter = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    await prisma.newsletter.update({
      where: { email },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });

    res.json({ message: 'Successfully unsubscribed from newsletter' });
  } catch (error) {
    throw error;
  }
};

export const getNewsletterSubscribers = async (req: Request, res: Response) => {
  try {
    const subscribers = await prisma.newsletter.findMany({
      where: { isActive: true },
      orderBy: { subscribedAt: 'desc' },
    });

    res.json({
      subscribers,
      total: subscribers.length,
    });
  } catch (error) {
    throw error;
  }
};

// Discounts
export const getDiscounts = async (req: Request, res: Response) => {
  try {
    const discounts = await prisma.discount.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json(discounts);
  } catch (error) {
    throw error;
  }
};

export const getDiscount = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    const discount = await prisma.discount.findUnique({
      where: { code },
    });

    if (!discount) {
      throw new AppError('Discount code not found', 404);
    }

    const now = new Date();
    if (!discount.isActive || now < discount.startDate || now > discount.endDate) {
      throw new AppError('Discount code is not valid', 400);
    }

    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      throw new AppError('Discount code has reached maximum uses', 400);
    }

    res.json(discount);
  } catch (error) {
    throw error;
  }
};

export const createDiscount = async (req: Request, res: Response) => {
  try {
    const {
      code,
      description,
      type,
      value,
      minOrderAmount,
      maxUses,
      startDate,
      endDate,
    } = req.body;

    const discount = await prisma.discount.create({
      data: {
        code: code.toUpperCase(),
        description,
        type,
        value,
        minOrderAmount,
        maxUses,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    res.status(201).json(discount);
  } catch (error) {
    throw error;
  }
};

export const updateDiscount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const discount = await prisma.discount.update({
      where: { id },
      data: req.body,
    });

    res.json(discount);
  } catch (error) {
    throw error;
  }
};

export const deleteDiscount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.discount.delete({ where: { id } });

    res.json({ message: 'Discount deleted successfully' });
  } catch (error) {
    throw error;
  }
};
