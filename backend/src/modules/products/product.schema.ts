import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  barcode: z.string().optional(),
  price: z.number().positive('Preço deve ser positivo'),
  stock: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  categoryId: z.string().uuid('categoryId inválido'),
  supplierId: z.string().uuid('supplierId inválido').optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').optional(),
  barcode: z.string().optional(),
  price: z.number().positive('Preço deve ser positivo').optional(),
  stock: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  categoryId: z.string().uuid('categoryId inválido').optional(),
  supplierId: z.string().uuid('supplierId inválido').optional(),
});
