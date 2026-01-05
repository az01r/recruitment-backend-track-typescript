import { Prisma } from "../generated/prisma/client.js";
import UserDAO from "../daos/user-dao.js";
import { ConflictError, ResourceNotFoundError, UnauthorizedError } from "../types/error.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { INVALID_EMAIL_OR_PASSWORD, USER_ALREADY_REGISTERED, USER_NOT_FOUND } from "../utils/constants.js";
import { CreateUserDTO, LoginUserDTO, ResponseUserDTO, UpdateUserDTO } from "../types/user-dto.js";

class UserService {

  private jwtSign = (userId: string) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, {
      expiresIn: (process.env.JWT_DURATION || "4h") as jwt.SignOptions["expiresIn"],
    });
  };

  signup = async ({ email, password }: CreateUserDTO) => {
    const where: Prisma.UserWhereUniqueInput = { email };
    const existingUser = await UserDAO.findUser(where);
    if (existingUser) {
      throw new ConflictError(USER_ALREADY_REGISTERED);
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await UserDAO.createUser({ email, password: hashedPassword });
    const token = this.jwtSign(user.id);
    return token;
  }

  login = async ({ email, password }: LoginUserDTO) => {
    const where: Prisma.UserWhereUniqueInput = { email };
    const user = await UserDAO.findUser(where);
    if (!user) {
      throw new UnauthorizedError(INVALID_EMAIL_OR_PASSWORD);
    }
    const isEqual = await bcrypt.compare(password, user.password!);
    if (!isEqual) {
      throw new UnauthorizedError(INVALID_EMAIL_OR_PASSWORD);
    }
    const token = this.jwtSign(user.id);
    return token;
  }

  getUser = async (id: string) => {
    const where: Prisma.UserWhereUniqueInput = { id };
    const user = await UserDAO.findUser(where);
    if (!user) {
      throw new ResourceNotFoundError(USER_NOT_FOUND);
    }
    const result: ResponseUserDTO = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      birthDate: user.birthDate ? user.birthDate.toISOString() : null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
    return result;
  }

  updateUser = async (userDto: UpdateUserDTO) => {
    let hashedPassword: string | undefined = undefined;
    if (userDto.password) {
      hashedPassword = await bcrypt.hash(userDto.password, 12);
    }
    const data: Prisma.UserUpdateInput = { email: userDto.email, password: hashedPassword, firstName: userDto.firstName, lastName: userDto.lastName, birthDate: userDto.birthDate ? new Date(userDto.birthDate) : undefined };
    const where: Prisma.UserWhereUniqueInput = { id: userDto.id };
    const user = await UserDAO.updateUser(where, data);
    if (!user) {
      throw new ResourceNotFoundError(USER_NOT_FOUND);
    }
    const result: ResponseUserDTO = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      birthDate: user.birthDate ? user.birthDate.toISOString() : null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
    return result;
  }

  deleteUser = async (id: string) => {
    const where: Prisma.UserWhereUniqueInput = { id };
    const user = await UserDAO.deleteUser(where);
    if (!user) {
      throw new ResourceNotFoundError(USER_NOT_FOUND);
    }
  }
}

export default new UserService();