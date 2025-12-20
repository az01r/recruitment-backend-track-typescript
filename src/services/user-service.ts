import { CreateUserDto, UpdateUserDto } from "../types/dtos/user-dto.js";
import prisma from "../utils/prisma.js";

class UserService {
  async createUser(userData: CreateUserDto) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: userData.email
      }
    });
    if (existingUser) {
      throw new Error('An user with this email already exists.');
    }
    const createdUser = await prisma.user.create({
      data: {
        email: userData.email,
        password: userData.password,
      }
    });
    return createdUser;
  }

  async findByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: {
        email: email
      }
    });
    return user;
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id
      }
    });
    return user;
  }

  async updateUser(id: string, userData: UpdateUserDto) {
    const user = await prisma.user.update({
      where: {
        id
      },
      data: {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        birthDate: userData.birthDate,
      }
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
