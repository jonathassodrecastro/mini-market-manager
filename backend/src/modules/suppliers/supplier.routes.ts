import { Router } from 'express';
import { supplierController } from './supplier.controller';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createSupplierSchema, updateSupplierSchema } from './supplier.schema';

export const supplierRouter: Router = Router();

supplierRouter.get('/', authenticate, supplierController.findAll);
supplierRouter.get('/:id', authenticate, supplierController.findById);
supplierRouter.post('/', authenticate, authorize('ADMIN'), validate(createSupplierSchema), supplierController.create);
supplierRouter.put('/:id', authenticate, authorize('ADMIN'), validate(updateSupplierSchema), supplierController.update);
supplierRouter.delete('/:id', authenticate, authorize('ADMIN'), supplierController.remove);
