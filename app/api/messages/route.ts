import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getMessagesSchema } from '@/src/schemas/message.schema';
import { messageService } from '@/src/services/message.service';

export async function GET(request: NextRequest) {
  try {
    // Extract recipientId from query parameters
    const recipientId = request.nextUrl.searchParams.get('recipientId');
    // Validate the input using our Zod schema
    const query = getMessagesSchema.parse({ recipientId });

    const messages = await messageService.getMessagesForRecipient(query.recipientId);

    return NextResponse.json(messages);

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid or missing recipientId' }, { status: 400 });
    }
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
