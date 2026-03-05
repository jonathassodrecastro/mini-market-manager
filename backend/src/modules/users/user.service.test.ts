import { userService } from './user.service';
import { prisma } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';

vi.mock('../../config/database', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
  },
}));

const userSelect = { id: true, name: true, email: true, role: true, createdAt: true };

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return active users ordered by name', async () => {
      const users = [{ id: '1', name: 'Alice', email: 'alice@test.com', role: 'ADMIN', createdAt: new Date() }];
      vi.mocked(prisma.user.findMany).mockResolvedValue(users as any);

      const result = await userService.findAll();

      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
        select: userSelect,
      });
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const user = { id: '1', name: 'Alice', email: 'alice@test.com', role: 'ADMIN', createdAt: new Date() };
      vi.mocked(prisma.user.findFirst).mockResolvedValue(user as any);

      const result = await userService.findById('1');

      expect(result).toEqual(user);
    });

    it('should throw AppError 404 when not found', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

      await expect(userService.findById('999')).rejects.toThrow(
        new AppError('Usuário não encontrado', 404),
      );
    });
  });

  describe('create', () => {
    it('should create and return a new user without password', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
      const newUser = { id: '1', name: 'Alice', email: 'alice@test.com', role: 'OPERADOR', createdAt: new Date() };
      vi.mocked(prisma.user.create).mockResolvedValue(newUser as any);

      const result = await userService.create({ name: 'Alice', email: 'alice@test.com', password: '123456' });

      expect(result).toEqual(newUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { name: 'Alice', email: 'alice@test.com', password: 'hashed_password' },
        select: userSelect,
      });
    });

    it('should throw AppError 409 when email already exists', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: '1' } as any);

      await expect(userService.create({ name: 'Alice', email: 'alice@test.com', password: '123456' })).rejects.toThrow(
        new AppError('Já existe um usuário com esse e-mail', 409),
      );
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      const existing = { id: '1', name: 'Alice', email: 'alice@test.com', role: 'ADMIN', createdAt: new Date() };
      vi.mocked(prisma.user.findFirst).mockResolvedValue(existing as any);
      const updated = { ...existing, name: 'Alice Updated' };
      vi.mocked(prisma.user.update).mockResolvedValue(updated as any);

      const result = await userService.update('1', { name: 'Alice Updated' });

      expect(result).toEqual(updated);
    });

    it('should throw AppError 404 when user not found', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

      await expect(userService.update('999', { name: 'X' })).rejects.toThrow(
        new AppError('Usuário não encontrado', 404),
      );
    });

    it('should throw AppError 409 when email conflicts with another user', async () => {
      vi.mocked(prisma.user.findFirst)
        .mockResolvedValueOnce({ id: '1', name: 'Alice' } as any)
        .mockResolvedValueOnce({ id: '2', email: 'bob@test.com' } as any);

      await expect(userService.update('1', { email: 'bob@test.com' })).rejects.toThrow(
        new AppError('Já existe um usuário com esse e-mail', 409),
      );
    });
  });

  describe('remove', () => {
    it('should soft delete the user', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: '1', name: 'Alice' } as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      await expect(userService.remove('1')).resolves.toBeUndefined();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw AppError 404 when not found', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

      await expect(userService.remove('999')).rejects.toThrow(
        new AppError('Usuário não encontrado', 404),
      );
    });
  });
});
