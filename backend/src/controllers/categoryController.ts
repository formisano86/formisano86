import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(categories);
  } catch (error) {
    throw error;
  }
};

export const getCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true,
        products: {
          where: { isActive: true },
          include: { images: true },
          take: 20,
        },
      },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    res.json(category);
  } catch (error) {
    throw error;
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, image, parentId } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description,
        image,
        parentId,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    throw error;
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (data.name) {
      data.slug = data.name.toLowerCase().replace(/\s+/g, '-');
    }

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    res.json(category);
  } catch (error) {
    throw error;
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.category.delete({ where: { id } });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    throw error;
  }
};
