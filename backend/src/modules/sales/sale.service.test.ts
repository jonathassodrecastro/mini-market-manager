import { saleService } from './sale.service';
import { prisma } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';
import { Decimal } from '@prisma/client/runtime/library';

const { mockTransaction } = vi.hoisted(() => ({
  mockTransaction: vi.fn(),
}));

vi.mock('../../config/database', () => ({
  prisma: {
    sale: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
    },
    product: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    $transaction: mockTransaction,
  },
}));

const mockSale = {
  id: 'sale1',
  total: new Decimal(21),
  status: 'COMPLETED',
  userId: 'user1',
  createdAt: new Date(),
  updatedAt: new Date(),
  user: { id: 'user1', name: 'Alice' },
  items: [
    {
      id: 'item1',
      saleId: 'sale1',
      productId: 'prod1',
      quantity: 2,
      unitPrice: new Decimal(10.5),
      subtotal: new Decimal(21),
      product: { id: 'prod1', name: 'Arroz' },
    },
  ],
};

const mockProduct = {
  id: 'prod1',
  name: 'Arroz',
  price: new Decimal(10.5),
  stock: 50,
  deletedAt: null,
};

describe('saleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all sales ordered by date desc', async () => {
      vi.mocked(prisma.sale.findMany).mockResolvedValue([mockSale] as any);

      const result = await saleService.findAll();

      expect(result).toEqual([mockSale]);
      expect(prisma.sale.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });
  });

  describe('findById', () => {
    it('should return sale when found', async () => {
      vi.mocked(prisma.sale.findUnique).mockResolvedValue(mockSale as any);

      const result = await saleService.findById('sale1');

      expect(result).toEqual(mockSale);
    });

    it('should throw AppError 404 when not found', async () => {
      vi.mocked(prisma.sale.findUnique).mockResolvedValue(null);

      await expect(saleService.findById('999')).rejects.toThrow(
        new AppError('Venda não encontrada', 404),
      );
    });
  });

  describe('create', () => {
    it('should throw AppError 400 when items list is empty', async () => {
      await expect(saleService.create({ userId: 'user1', items: [] })).rejects.toThrow(
        new AppError('A venda deve ter ao menos um item', 400),
      );
    });

    it('should throw AppError 404 when user not found', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

      await expect(
        saleService.create({ userId: 'invalid', items: [{ productId: 'prod1', quantity: 1 }] }),
      ).rejects.toThrow(new AppError('Usuário não encontrado', 404));
    });

    it('should throw AppError 404 when product not found', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'user1' } as any);
      vi.mocked(prisma.product.findFirst).mockResolvedValue(null);

      await expect(
        saleService.create({ userId: 'user1', items: [{ productId: 'invalid', quantity: 1 }] }),
      ).rejects.toThrow(AppError);
    });

    it('should throw AppError 409 when stock is insufficient', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'user1' } as any);
      vi.mocked(prisma.product.findFirst).mockResolvedValue({ ...mockProduct, stock: 1 } as any);

      await expect(
        saleService.create({ userId: 'user1', items: [{ productId: 'prod1', quantity: 5 }] }),
      ).rejects.toThrow(new AppError('Estoque insuficiente para o produto "Arroz"', 409));
    });

    it('should create sale and decrement stock in a transaction', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'user1' } as any);
      vi.mocked(prisma.product.findFirst).mockResolvedValue(mockProduct as any);
      mockTransaction.mockImplementation(async (fn: Function) =>
        fn({
          sale: { create: vi.fn().mockResolvedValue(mockSale) },
          product: { update: vi.fn().mockResolvedValue({}) },
        }),
      );

      const result = await saleService.create({ userId: 'user1', items: [{ productId: 'prod1', quantity: 2 }] });

      expect(result).toEqual(mockSale);
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should cancel sale and restore stock', async () => {
      vi.mocked(prisma.sale.findUnique).mockResolvedValue(mockSale as any);
      mockTransaction.mockImplementation(async (fn: Function) =>
        fn({
          sale: { update: vi.fn().mockResolvedValue({ ...mockSale, status: 'CANCELLED' }) },
          product: { update: vi.fn().mockResolvedValue({}) },
        }),
      );

      const result = await saleService.cancel('sale1');

      expect(result.status).toBe('CANCELLED');
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw AppError 409 when sale is already cancelled', async () => {
      vi.mocked(prisma.sale.findUnique).mockResolvedValue({ ...mockSale, status: 'CANCELLED' } as any);

      await expect(saleService.cancel('sale1')).rejects.toThrow(
        new AppError('Venda já está cancelada', 409),
      );
    });

    it('should throw AppError 404 when sale not found', async () => {
      vi.mocked(prisma.sale.findUnique).mockResolvedValue(null);

      await expect(saleService.cancel('999')).rejects.toThrow(
        new AppError('Venda não encontrada', 404),
      );
    });
  });
});
