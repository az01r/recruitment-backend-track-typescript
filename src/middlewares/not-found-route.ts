import type { NextFunction, Request, Response } from "express";

export default (_req: Request, res: Response, next: NextFunction) => {
  res.status(404);
  const error = new Error("Page Not Found");
  next(error);
};
