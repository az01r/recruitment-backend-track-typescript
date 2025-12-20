import jwt from "jsonwebtoken";
import "dotenv/config";

export const jwtSign = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_DURATION || "4h") as jwt.SignOptions["expiresIn"],
  });
};