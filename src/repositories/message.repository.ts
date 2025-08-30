// The Repository layer is the ONLY part of the application that directly
// interacts with the database. This abstracts away the data source.
import { prisma } from '@/src/lib/prisma';
import { Message } from '@prisma/client';

class MessageRepository {
  public async create(data: {
    userId: string;
    message: string;
    ipAddress: string;
  }): Promise<Message> {
    return prisma.message.create({ data });
  }

  public async findByUserId(userId: string): Promise<Message[]> {
    return prisma.message.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      // Pagination is a crucial safeguard against fetching massive amounts of data.
      take: 50,
    });
  }
}

// Export a singleton instance of the repository.
export const messageRepository = new MessageRepository();
