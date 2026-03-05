import { z } from 'zod';

export const createSupplierSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional(),
});

export const updateSupplierSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').optional(),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional(),
});
