import prisma from "./prisma.js";

export const checkDbConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection verified successfully');
  } catch (error) {
    console.error('Database connection failed', error);
    process.exit(1);
  }
}