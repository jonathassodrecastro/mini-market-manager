import { Request, Response, NextFunction } from 'express';
import { supplierService } from './supplier.service';

export const supplierController = {
  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const suppliers = await supplierService.findAll();
      res.json(suppliers);
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const supplier = await supplierService.findById(req.params.id);
      res.json(supplier);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const supplier = await supplierService.create(req.body);
      res.status(201).json(supplier);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const supplier = await supplierService.update(req.params.id, req.body);
      res.json(supplier);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await supplierService.remove(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
