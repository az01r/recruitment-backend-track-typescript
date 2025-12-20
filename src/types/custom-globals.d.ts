import "express";
import { PrismaClient } from "../generated/prisma/client.ts";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }

  var globalPrisma: PrismaClient | undefined;
}