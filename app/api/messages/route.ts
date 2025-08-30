import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { messageService } from '@/src/services/message.service';

const getMessagesSchema = z.object({
  userId: z.string().cuid(),
  token: z.string().cuid(),
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const token = request.nextUrl.searchParams.get('token');

    const query = getMessagesSchema.parse({ userId, token });

    const messages = await messageService.getMessagesForUser(query.userId, query.token);

    return NextResponse.json(messages);

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid or missing parameters' }, { status: 400 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
