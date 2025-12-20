import type { NextFunction, Request, Response } from "express";

export default (req: Request, res: Response, next: NextFunction) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow all domains
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
}