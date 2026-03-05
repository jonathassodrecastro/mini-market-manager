import { Request, Response, NextFunction } from 'express';
import { categoryService } from './category.service';

export const categoryController = {
  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.findAll();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.findById(req.params.id);
      res.json(category);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.create(req.body);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.update(req.params.id, req.body);
      res.json(category);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await categoryService.remove(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
