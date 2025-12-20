import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import "dotenv/config";
import UserService from "../services/user-service.js";
import { jwtSign } from "../utils/jwt-sign.js";

class UserController {

  signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await UserService.createUser({ email, password: hashedPassword });
      const token = jwtSign(user.id);
      res.status(201).json({ message: "Signed up.", jwt: token });
    } catch (error) {
      next(error);
    }
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    try {
      const user = await UserService.findUserByEmail(email);
      if (!user) {
        res.status(404);
        throw new Error("E-Mail not registered yet.");
      }
      const isEqual = await bcrypt.compare(password, user.password!);
      if (!isEqual) {
        res.status(401);
        throw new Error("Password is incorrect.");
      }
      const token = jwtSign(user.id);
      res.status(200).json({ message: "Logged in.", jwt: token });
    } catch (error) {
      next(error);
    }
  }

  getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await UserService.findUserById(req.userId!);
      if (!user) {
        res.status(404);
        throw new Error("User not found.");
      }
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName, birthDate } = req.body;
      const user = await UserService.updateUser(req.userId!, {
        email,
        password,
        firstName,
        lastName,
        birthDate: birthDate ? new Date(birthDate) : undefined
      });
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await UserService.deleteUser(req.userId!);
      if (!user) {
        res.status(404);
        throw new Error("User not found.");
      }
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();