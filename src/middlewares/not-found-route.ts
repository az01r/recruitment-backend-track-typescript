import type { NextFunction, Request, Response } from "express";
import { NOT_FOUND } from "../utils/constants.js";

export default (_req: Request, res: Response, next: NextFunction) => {
  res.status(404);
  const error = new Error(NOT_FOUND);
  next(error);
};
