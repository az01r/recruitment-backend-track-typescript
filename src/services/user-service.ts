import prisma from "../utils/prisma.js";
import { Prisma } from "../generated/prisma/client.js";

class UserService {
  async createUser(userData: Prisma.UserCreateInput) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: userData.email
      }
    });
    if (existingUser) {
      throw new Error('User already registered.');
    }
    const createdUser = await prisma.user.create({
      data: userData
    });
    return createdUser;
  }

  async findUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: {
        email: email
      }
    });
    return user;
  }

  async findUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id
      }
    });
    return user;
  }

  async updateUser(id: string, userData: Prisma.UserUpdateInput) {
    const user = await prisma.user.update({
      where: {
        id
      },
      data: userData
    });
    return user;
  }

  async deleteUser(id: string) {
    const user = await prisma.user.delete({
      where: {
        id
      }
    });
    return user;
  }
}

export default new UserService();
