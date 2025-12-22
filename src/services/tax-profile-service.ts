import { Prisma, PrismaClient } from "../generated/prisma/client.js";
import ReqValidationError from "../types/req-validation-error.js";
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
    return await this.prismaClient.taxProfile.findMany({
      skip,
      take,
      where: {
        userId
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  findTaxProfileByIdAndUserId = async (userId: string, taxProfileId: string) => {
    return await this.prismaClient.taxProfile.findUnique({
      where: {
        id: taxProfileId,
        userId
      }
    });
  }

  updateTaxProfile = async (userId: string, taxProfileId: string, data: Prisma.TaxProfileUpdateWithoutUserInput) => {
    await this.validateTaxProfileOwnership(userId, taxProfileId);

    return await this.prismaClient.taxProfile.update({
      where: {
        id: taxProfileId
      },
      data
    });
  }

  deleteTaxProfile = async (userId: string, taxProfileId: string) => {
    await this.validateTaxProfileOwnership(userId, taxProfileId);
    return await this.prismaClient.taxProfile.delete({
      where: {
        id: taxProfileId
      }
    });
  }

  private validateTaxProfileOwnership = async (userId: string, taxProfileId: string) => {
    const taxProfile = await this.prismaClient.taxProfile.findUnique({
      where: {
        id: taxProfileId,
        userId
      }
    });

    if (!taxProfile) {
      throw new ReqValidationError({ message: "Tax Profile not found or does not belong to user.", statusCode: 404 });
    }
  }
}

export default new TaxProfileService();
export { TaxProfileService };