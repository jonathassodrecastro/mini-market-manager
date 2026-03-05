import { z } from 'zod';

export const createSaleSchema = z.object({
  userId: z.string().uuid('userId inválido'),
  items: z
    .array(
      z.object({
        productId: z.string().uuid('productId inválido'),
        quantity: z.number().int().positive('Quantidade deve ser maior que zero'),
      }),
    )
    .min(1, 'A venda deve ter ao menos um item'),
});
