import { prisma } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';

export type CreateCategoryData = {
  name: string;
};

export type UpdateCategoryData = {
  name: string;
};

export const categoryService = {
  async findAll() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new AppError('Categoria não encontrada', 404);
    return category;
  },

  async create(data: CreateCategoryData) {
    const existing = await prisma.category.findUnique({ where: { name: data.name } });
    if (existing) throw new AppError('Já existe uma categoria com esse nome', 409);
    return prisma.category.create({ data });
  },

  async update(id: string, data: UpdateCategoryData) {
    await categoryService.findById(id);

    const nameConflict = await prisma.category.findUnique({ where: { name: data.name } });
    if (nameConflict && nameConflict.id !== id) {
      throw new AppError('Já existe uma categoria com esse nome', 409);
    }

    return prisma.category.update({ where: { id }, data });
  },

  async remove(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) throw new AppError('Categoria não encontrada', 404);

    if (category._count.products > 0) {
      throw new AppError('Não é possível excluir uma categoria com produtos associados', 409);
    }

    await prisma.category.delete({ where: { id } });
  },
};
