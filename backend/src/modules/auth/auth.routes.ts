import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { loginSchema } from './auth.schema';

export const authRouter: Router = Router();

authRouter.post('/login', validate(loginSchema), authController.login);
authRouter.get('/me', authenticate, authController.me);
