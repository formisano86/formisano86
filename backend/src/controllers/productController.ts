import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      categoryId,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = { isActive: true };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: true,
          inventory: true,
        },
        skip,
        take: Number(limit),
        orderBy: { [sortBy as string]: order },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        inventory: true,
        supplier: true,
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json(product);
  } catch (error) {
    throw error;
  }
};

export const createProduct = async (req: any, res: Response) => {
  try {
    const {
      name,
      description,
      shortDescription,
      price,
      salePrice,
      sku,
      barcode,
      categoryId,
      supplierId,
      images,
      inventory,
    } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description,
        shortDescription,
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : null,
        sku,
        barcode,
        categoryId,
        supplierId,
        images: images
          ? {
              create: images.map((img: any, index: number) => ({
                url: img.url,
                alt: img.alt,
                isPrimary: index === 0,
              })),
            }
          : undefined,
        inventory: inventory
          ? {
              create: {
                quantity: inventory.quantity || 0,
                lowStockThreshold: inventory.lowStockThreshold || 10,
              },
            }
          : undefined,
      },
      include: {
        images: true,
        inventory: true,
        category: true,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (data.name) {
      data.slug = data.name.toLowerCase().replace(/\s+/g, '-');
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        images: true,
        inventory: true,
        category: true,
      },
    });

    res.json(product);
  } catch (error) {
    throw error;
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({ where: { id } });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    throw error;
  }
};
