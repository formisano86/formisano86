import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(suppliers);
  } catch (error) {
    throw error;
  }
};

export const getSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        products: {
          include: { images: true },
        },
      },
    });

    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    res.json(supplier);
  } catch (error) {
    throw error;
  }
};

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, address, website, contactPerson, notes } = req.body;

    const supplier = await prisma.supplier.create({
      data: {
        name,
        email,
        phone,
        address,
        website,
        contactPerson,
        notes,
      },
    });

    res.status(201).json(supplier);
  } catch (error) {
    throw error;
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const supplier = await prisma.supplier.update({
      where: { id },
      data: req.body,
    });

    res.json(supplier);
  } catch (error) {
    throw error;
  }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.supplier.delete({ where: { id } });

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    throw error;
  }
};
