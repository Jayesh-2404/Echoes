import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { messageService } from '@/src/services/message.service';
import { cookies } from 'next/headers';

const getMessagesSchema = z.object({
  userId: z.string().cuid(),
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const token = cookies().get('auth_token')?.value;


    if (!userId || !token) {

        throw new Error('Unauthorized');
    }

    const query = getMessagesSchema.parse({ userId });

    const messages = await messageService.getMessagesForUser(query.userId, token);

    return NextResponse.json(messages);

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      console.warn(`[API /messages] Unauthorized access denied.`);
      return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }

    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
