// FILE: src/services/message.service.ts
import { messageRepository } from '@/src/repositories/message.repository';
import { SendMessageInput } from '@/src/schemas/message.schema';
import { redis } from '@/src/lib/redis';

const SUSPICIOUS_IP_SET = 'suspicious-ips';

class MessageService {
  // ... isSpamContent and isIpSuspicious methods remain the same ...
  private isSpamContent(message: string): boolean {
    const spamKeywords = ['http', 'www', '.com', 'free', 'discount', 'prize', 'gift', 'crypto', 'nft'];
    const lowerCaseMessage = message.toLowerCase();
    const spamWordCount = spamKeywords.filter(keyword => lowerCaseMessage.includes(keyword)).length;
    return spamWordCount > 1;
  }

  public async isIpSuspicious(ip: string): Promise<boolean> {
    return (await redis.sismember(SUSPICIOUS_IP_SET, ip)) === 1;
  }

  public async processNewMessage(input: SendMessageInput, ip: string) {
    if (this.isSpamContent(input.message)) {
      await redis.sadd(SUSPICIOUS_IP_SET, ip);
    }
    // The input schema now contains 'userId'
    const message = await messageRepository.create({ ...input, ipAddress: ip });
    return message;
  }

  public async getMessagesForUser(userId: string) { // Changed from getMessagesForRecipient
    return messageRepository.findByUserId(userId);
  }
}

export const messageService = new MessageService();
