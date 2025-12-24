import { Prisma, PrismaClient } from "../generated/prisma/client.js";
import ReqValidationError from "../types/request-validation-error.js";
import { TAX_PROFILE_NOT_FOUND } from "../utils/constants.js";
import prismaClientSingleton from "../utils/prisma.js";

class TaxProfileService {
  private prismaClient: PrismaClient;

  constructor(prismaClient: PrismaClient = prismaClientSingleton) {
    this.prismaClient = prismaClient;
  }

  createTaxProfile = async (data: Prisma.TaxProfileCreateInput) => {
    return await this.prismaClient.taxProfile.create({ data });
  }

  findTaxProfiles = async (where: Prisma.TaxProfileWhereInput, skip?: number, take?: number) => {
    return await this.prismaClient.taxProfile.findMany({
      skip: skip || 0,
      take: take || 10,
      where,
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  findTaxProfile = async (where: Prisma.TaxProfileWhereUniqueInput) => {
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
    const taxProfile = await this.findTaxProfile(where);
    if (!taxProfile) {
      throw new ReqValidationError({ message: TAX_PROFILE_NOT_FOUND, statusCode: 404 });
    }
  }
}

export default new TaxProfileService();
export { TaxProfileService };