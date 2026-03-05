import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  me(req: Request, res: Response) {
    res.json(req.user);
  },
};
