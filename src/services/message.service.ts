import { redis } from '@/src/lib/redis';
import { messageRepository } from '@/src/repositories/message.repository';
import { userRepository } from '@/src/repositories/user.repository';
import { SendMessageInput } from '@/src/schemas/message.schema';


class MessageService {
  private isSpamContent(message: string): boolean {
    // Whitelist of legitimate domains that shouldn't be flagged
    const legitimateDomains = ['github.com', 'linkedin.com', 'twitter.com', 'x.com', 'instagram.com'];
    const spamKeywords = ['http', 'www', '.com', 'free', 'discount', 'prize', 'gift', 'crypto', 'nft', 'click here', 'limited time', 'act now'];

    const lowerCaseMessage = message.toLowerCase();

    // Check if message contains whitelisted domains
    const hasLegitDomain = legitimateDomains.some(domain => lowerCaseMessage.includes(domain));
    if (hasLegitDomain) {
      return false; // Don't flag messages with legitimate domains
    }

    // Count spam keywords - require 3+ to flag as spam (more conservative)
    const spamWordCount = spamKeywords.filter(keyword => lowerCaseMessage.includes(keyword)).length;
    return spamWordCount >= 3;
  }

  public async isIpSuspicious(ip: string): Promise<boolean> {
    try {
      return (await redis.sismember('suspicious-ips', ip)) === 1;
    } catch (error) {
      // In development, if Redis is not available, assume IP is not suspicious
      console.warn('Redis not available for IP checking:', error);
      return false;
    }
  }

  public async processNewMessage(input: SendMessageInput, ip: string) {
    // Only mark IP as suspicious after spam content is detected
    // This allows for false positives without permanently blocking users
    if (this.isSpamContent(input.message)) {
      try {
        // Increment spam count for this IP
        const spamCount = await redis.incr(`spam-count:${ip}`);
        await redis.expire(`spam-count:${ip}`, 86400); // 24 hour window

        // Only mark as suspicious after 3 spam attempts
        if (spamCount >= 3) {
          await redis.sadd('suspicious-ips', ip);
        }
      } catch (error) {
        console.warn('Redis not available for marking suspicious IP:', error);
      }
    }
    const message = await messageRepository.create({ ...input, ipAddress: ip });
    return message;
  }
  // Secured Method - Fetches all messages for the author dashboard
  public async getMessageForUser(userId: string, token?: string) {
    const user = await userRepository.findById(userId);
    if (!user || !token || user.secretToken !== token) {
      throw new Error('Unauthorized');
    }
    // This now fetches ALL messages for the author, not just answered ones.
    return messageRepository.findByUserId(userId);
  }
  // New public method
  public async getAnsweredMessagesForUser(userId: string) {
    const messages = await messageRepository.findAnsweredMessagesByUserId(userId); // We will rename this in the repo soon
    return messages.map(msg => ({
      id: msg.id, // Changed from msg.message to msg.id for a stable key
      message: msg.message,
      answer: msg.answer,
      answeredAt: msg.answerAt,
    }));
  }



  // SECURED METHOD - Corrected Signature
  // public async getMessagesForUser(userId: string, token?: string) {
  //   const user = await userRepository.findById(userId);
  //   if (!user || !token || user.secretToken !== token) {
  //     throw new Error('Unauthorized');
  //   }

  //   return messageRepository.findByUserId(userId);
  // }
  public async answerMessage(messageId: string, answer: string, token: string) {
    const message = await messageRepository.findById(messageId);
    if (!message) {
      throw new Error('Message not Found');
    }
    const user = await userRepository.findById(message.userId);
    if (!user || user.secretToken !== token) {
      throw new Error('Unauthorized');
    }
    return messageRepository.updateAnswer(messageId, answer);
  }

  public async markMessageAsRead(messageId: string, token: string) {
    const message = await messageRepository.findById(messageId);
    if (!message) {
      throw new Error('Message not Found');
    }

    // Validate that the user who owns the message is the one making the request
    const user = await userRepository.findById(message.userId);
    if (!user || user.secretToken !== token) {
      throw new Error('Unauthorized');
    }

    return messageRepository.markAsRead(messageId);
  }
}

export const messageService = new MessageService();
