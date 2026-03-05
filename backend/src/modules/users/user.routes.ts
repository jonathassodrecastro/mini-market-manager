import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createUserSchema, updateUserSchema } from './user.schema';

export const userRouter: Router = Router();

userRouter.get('/', authenticate, userController.findAll);
userRouter.get('/:id', authenticate, userController.findById);
userRouter.post('/', authenticate, authorize('ADMIN'), validate(createUserSchema), userController.create);
userRouter.put('/:id', authenticate, authorize('ADMIN'), validate(updateUserSchema), userController.update);
userRouter.delete('/:id', authenticate, authorize('ADMIN'), userController.remove);
