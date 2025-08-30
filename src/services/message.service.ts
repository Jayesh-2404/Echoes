import { messageRepository } from '@/src/repositories/message.repository';
import { userRepository } from '@/src/repositories/user.repository'; 
import { SendMessageInput } from '@/src/schemas/message.schema';
import { redis } from '@/src/lib/redis';


class MessageService {
  // ...
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

  // SECURED METHOD
  public async getMessagesForUser(userId: string, token: string | null) {
    const user = await userRepository.findById(userId);

    // Authentication check:
    // 1. Does the user exist?
    // 2. Is a token provided?
    // 3. Does the provided token match the user's secretToken?
    if (!user || !token || user.secretToken !== token) {
      // Throw an error that we can catch in the API route.
      throw new Error('Unauthorized');
    }

    // If authorized, return the messages.
    return messageRepository.findByUserId(userId);
  }
}

export const messageService = new MessageService();
