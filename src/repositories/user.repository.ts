import { prisma } from '@/src/lib/prisma';
import { User } from '@prisma/client';

class UserRepository {
  public async create(data: { name: string; avatarUrl?: string }): Promise<User> {

    return prisma.user.create({ data });
  }

  public async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }
}

export const userRepository = new UserRepository();
