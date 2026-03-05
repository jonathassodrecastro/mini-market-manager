import { Router } from 'express';
import { categoryController } from './category.controller';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createCategorySchema, updateCategorySchema } from './category.schema';

export const categoryRouter: Router = Router();

categoryRouter.get('/', authenticate, categoryController.findAll);
categoryRouter.get('/:id', authenticate, categoryController.findById);
categoryRouter.post('/', authenticate, authorize('ADMIN'), validate(createCategorySchema), categoryController.create);
categoryRouter.put('/:id', authenticate, authorize('ADMIN'), validate(updateCategorySchema), categoryController.update);
categoryRouter.delete('/:id', authenticate, authorize('ADMIN'), categoryController.remove);
