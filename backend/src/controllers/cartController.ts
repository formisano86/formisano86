import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const getCart = async (req: any, res: Response) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.userId },
      include: {
        product: {
          include: {
            images: true,
            inventory: true,
          },
        },
      },
    });

    const total = cartItems.reduce((sum, item) => {
      const price = item.product.salePrice || item.product.price;
      return sum + price * item.quantity;
    }, 0);

    res.json({
      items: cartItems,
      total,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    throw error;
  }
};

export const addToCart = async (req: any, res: Response) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { inventory: true },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.inventory && product.inventory.quantity < quantity) {
      throw new AppError('Insufficient stock', 400);
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.userId,
          productId,
        },
      },
    });

    let cartItem;

    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: { include: { images: true } } },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.userId,
          productId,
          quantity,
        },
        include: { product: { include: { images: true } } },
      });
    }

    res.json(cartItem);
  } catch (error) {
    throw error;
  }
};

export const updateCartItem = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const cartItem = await prisma.cartItem.update({
      where: { id, userId: req.userId },
      data: { quantity },
      include: { product: { include: { images: true } } },
    });

    res.json(cartItem);
  } catch (error) {
    throw error;
  }
};

export const removeFromCart = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.cartItem.delete({
      where: { id, userId: req.userId },
    });

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    throw error;
  }
};

export const clearCart = async (req: any, res: Response) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.userId },
    });

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    throw error;
  }
};
