import prisma from "../utils/prisma.js";
import { Prisma } from "../generated/prisma/client.js";
import ReqValidationError from "../types/req-validation-error.js";

class UserService {
  createUser = async (userData: Prisma.UserCreateInput) => {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: userData.email
      }
    });
    if (existingUser) {
      throw new ReqValidationError({ message: 'User already registered.', statusCode: 409 });
    }
    const createdUser = await prisma.user.create({
      data: userData
    });
    return createdUser;
  }

  findUserByEmail = async (email: string) => {
    const user = await prisma.user.findUnique({
      where: {
        email: email
      }
    });
    return user;
  }

  findUserById = async (id: string) => {
    const user = await prisma.user.findUnique({
      where: {
        id
      }
    });
    return user;
  }

  updateUser = async (id: string, userData: Prisma.UserUpdateInput) => {
    const user = await prisma.user.update({
      where: {
        id
      },
      data: userData
    });
    return user;
  }

  deleteUser = async (id: string) => {
    const user = await prisma.user.delete({
      where: {
        id
      }
    });
    return user;
  }
}

export default new UserService();
