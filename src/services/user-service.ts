import prismaClientSingleton from "../utils/prisma.js";
import { Prisma, PrismaClient } from "../generated/prisma/client.js";

class UserService {
  private prismaClient: PrismaClient;

  constructor(prismaClient: PrismaClient = prismaClientSingleton) {
    this.prismaClient = prismaClient;
  }

  createUser = async (data: Prisma.UserCreateInput) => {
    return await this.prismaClient.user.create({ data });
  }

  findUser = async (where: Prisma.UserWhereUniqueInput) => {
    return await this.prismaClient.user.findUnique({ where });
  }

  updateUser = async (where: Prisma.UserWhereUniqueInput, data: Prisma.UserUpdateInput) => {
    return await this.prismaClient.user.update({ where, data });
  }

  deleteUser = async (where: Prisma.UserWhereUniqueInput) => {
    return await this.prismaClient.user.delete({ where });
  }
}

export default new UserService();
export { UserService };