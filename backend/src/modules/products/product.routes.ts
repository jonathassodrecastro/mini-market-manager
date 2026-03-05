import { Router } from 'express';
import { productController } from './product.controller';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createProductSchema, updateProductSchema } from './product.schema';

export const productRouter: Router = Router();

productRouter.get('/', authenticate, productController.findAll);
productRouter.get('/:id', authenticate, productController.findById);
productRouter.post('/', authenticate, authorize('ADMIN'), validate(createProductSchema), productController.create);
productRouter.put('/:id', authenticate, authorize('ADMIN'), validate(updateProductSchema), productController.update);
productRouter.delete('/:id', authenticate, authorize('ADMIN'), productController.remove);
