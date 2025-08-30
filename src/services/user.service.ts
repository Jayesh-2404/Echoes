import { userRepository } from '@/src/repositories/user.repository';

class UserService {
  public async createUser(data: { name: string; avatarUrl?: string }) {
    return userRepository.create(data);
  }

  public async getUserPublicProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      return null;
    }
    return {
      name: user.name,
      avatarUrl: user.avatarUrl,
    };
  }
}

export const userService = new UserService();
