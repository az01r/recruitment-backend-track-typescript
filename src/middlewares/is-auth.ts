import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UNAUTHORIZED } from "../utils/constants.js";

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401);
    throw new Error(UNAUTHORIZED);
  }
  try {
    const decodedToken = jwt.verify(token!, process.env.JWT_SECRET!) as jwt.JwtPayload;
    req.userId = decodedToken.userId as string;
  } catch (e) {
    res.status(401);
    throw new Error(UNAUTHORIZED);
  }
  next();
}