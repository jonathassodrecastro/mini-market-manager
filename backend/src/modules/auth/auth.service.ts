import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '8h';

export type LoginData = {
  email: string;
  password: string;
};

export const authService = {
  async login(data: LoginData) {
    const user = await prisma.user.findFirst({
      where: { email: data.email, deletedAt: null },
    });

    if (!user) throw new AppError('Credenciais inválidas', 401);

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) throw new AppError('Credenciais inválidas', 401);

    const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },
};
