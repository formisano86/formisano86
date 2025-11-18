import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const getCarriers = async (req: Request, res: Response) => {
  try {
    const carriers = await prisma.carrier.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    res.json(carriers);
  } catch (error) {
    throw error;
  }
};

export const getCarrier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const carrier = await prisma.carrier.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!carrier) {
      throw new AppError('Carrier not found', 404);
    }

    res.json(carrier);
  } catch (error) {
    throw error;
  }
};

export const createCarrier = async (req: Request, res: Response) => {
  try {
    const { name, code, website, trackingUrl, shippingCost, estimatedDays } = req.body;

    const carrier = await prisma.carrier.create({
      data: {
        name,
        code,
        website,
        trackingUrl,
        shippingCost,
        estimatedDays,
      },
    });

    res.status(201).json(carrier);
  } catch (error) {
    throw error;
  }
};

export const updateCarrier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const carrier = await prisma.carrier.update({
      where: { id },
      data: req.body,
    });

    res.json(carrier);
  } catch (error) {
    throw error;
  }
};

export const deleteCarrier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.carrier.delete({ where: { id } });

    res.json({ message: 'Carrier deleted successfully' });
  } catch (error) {
    throw error;
  }
};
