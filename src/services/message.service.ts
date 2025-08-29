import { messageRepository } from '@/src/repositories/message.repository';
import { SendMessageInput } from '@/src/schemas/message.schema';
import { redis } from '@/src/lib/redis';

const SUSPICIOUS_IP_SET = 'suspicious-ips';

class MessageService {
  private isSpamContent(message: string): boolean {
    const spamKeywords = ['http', 'www', '.com', 'free', 'discount', 'prize', 'gift', 'crypto', 'nft'];
    const lowerCaseMessage = message.toLowerCase();
    // A simple heuristic: if the message contains more than one spam keyword, flag it.
    const spamWordCount = spamKeywords.filter(keyword => lowerCaseMessage.includes(keyword)).length;
    return spamWordCount > 1;
  }

  public async isIpSuspicious(ip: string): Promise<boolean> {
    // Check if the IP exists in our Redis set of suspicious IPs.
    return (await redis.sismember(SUSPICIOUS_IP_SET, ip)) === 1;
  }

  public async processNewMessage(input: SendMessageInput, ip: string) {
    // If our analysis determines the content is spammy, we don't reject the message.
    // Instead, we log the IP as suspicious, ensuring future requests from this IP
    // will be subject to the stricter rate limit.
    if (this.isSpamContent(input.message)) {
      await redis.sadd(SUSPICIOUS_IP_SET, ip);
    }

    // The message is always created, but the sender's reputation is updated based on content.
    const message = await messageRepository.create({ ...input, ipAddress: ip });
    return message;
  }

  public async getMessagesForRecipient(recipientId: string) {
    return messageRepository.findByRecipientId(recipientId);
  }
}

export const messageService = new MessageService();
