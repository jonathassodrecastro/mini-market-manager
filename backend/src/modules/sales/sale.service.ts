import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';

export type CreateSaleItemData = {
  productId: string;
  quantity: number;
};

export type CreateSaleData = {
  userId: string;
  items: CreateSaleItemData[];
};

const saleInclude = {
  user: { select: { id: true, name: true } },
  items: {
    include: {
      product: { select: { id: true, name: true } },
    },
  },
};

export const saleService = {
  async findAll() {
    return prisma.sale.findMany({
      orderBy: { createdAt: 'desc' },
      include: saleInclude,
    });
  },

  async findById(id: string) {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: saleInclude,
    });
    if (!sale) throw new AppError('Venda não encontrada', 404);
    return sale;
  },

  async create(data: CreateSaleData) {
    if (!data.items || data.items.length === 0) {
      throw new AppError('A venda deve ter ao menos um item', 400);
    }

    const userExists = await prisma.user.findFirst({ where: { id: data.userId, deletedAt: null } });
    if (!userExists) throw new AppError('Usuário não encontrado', 404);

    const products = await Promise.all(
      data.items.map(async (item) => {
        const product = await prisma.product.findFirst({ where: { id: item.productId, deletedAt: null } });
        if (!product) throw new AppError(`Produto ${item.productId} não encontrado`, 404);
        if (product.stock < item.quantity) {
          throw new AppError(`Estoque insuficiente para o produto "${product.name}"`, 409);
        }
        return { product, quantity: item.quantity };
      }),
    );

    const saleItems = products.map(({ product, quantity }) => {
      const unitPrice = product.price as Decimal;
      const subtotal = new Decimal(unitPrice).mul(quantity);
      return { productId: product.id, quantity, unitPrice, subtotal };
    });

    const total = saleItems.reduce((acc, item) => acc.add(item.subtotal), new Decimal(0));

    return prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          userId: data.userId,
          total,
          items: { create: saleItems },
        },
        include: saleInclude,
      });

      for (const { product, quantity } of products) {
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: quantity } },
        });
      }

      return sale;
    });
  },

  async cancel(id: string) {
    const sale = await saleService.findById(id);

    if (sale.status === 'CANCELLED') {
      throw new AppError('Venda já está cancelada', 409);
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.sale.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: saleInclude,
      });

      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return updated;
    });
  },
};
