import { Router } from 'express';
import { saleController } from './sale.controller';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createSaleSchema } from './sale.schema';

export const saleRouter: Router = Router();

saleRouter.get('/', authenticate, saleController.findAll);
saleRouter.get('/:id', authenticate, saleController.findById);
saleRouter.post('/', authenticate, validate(createSaleSchema), saleController.create);
saleRouter.patch('/:id/cancel', authenticate, saleController.cancel);
