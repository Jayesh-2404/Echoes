import { messageRepository } from '@/src/repositories/message.repository';
import { userRepository } from '@/src/repositories/user.repository';
import { SendMessageInput } from '@/src/schemas/message.schema';
import { redis } from '@/src/lib/redis';


class MessageService {
  private isSpamContent(message: string): boolean {
    const spamKeywords = ['http', 'www', '.com', 'free', 'discount', 'prize', 'gift', 'crypto', 'nft'];
    const lowerCaseMessage = message.toLowerCase();
    const spamWordCount = spamKeywords.filter(keyword => lowerCaseMessage.includes(keyword)).length;
    return spamWordCount > 1;
  }

  public async isIpSuspicious(ip: string): Promise<boolean> {
    return (await redis.sismember('suspicious-ips', ip)) === 1;
  }

  public async processNewMessage(input: SendMessageInput, ip: string) {
    if (this.isSpamContent(input.message)) {
      await redis.sadd('suspicious-ips', ip);
    }
    const message = await messageRepository.create({ ...input, ipAddress: ip });
    return message;
  }


  // SECURED METHOD - Corrected Signature
  public async getMessagesForUser(userId: string, token?: string) {
    const user = await userRepository.findById(userId);
    if (!user || !token || user.secretToken !== token) {
      throw new Error('Unauthorized');
    }

    return messageRepository.findByUserId(userId);
  }
}

export const messageService = new MessageService();
