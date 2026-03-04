import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { standardRateLimiter, suspiciousRateLimiter } from '@/src/utils/rate-limiter';
import { sendMessageSchema } from '@/src/schemas/message.schema';
import { messageService } from '@/src/services/message.service';
import { broadcastNewMessage } from '@/src/lib/broadcast';

export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';

  try {
    const isSuspicious = await messageService.isIpSuspicious(ip);
    const limiter = isSuspicious ? suspiciousRateLimiter : standardRateLimiter;
    await limiter.consume(ip);

    const body = await request.json();
    const payload = sendMessageSchema.parse(body);

    const message = await messageService.processNewMessage(payload, ip);

    broadcastNewMessage(payload.userId, message);

    return NextResponse.json({ success: true, messageId: message.id }, { status: 201 });

  } catch (error: any) {
    if (error.name === 'RateLimiterRes') {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }

    console.error('Unhandled error in /send-message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
