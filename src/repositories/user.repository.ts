import { prisma } from '@/src/lib/prisma';
import { User } from '@prisma/client';

class UserRepository {
  public async create(): Promise<User> {
    return prisma.user.create({ data: {} });
  }
}

export const userRepository = new UserRepository();
