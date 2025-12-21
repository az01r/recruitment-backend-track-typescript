import prismaClientSingleton from "../utils/prisma.js";
import { Prisma, PrismaClient } from "../generated/prisma/client.js";

class UserService {
  private prismaClient: PrismaClient;

  constructor(prismaClient: PrismaClient = prismaClientSingleton) {
    this.prismaClient = prismaClient;
  }

  createUser = async (userData: Prisma.UserCreateInput) => {
    const createdUser = await this.prismaClient.user.create({
      data: userData
    });
    return createdUser;
  }

  findUserByEmail = async (email: string) => {
    const user = await this.prismaClient.user.findUnique({
      where: {
        email: email
      }
    });
    return user;
  }

  findUserById = async (id: string) => {
    const user = await this.prismaClient.user.findUnique({
      where: {
        id
      }
    });
    return user;
  }

  updateUser = async (id: string, userData: Prisma.UserUpdateInput) => {
    const user = await this.prismaClient.user.update({
      where: {
        id
      },
      data: userData
    });
    return user;
  }

  deleteUser = async (id: string) => {
    const user = await this.prismaClient.user.delete({
      where: {
        id
      }
    });
    return user;
  }
}

export default new UserService();
export { UserService };
