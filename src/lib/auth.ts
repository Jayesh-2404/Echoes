import { cookies } from 'next/headers';
import { userRepository } from '@/src/repositories/user.repository';
import { ApiResponseError } from './api-response';

export interface AuthUser {
  id: string;
  name: string;
  secretToken: string;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const token = cookies().get('auth_token')?.value;
    if (!token) {
      return null;
    }

    const user = await userRepository.findByToken(token);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      secretToken: user.secretToken,
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new ApiResponseError('UNAUTHORIZED', 'Authentication required', null, 401);
  }
  return user;
}

export async function verifyOwnership(userId: string, token: string): Promise<boolean> {
  try {
    const user = await userRepository.findById(userId);
    return user?.secretToken === token;
  } catch {
    return false;
  }
}
