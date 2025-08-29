import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { standardRateLimiter, suspiciousRateLimiter } from '@/src/utils/rate-limiter';
import { sendMessageSchema } from '@/src/schemas/message.schema';
import { messageService } from '@/src/services/message.service';

export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';

  try {
    // Step 1: Determine which rate limiter to apply based on IP reputation.
    const isSuspicious = await messageService.isIpSuspicious(ip);
    const limiter = isSuspicious ? suspiciousRateLimiter : standardRateLimiter;

    // Apply the chosen rate limiter.
    await limiter.consume(ip);

    // Step 2: Validate the request body.
    const body = await request.json();
    const payload = sendMessageSchema.parse(body);

    // Step 3: Process the message. The service will handle content analysis
    // and flag the IP if necessary.
    const message = await messageService.processNewMessage(payload, ip);

    return NextResponse.json({ success: true, messageId: message.id }, { status: 201 });

  } catch (error: any) {
    // Step 4: Handle known errors gracefully.
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
