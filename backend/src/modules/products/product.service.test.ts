import { productService } from './product.service';
import { prisma } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';

vi.mock('../../config/database', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    category: {
      findUnique: vi.fn(),
    },
    supplier: {
      findFirst: vi.fn(),
    },
  },
}));

const productInclude = {
  category: { select: { id: true, name: true } },
  supplier: { select: { id: true, name: true } },
};

const mockProduct = {
  id: '1',
  name: 'Arroz',
  barcode: '7891234567890',
  price: 10.5,
  stock: 50,
  minStock: 10,
  categoryId: 'cat1',
  supplierId: 'sup1',
  deletedAt: null,
  category: { id: 'cat1', name: 'Grãos' },
  supplier: { id: 'sup1', name: 'Fornecedor A' },
};

describe('productService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return active products ordered by name', async () => {
      vi.mocked(prisma.product.findMany).mockResolvedValue([mockProduct] as any);

      const result = await productService.findAll();

      expect(result).toEqual([mockProduct]);
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
        include: productInclude,
      });
    });
  });

  describe('findById', () => {
    it('should return product when found', async () => {
      vi.mocked(prisma.product.findFirst).mockResolvedValue(mockProduct as any);

      const result = await productService.findById('1');

      expect(result).toEqual(mockProduct);
    });

    it('should throw AppError 404 when not found', async () => {
      vi.mocked(prisma.product.findFirst).mockResolvedValue(null);

      await expect(productService.findById('999')).rejects.toThrow(
        new AppError('Produto não encontrado', 404),
      );
    });
  });

  describe('create', () => {
    it('should create and return a new product', async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: 'cat1' } as any);
      vi.mocked(prisma.supplier.findFirst).mockResolvedValue({ id: 'sup1' } as any);
      vi.mocked(prisma.product.create).mockResolvedValue(mockProduct as any);

      const result = await productService.create({
        name: 'Arroz',
        barcode: '7891234567890',
        price: 10.5,
        categoryId: 'cat1',
        supplierId: 'sup1',
      });

      expect(result).toEqual(mockProduct);
    });

    it('should throw AppError 409 when barcode already exists', async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue({ id: '2' } as any);

      await expect(
        productService.create({ name: 'Feijão', barcode: '7891234567890', price: 8, categoryId: 'cat1' }),
      ).rejects.toThrow(new AppError('Já existe um produto com esse código de barras', 409));
    });

    it('should throw AppError 404 when category not found', async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.category.findUnique).mockResolvedValue(null);

      await expect(
        productService.create({ name: 'Arroz', price: 10, categoryId: 'invalid' }),
      ).rejects.toThrow(new AppError('Categoria não encontrada', 404));
    });

    it('should throw AppError 404 when supplier not found', async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: 'cat1' } as any);
      vi.mocked(prisma.supplier.findFirst).mockResolvedValue(null);

      await expect(
        productService.create({ name: 'Arroz', price: 10, categoryId: 'cat1', supplierId: 'invalid' }),
      ).rejects.toThrow(new AppError('Fornecedor não encontrado', 404));
    });
  });

  describe('update', () => {
    it('should update and return the product', async () => {
      vi.mocked(prisma.product.findFirst).mockResolvedValue(mockProduct as any);
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.product.update).mockResolvedValue({ ...mockProduct, name: 'Arroz Branco' } as any);

      const result = await productService.update('1', { name: 'Arroz Branco' });

      expect(result.name).toBe('Arroz Branco');
    });

    it('should throw AppError 404 when product not found', async () => {
      vi.mocked(prisma.product.findFirst).mockResolvedValue(null);

      await expect(productService.update('999', { name: 'X' })).rejects.toThrow(
        new AppError('Produto não encontrado', 404),
      );
    });

    it('should throw AppError 409 when barcode conflicts with another product', async () => {
      vi.mocked(prisma.product.findFirst).mockResolvedValue(mockProduct as any);
      vi.mocked(prisma.product.findUnique).mockResolvedValue({ id: '2', barcode: '7891234567890' } as any);

      await expect(productService.update('1', { barcode: '7891234567890' })).rejects.toThrow(
        new AppError('Já existe um produto com esse código de barras', 409),
      );
    });
  });

  describe('remove', () => {
    it('should soft delete the product', async () => {
      vi.mocked(prisma.product.findFirst).mockResolvedValue(mockProduct as any);
      vi.mocked(prisma.product.update).mockResolvedValue({} as any);

      await expect(productService.remove('1')).resolves.toBeUndefined();
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw AppError 404 when not found', async () => {
      vi.mocked(prisma.product.findFirst).mockResolvedValue(null);

      await expect(productService.remove('999')).rejects.toThrow(
        new AppError('Produto não encontrado', 404),
      );
    });
  });
});
