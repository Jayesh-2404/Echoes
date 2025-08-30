import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { standardRateLimiter, suspiciousRateLimiter } from '@/src/utils/rate-limiter';
import { sendMessageSchema } from '@/src/schemas/message.schema';
import { messageService } from '@/src/services/message.service';

// FILE: app/api/send-message/route.ts
// ... imports remain the same ...

export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';

  try {
    // Rate limiting logic remains the same
    const isSuspicious = await messageService.isIpSuspicious(ip);
    const limiter = isSuspicious ? suspiciousRateLimiter : standardRateLimiter;
    await limiter.consume(ip);

    // Validation logic remains the same
    const body = await request.json();
    const payload = sendMessageSchema.parse(body);

    // Service call remains the same, but payload now expects userId
    const message = await messageService.processNewMessage(payload, ip);

    return NextResponse.json({ success: true, messageId: message.id }, { status: 201 });

  } catch (error: any) {
    // Error handling remains the same
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
