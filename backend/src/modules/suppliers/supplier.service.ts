import { prisma } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';

export type CreateSupplierData = {
  name: string;
  phone?: string;
  email?: string;
};

export type UpdateSupplierData = {
  name?: string;
  phone?: string;
  email?: string;
};

export const supplierService = {
  async findAll() {
    return prisma.supplier.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: string) {
    const supplier = await prisma.supplier.findFirst({
      where: { id, deletedAt: null },
    });
    if (!supplier) throw new AppError('Fornecedor não encontrado', 404);
    return supplier;
  },

  async create(data: CreateSupplierData) {
    return prisma.supplier.create({ data });
  },

  async update(id: string, data: UpdateSupplierData) {
    await supplierService.findById(id);
    return prisma.supplier.update({ where: { id }, data });
  },

  async remove(id: string) {
    await supplierService.findById(id);

    const activeProducts = await prisma.product.count({
      where: { supplierId: id, deletedAt: null },
    });

    if (activeProducts > 0) {
      throw new AppError('Não é possível excluir um fornecedor com produtos ativos associados', 409);
    }

    await prisma.supplier.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
