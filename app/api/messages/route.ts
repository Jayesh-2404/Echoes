import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getMessagesSchema } from '@/src/schemas/message.schema';
import { messageService } from '@/src/services/message.service';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const query = getMessagesSchema.parse({ userId });

    const messages = await messageService.getMessagesForUser(query.userId);

    return NextResponse.json(messages);

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid or missing userId' }, { status: 400 });
    }
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
