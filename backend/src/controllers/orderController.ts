import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const getOrders = async (req: any, res: Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (req.userRole !== 'ADMIN') {
      where.userId = req.userId;
    }

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: { product: { include: { images: true } } },
          },
          shippingAddress: true,
          carrier: true,
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      orders,
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

export const getOrder = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: { include: { images: true } } },
        },
        shippingAddress: true,
        billingAddress: true,
        carrier: true,
        payments: true,
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (req.userRole !== 'ADMIN' && order.userId !== req.userId) {
      throw new AppError('Access denied', 403);
    }

    res.json(order);
  } catch (error) {
    throw error;
  }
};

export const createOrder = async (req: any, res: Response) => {
  try {
    const {
      items,
      shippingAddressId,
      billingAddressId,
      carrierId,
      discountCode,
    } = req.body;

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { inventory: true },
      });

      if (!product) {
        throw new AppError(`Product ${item.productId} not found`, 404);
      }

      if (product.inventory && product.inventory.quantity < item.quantity) {
        throw new AppError(`Insufficient stock for ${product.name}`, 400);
      }

      const price = product.salePrice || product.price;
      const total = price * item.quantity;
      subtotal += total;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price,
        total,
      });
    }

    // Apply discount if provided
    let discount = 0;
    if (discountCode) {
      const discountObj = await prisma.discount.findUnique({
        where: { code: discountCode },
      });

      if (discountObj && discountObj.isActive) {
        const now = new Date();
        if (now >= discountObj.startDate && now <= discountObj.endDate) {
          if (discountObj.type === 'PERCENTAGE') {
            discount = (subtotal * discountObj.value) / 100;
          } else {
            discount = discountObj.value;
          }
        }
      }
    }

    const tax = subtotal * 0.22; // 22% IVA
    const shipping = 5.0; // Fixed shipping
    const total = subtotal + tax + shipping - discount;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: req.userId,
        subtotal,
        tax,
        shipping,
        discount,
        total,
        shippingAddressId,
        billingAddressId,
        carrierId,
        discountCode,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
        shippingAddress: true,
        billingAddress: true,
      },
    });

    // Update inventory
    for (const item of items) {
      await prisma.inventory.update({
        where: { productId: item.productId },
        data: {
          quantity: { decrement: item.quantity },
          reservedQuantity: { increment: item.quantity },
        },
      });
    }

    res.status(201).json(order);
  } catch (error) {
    throw error;
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    const updateData: any = { status };

    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    if (status === 'SHIPPED') {
      updateData.shippedAt = new Date();
    }

    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    res.json(order);
  } catch (error) {
    throw error;
  }
};
