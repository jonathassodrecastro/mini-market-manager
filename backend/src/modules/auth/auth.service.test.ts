import { authService } from './auth.service';
import { prisma } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';

vi.mock('../../config/database', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mocked.jwt.token'),
  },
}));

import bcrypt from 'bcrypt';

const mockUser = {
  id: 'user1',
  name: 'Alice',
  email: 'alice@example.com',
  password: 'hashed_password',
  role: 'ADMIN' as const,
  deletedAt: null,
};

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should return token and user on valid credentials', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as any);

      const result = await authService.login({ email: 'alice@example.com', password: '123456' });

      expect(result.token).toBe('mocked.jwt.token');
      expect(result.user).toEqual({
        id: 'user1',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'ADMIN',
      });
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw AppError 401 when user not found', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

      await expect(
        authService.login({ email: 'naoexiste@example.com', password: '123456' }),
      ).rejects.toThrow(new AppError('Credenciais inválidas', 401));
    });

    it('should throw AppError 401 when password is wrong', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as any);

      await expect(
        authService.login({ email: 'alice@example.com', password: 'errada' }),
      ).rejects.toThrow(new AppError('Credenciais inválidas', 401));
    });
  });
});
