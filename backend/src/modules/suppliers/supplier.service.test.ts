import { supplierService } from './supplier.service';
import { prisma } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';

vi.mock('../../config/database', () => ({
  prisma: {
    supplier: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    product: {
      count: vi.fn(),
    },
  },
}));

describe('supplierService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return active suppliers ordered by name', async () => {
      const suppliers = [{ id: '1', name: 'Fornecedor A', deletedAt: null }];
      vi.mocked(prisma.supplier.findMany).mockResolvedValue(suppliers as any);

      const result = await supplierService.findAll();

      expect(result).toEqual(suppliers);
      expect(prisma.supplier.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findById', () => {
    it('should return supplier when found', async () => {
      const supplier = { id: '1', name: 'Fornecedor A', deletedAt: null };
      vi.mocked(prisma.supplier.findFirst).mockResolvedValue(supplier as any);

      const result = await supplierService.findById('1');

      expect(result).toEqual(supplier);
    });

    it('should throw AppError 404 when not found', async () => {
      vi.mocked(prisma.supplier.findFirst).mockResolvedValue(null);

      await expect(supplierService.findById('999')).rejects.toThrow(
        new AppError('Fornecedor não encontrado', 404),
      );
    });
  });

  describe('create', () => {
    it('should create and return a new supplier', async () => {
      const newSupplier = { id: '1', name: 'Fornecedor A', phone: null, email: null };
      vi.mocked(prisma.supplier.create).mockResolvedValue(newSupplier as any);

      const result = await supplierService.create({ name: 'Fornecedor A' });

      expect(result).toEqual(newSupplier);
    });
  });

  describe('update', () => {
    it('should update and return the supplier', async () => {
      const existing = { id: '1', name: 'Fornecedor A', deletedAt: null };
      vi.mocked(prisma.supplier.findFirst).mockResolvedValue(existing as any);
      const updated = { ...existing, name: 'Fornecedor B' };
      vi.mocked(prisma.supplier.update).mockResolvedValue(updated as any);

      const result = await supplierService.update('1', { name: 'Fornecedor B' });

      expect(result).toEqual(updated);
    });

    it('should throw AppError 404 when supplier not found', async () => {
      vi.mocked(prisma.supplier.findFirst).mockResolvedValue(null);

      await expect(supplierService.update('999', { name: 'X' })).rejects.toThrow(
        new AppError('Fornecedor não encontrado', 404),
      );
    });
  });

  describe('remove', () => {
    it('should soft delete the supplier', async () => {
      vi.mocked(prisma.supplier.findFirst).mockResolvedValue({ id: '1', name: 'Fornecedor A', deletedAt: null } as any);
      vi.mocked(prisma.product.count).mockResolvedValue(0);
      vi.mocked(prisma.supplier.update).mockResolvedValue({} as any);

      await expect(supplierService.remove('1')).resolves.toBeUndefined();
      expect(prisma.supplier.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw AppError 404 when not found', async () => {
      vi.mocked(prisma.supplier.findFirst).mockResolvedValue(null);

      await expect(supplierService.remove('999')).rejects.toThrow(
        new AppError('Fornecedor não encontrado', 404),
      );
    });

    it('should throw AppError 409 when supplier has active products', async () => {
      vi.mocked(prisma.supplier.findFirst).mockResolvedValue({ id: '1', name: 'Fornecedor A', deletedAt: null } as any);
      vi.mocked(prisma.product.count).mockResolvedValue(2);

      await expect(supplierService.remove('1')).rejects.toThrow(
        new AppError('Não é possível excluir um fornecedor com produtos ativos associados', 409),
      );
    });
  });
});
