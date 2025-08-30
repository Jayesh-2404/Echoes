import { NextResponse } from 'next/server';
import { z } from 'zod';
import { userService } from '@/src/services/user.service';

const createUserSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').max(50),
  avatarUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = createUserSchema.parse(body);

    const user = await userService.createUser(payload);
    return NextResponse.json({ userId: user.id, secretToken: user.secretToken }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
