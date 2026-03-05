import { Router } from 'express';
import { categoryController } from './category.controller';

export const categoryRouter: Router = Router();

categoryRouter.get('/', categoryController.findAll);
categoryRouter.get('/:id', categoryController.findById);
categoryRouter.post('/', categoryController.create);
categoryRouter.put('/:id', categoryController.update);
categoryRouter.delete('/:id', categoryController.remove);
