import { Router } from 'express';
import { supplierController } from './supplier.controller';

export const supplierRouter: Router = Router();

supplierRouter.get('/', supplierController.findAll);
supplierRouter.get('/:id', supplierController.findById);
supplierRouter.post('/', supplierController.create);
supplierRouter.put('/:id', supplierController.update);
supplierRouter.delete('/:id', supplierController.remove);
