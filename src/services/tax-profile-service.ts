import { Prisma, PrismaClient } from "../generated/prisma/client.js";
import ReqValidationError from "../types/request-validation-error.js";
import prismaClientSingleton from "../utils/prisma.js";

class TaxProfileService {
  private prismaClient: PrismaClient;

  constructor(prismaClient: PrismaClient = prismaClientSingleton) {
    this.prismaClient = prismaClient;
  }

  createTaxProfile = async (data: Prisma.TaxProfileCreateInput) => {
    return await this.prismaClient.taxProfile.create({ data });
  }

  findManyTaxProfiles = async (where: Prisma.TaxProfileWhereInput, skip?: number, take?: number) => {
    return await this.prismaClient.taxProfile.findMany({
      skip: skip || 0,
      take: take || 10,
      where,
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  findUniqueTaxProfile = async (where: Prisma.TaxProfileWhereUniqueInput) => {
    return await this.prismaClient.taxProfile.findUnique({ where });
  }

  updateTaxProfile = async (where: Prisma.TaxProfileWhereUniqueInput, data: Prisma.TaxProfileUpdateWithoutUserInput) => {
    await this.validateTaxProfileOwnership(where);

    return await this.prismaClient.taxProfile.update({ data, where });
  }

  deleteTaxProfile = async (where: Prisma.TaxProfileWhereUniqueInput) => {
    await this.validateTaxProfileOwnership(where);
    return await this.prismaClient.taxProfile.delete({ where });
  }

  private validateTaxProfileOwnership = async (where: Prisma.TaxProfileWhereUniqueInput) => {
    const taxProfile = await this.findUniqueTaxProfile(where);
    if (!taxProfile) {
      throw new ReqValidationError({ message: "Tax Profile not found or does not belong to user.", statusCode: 404 });
    }
  }
}

export default new TaxProfileService();
export { TaxProfileService };