import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const getPages = async (req: Request, res: Response) => {
  try {
    const { isPublished } = req.query;

    const where: any = {};
    if (isPublished !== undefined) {
      where.isPublished = isPublished === 'true';
    }

    const pages = await prisma.cmsPage.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    res.json(pages);
  } catch (error) {
    throw error;
  }
};

export const getPage = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const page = await prisma.cmsPage.findUnique({
      where: { slug },
    });

    if (!page) {
      throw new AppError('Page not found', 404);
    }

    res.json(page);
  } catch (error) {
    throw error;
  }
};

export const createPage = async (req: Request, res: Response) => {
  try {
    const { title, content, metaTitle, metaDescription, isPublished } = req.body;

    const page = await prisma.cmsPage.create({
      data: {
        title,
        slug: title.toLowerCase().replace(/\s+/g, '-'),
        content,
        metaTitle,
        metaDescription,
        isPublished: isPublished || false,
      },
    });

    res.status(201).json(page);
  } catch (error) {
    throw error;
  }
};

export const updatePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (data.title) {
      data.slug = data.title.toLowerCase().replace(/\s+/g, '-');
    }

    const page = await prisma.cmsPage.update({
      where: { id },
      data,
    });

    res.json(page);
  } catch (error) {
    throw error;
  }
};

export const deletePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.cmsPage.delete({ where: { id } });

    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    throw error;
  }
};
