import { Router } from 'express';
import { saleController } from './sale.controller';

export const saleRouter: Router = Router();

saleRouter.get('/', saleController.findAll);
saleRouter.get('/:id', saleController.findById);
saleRouter.post('/', saleController.create);
saleRouter.patch('/:id/cancel', saleController.cancel);
