import { Router } from 'express';
import { productController } from './product.controller';

export const productRouter: Router = Router();

productRouter.get('/', productController.findAll);
productRouter.get('/:id', productController.findById);
productRouter.post('/', productController.create);
productRouter.put('/:id', productController.update);
productRouter.delete('/:id', productController.remove);
