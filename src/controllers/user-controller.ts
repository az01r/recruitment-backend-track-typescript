import type { Request, Response, NextFunction } from "express";
import "dotenv/config";
import UserService from "../services/user-service.js";
import { UpdateUserDTO } from "../types/user-dto.js";
import { LOGGED_IN, SIGNED_UP, USER_DELETED } from "../utils/constants.js";

class UserController {

  signup = async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password } = req.body;
    const token = await UserService.signup({ email, password });
    res.status(201).json({ message: SIGNED_UP, jwt: token });
  }

  login = async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password } = req.body;
    const token = await UserService.login({ email, password });
    res.status(200).json({ message: LOGGED_IN, jwt: token });
  }

  getUser = async (req: Request, res: Response, _next: NextFunction) => {
    const user = await UserService.getUser(req.userId!);
    res.status(200).json({ user });
  }

  updateUser = async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password, firstName, lastName, birthDate } = req.body;
    const id = req.userId!;
    const userDto: UpdateUserDTO = { id, email, password, firstName, lastName, birthDate };
    const user = await UserService.updateUser(userDto);
    res.status(200).json({ user });
  }

  deleteUser = async (req: Request, res: Response, _next: NextFunction) => {
    await UserService.deleteUser(req.userId!);
    res.status(200).json({ message: USER_DELETED });
  }
}

export default new UserController();