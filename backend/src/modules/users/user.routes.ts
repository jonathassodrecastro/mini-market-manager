import { Router } from 'express';
import { userController } from './user.controller';

export const userRouter: Router = Router();

userRouter.get('/', userController.findAll);
userRouter.get('/:id', userController.findById);
userRouter.post('/', userController.create);
userRouter.put('/:id', userController.update);
userRouter.delete('/:id', userController.remove);
