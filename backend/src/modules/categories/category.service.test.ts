import { categoryService } from './category.service';
import { prisma } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';

vi.mock('../../config/database', () => ({
  prisma: {
    category: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('categoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all categories ordered by name', async () => {
      const categories = [
        { id: '1', name: 'Bebidas' },
        { id: '2', name: 'Laticínios' },
      ];
      vi.mocked(prisma.category.findMany).mockResolvedValue(categories as any);

      const result = await categoryService.findAll();

      expect(result).toEqual(categories);
      expect(prisma.category.findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
    });
  });

  describe('findById', () => {
    it('should return a category when found', async () => {
      const category = { id: '1', name: 'Bebidas' };
      vi.mocked(prisma.category.findUnique).mockResolvedValue(category as any);

      const result = await categoryService.findById('1');

      expect(result).toEqual(category);
    });

    it('should throw AppError 404 when not found', async () => {
      vi.mocked(prisma.category.findUnique).mockResolvedValue(null);

      await expect(categoryService.findById('999')).rejects.toThrow(
        new AppError('Categoria não encontrada', 404),
      );
    });
  });

  describe('create', () => {
    it('should create and return a new category', async () => {
      vi.mocked(prisma.category.findUnique).mockResolvedValue(null);
      const newCategory = { id: '1', name: 'Bebidas' };
      vi.mocked(prisma.category.create).mockResolvedValue(newCategory as any);

      const result = await categoryService.create({ name: 'Bebidas' });

      expect(result).toEqual(newCategory);
    });

    it('should throw AppError 409 when name already exists', async () => {
      vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: '1', name: 'Bebidas' } as any);

      await expect(categoryService.create({ name: 'Bebidas' })).rejects.toThrow(
        new AppError('Já existe uma categoria com esse nome', 409),
      );
    });
  });

  describe('update', () => {
    it('should update and return the category', async () => {
      vi.mocked(prisma.category.findUnique)
        .mockResolvedValueOnce({ id: '1', name: 'Bebidas' } as any)
        .mockResolvedValueOnce(null);
      const updated = { id: '1', name: 'Bebidas e Sucos' };
      vi.mocked(prisma.category.update).mockResolvedValue(updated as any);

      const result = await categoryService.update('1', { name: 'Bebidas e Sucos' });

      expect(result).toEqual(updated);
    });

    it('should throw AppError 404 when category not found', async () => {
      vi.mocked(prisma.category.findUnique).mockResolvedValue(null);

      await expect(categoryService.update('999', { name: 'Test' })).rejects.toThrow(
        new AppError('Categoria não encontrada', 404),
      );
    });

    it('should throw AppError 409 when name conflicts with another category', async () => {
      vi.mocked(prisma.category.findUnique)
        .mockResolvedValueOnce({ id: '1', name: 'Bebidas' } as any)
        .mockResolvedValueOnce({ id: '2', name: 'Laticínios' } as any);

      await expect(categoryService.update('1', { name: 'Laticínios' })).rejects.toThrow(
        new AppError('Já existe uma categoria com esse nome', 409),
      );
    });
  });

  describe('remove', () => {
    it('should delete the category', async () => {
      vi.mocked(prisma.category.findUnique).mockResolvedValue({
        id: '1',
        name: 'Bebidas',
        _count: { products: 0 },
      } as any);
      vi.mocked(prisma.category.delete).mockResolvedValue({} as any);

      await expect(categoryService.remove('1')).resolves.toBeUndefined();
      expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw AppError 404 when not found', async () => {
      vi.mocked(prisma.category.findUnique).mockResolvedValue(null);

      await expect(categoryService.remove('999')).rejects.toThrow(
        new AppError('Categoria não encontrada', 404),
      );
    });

    it('should throw AppError 409 when category has products', async () => {
      vi.mocked(prisma.category.findUnique).mockResolvedValue({
        id: '1',
        name: 'Bebidas',
        _count: { products: 3 },
      } as any);

      await expect(categoryService.remove('1')).rejects.toThrow(
        new AppError('Não é possível excluir uma categoria com produtos associados', 409),
      );
    });
  });
});
