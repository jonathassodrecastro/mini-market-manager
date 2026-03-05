import { Request, Response, NextFunction } from 'express';
import { saleService } from './sale.service';

export const saleController = {
  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const sales = await saleService.findAll();
      res.json(sales);
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const sale = await saleService.findById(req.params.id);
      res.json(sale);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const sale = await saleService.create(req.body);
      res.status(201).json(sale);
    } catch (error) {
      next(error);
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const sale = await saleService.cancel(req.params.id);
      res.json(sale);
    } catch (error) {
      next(error);
    }
  },
};
