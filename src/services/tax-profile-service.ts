import { Prisma, PrismaClient } from "../generated/prisma/client.js";
import prismaClientSingleton from "../utils/prisma.js";

class TaxProfileService {
  private prismaClient: PrismaClient;

  constructor(prismaClient: PrismaClient = prismaClientSingleton) {
    this.prismaClient = prismaClient;
  }

  createTaxProfile = async (userId: string, data: Prisma.TaxProfileCreateWithoutUserInput) => {
    return await this.prismaClient.taxProfile.create({
      data: {
        ...data,
        userId
      }
    });
  }

  findTaxProfilesByUserId = async (userId: string, skip: number, take: number) => {
    const taxProfiles = await this.prismaClient.taxProfile.findMany({
      skip,
      take,
      where: {
        userId
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    return taxProfiles;
  }

  findTaxProfileByIdAndUserId = async (userId: string, taxProfileId: string) => {
    const taxProfile = await this.prismaClient.taxProfile.findUnique({
      where: {
        id: taxProfileId,
        userId
      }
    });
    return taxProfile;
  }

  updateTaxProfile = async (userId: string, taxProfileId: string, data: Prisma.TaxProfileUpdateWithoutUserInput) => {
    return await this.prismaClient.taxProfile.update({
      where: {
        id: taxProfileId,
        userId
      },
      data
    });
  }

  deleteTaxProfile = async (userId: string, taxProfileId: string) => {
    return await this.prismaClient.taxProfile.delete({
      where: {
        id: taxProfileId,
        userId
      }
    });
  }
}

export default new TaxProfileService();
export { TaxProfileService };