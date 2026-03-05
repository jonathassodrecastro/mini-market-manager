import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
});
