import jwt from "jsonwebtoken";
import "dotenv/config";

export const jwtSign = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });
};