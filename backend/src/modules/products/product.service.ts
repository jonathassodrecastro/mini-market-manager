import { prisma } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';

export type CreateProductData = {
  name: string;
  barcode?: string;
  price: number;
  stock?: number;
  minStock?: number;
  categoryId: string;
  supplierId?: string;
};

export type UpdateProductData = {
  name?: string;
  barcode?: string;
  price?: number;
  stock?: number;
  minStock?: number;
  categoryId?: string;
  supplierId?: string;
};

const productInclude = {
  category: { select: { id: true, name: true } },
  supplier: { select: { id: true, name: true } },
};

export const productService = {
  async findAll() {
    return prisma.product.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: productInclude,
    });
  },

  async findById(id: string) {
    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: productInclude,
    });
    if (!product) throw new AppError('Produto não encontrado', 404);
    return product;
  },

  async create(data: CreateProductData) {
    if (data.barcode) {
      const existing = await prisma.product.findUnique({ where: { barcode: data.barcode } });
      if (existing) throw new AppError('Já existe um produto com esse código de barras', 409);
    }

    const categoryExists = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!categoryExists) throw new AppError('Categoria não encontrada', 404);

    if (data.supplierId) {
      const supplierExists = await prisma.supplier.findFirst({ where: { id: data.supplierId, deletedAt: null } });
      if (!supplierExists) throw new AppError('Fornecedor não encontrado', 404);
    }

    return prisma.product.create({ data, include: productInclude });
  },

  async update(id: string, data: UpdateProductData) {
    await productService.findById(id);

    if (data.barcode) {
      const conflict = await prisma.product.findUnique({ where: { barcode: data.barcode } });
      if (conflict && conflict.id !== id) throw new AppError('Já existe um produto com esse código de barras', 409);
    }

    if (data.categoryId) {
      const categoryExists = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (!categoryExists) throw new AppError('Categoria não encontrada', 404);
    }

    if (data.supplierId) {
      const supplierExists = await prisma.supplier.findFirst({ where: { id: data.supplierId, deletedAt: null } });
      if (!supplierExists) throw new AppError('Fornecedor não encontrado', 404);
    }

    return prisma.product.update({ where: { id }, data, include: productInclude });
  },

  async remove(id: string) {
    await productService.findById(id);
    await prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
