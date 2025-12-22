import prismaClientSingleton from "../utils/prisma.js";
import { Prisma, PrismaClient } from "../generated/prisma/client.js";

class UserService {
  private prismaClient: PrismaClient;

  constructor(prismaClient: PrismaClient = prismaClientSingleton) {
    this.prismaClient = prismaClient;
  }

  createUser = async (userData: Prisma.UserCreateInput) => {
    return await this.prismaClient.user.create({
      data: userData
    });
  }

  findUserByEmail = async (email: string) => {
    return await this.prismaClient.user.findUnique({
      where: {
        email: email
      }
    });
  }

  findUserById = async (id: string) => {
    return await this.prismaClient.user.findUnique({
      where: {
        id
      }
    });
  }

  updateUser = async (id: string, userData: Prisma.UserUpdateInput) => {
    return await this.prismaClient.user.update({
      where: {
        id
      },
      data: userData
    });
  }

  deleteUser = async (id: string) => {
    return await this.prismaClient.user.delete({
      where: {
        id
      }
    });
  }
}

export default new UserService();
export { UserService };