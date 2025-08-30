import { userRepository } from "../repositories/user.repository";

class UserService{
  public async createUser(){
    return userRepository.create();
  }
}
export const userService = new UserService();


