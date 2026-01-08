import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UNAUTHORIZED } from "../utils/constants.js";
import { UnauthorizedError } from "../types/error.js";

export const isAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new UnauthorizedError(UNAUTHORIZED);
  }
  try {
    const decodedToken = jwt.verify(token!, process.env.JWT_SECRET!) as jwt.JwtPayload;
    req.userId = decodedToken.userId as string;
  } catch (e) {
    throw new UnauthorizedError(UNAUTHORIZED);
  }
  next();
}