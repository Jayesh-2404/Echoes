import { messageService } from '@/src/services/message.service';
import { userService } from '@/src/services/user.service';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const [userProfile, answeredMessages] = await Promise.all([
        userService.getUserPublicProfile(userId),
        messageService.getAnsweredMessagesForUser(userId)
    ]);


    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const publicData = {
        ...userProfile,
        answeredMessages,
    };

    return NextResponse.json(publicData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
