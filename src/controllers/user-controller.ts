import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import "dotenv/config";
import UserService from "../services/user-service.js";
import jwt from "jsonwebtoken";
import { Prisma } from "../generated/prisma/client.js";
import { SIGNED_UP, USER_DELETED, USER_NOT_FOUND, WRONG_PASSWORD } from "../utils/constants.js";

class UserController {
  private jwtSign = (userId: string) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, {
      expiresIn: (process.env.JWT_DURATION || "4h") as jwt.SignOptions["expiresIn"],
    });
  };

  signup = async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password } = req.body;
    const where: Prisma.UserWhereUniqueInput = { email };
    const hashedPassword = await bcrypt.hash(password, 12);
    const existingUser = await UserService.findUser(where);
    if (existingUser) {
      res.status(409);
      throw new Error("User already registered.");
    }
    const user = await UserService.createUser({ email, password: hashedPassword });
    const token = this.jwtSign(user.id);
    res.status(201).json({ message: SIGNED_UP, jwt: token });
  }

  login = async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password } = req.body;
    const where: Prisma.UserWhereUniqueInput = { email };
    const user = await UserService.findUser(where);
    if (!user) {
      res.status(404);
      throw new Error("E-Mail not registered yet.");
    }
    const isEqual = await bcrypt.compare(password, user.password!);
    if (!isEqual) {
      res.status(401);
      throw new Error(WRONG_PASSWORD);
    }
    const token = this.jwtSign(user.id);
    res.status(200).json({ message: "Logged in.", jwt: token });
  }

  getUser = async (req: Request, res: Response, _next: NextFunction) => {
    const where: Prisma.UserWhereUniqueInput = { id: req.userId! };
    const user = await UserService.findUser(where);
    if (!user) {
      res.status(404);
      throw new Error(USER_NOT_FOUND);
    }
    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  }

  updateUser = async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password, firstName, lastName, birthDate } = req.body;
    let hashedPassword: string | undefined = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }
    const data: Prisma.UserUpdateInput = { email, password: hashedPassword, firstName, lastName, birthDate: birthDate ? new Date(birthDate) : undefined };
    const where: Prisma.UserWhereUniqueInput = { id: req.userId! };
    const user = await UserService.updateUser(where, data);
    if (!user) {
      res.status(404);
      throw new Error(USER_NOT_FOUND);
    }
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  }

  deleteUser = async (req: Request, res: Response, _next: NextFunction) => {
    const where: Prisma.UserWhereUniqueInput = { id: req.userId! };
    const user = await UserService.deleteUser(where);
    if (!user) {
      res.status(404);
      throw new Error(USER_NOT_FOUND);
    }
    res.status(200).json({ message: USER_DELETED });
  }
}

export default new UserController();