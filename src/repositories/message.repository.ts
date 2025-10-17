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
  // Find a single message by its ID it will be important for the authorization checks
  public async findById(id : string): Promise<Message|null>{
    return prisma.message.findUnique({where :{id}})
  }
  // Update a message with an answer and will set the timestamp for it
  public async updateAnswer(id: string , answer: string): Promise<Message>{
    return prisma.message.update({
      where :{id},
      data :{
        answer,
        answerAt: new Date(),
      },
    });
  }
  public async findAnswerByUserId(userId : string):Promise<Message[]>{
    return prisma.message.findMany({
      where:{
        userId,
        answer:{not : null},
      },
      orderBy:{answerAt: 'desc'},
      take: 50,
    });
  }

  // Alias method for the service layer
  public async findAnsweredMessagesByUserId(userId : string):Promise<Message[]>{
    return this.findAnswerByUserId(userId);
  }
}

// Export a singleton instance of the repository.
export const messageRepository = new MessageRepository();
