import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';

const SALT_ROUNDS = 10;

export type CreateUserData = {
  name: string;
  email: string;
  password: string;
  role?: Role;
};

export type UpdateUserData = {
  name?: string;
  email?: string;
  role?: Role;
};

export const userService = {
  async findAll() {
    return prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  },

  async findById(id: string) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    if (!user) throw new AppError('Usuário não encontrado', 404);
    return user;
  },

  async create(data: CreateUserData) {
    const existing = await prisma.user.findFirst({ where: { email: data.email, deletedAt: null } });
    if (existing) throw new AppError('Já existe um usuário com esse e-mail', 409);

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    return prisma.user.create({
      data: { ...data, password: hashedPassword },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  },

  async update(id: string, data: UpdateUserData) {
    await userService.findById(id);

    if (data.email) {
      const conflict = await prisma.user.findFirst({ where: { email: data.email, deletedAt: null } });
      if (conflict && conflict.id !== id) throw new AppError('Já existe um usuário com esse e-mail', 409);
    }

    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  },

  async remove(id: string) {
    await userService.findById(id);
    await prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
