import { Prisma, PrismaClient } from "../generated/prisma/client.js";
import prismaClientSingleton from "../utils/prisma.js";

class TaxProfileDAO {
  private prismaClient: PrismaClient;

  constructor(prismaClient: PrismaClient = prismaClientSingleton) {
    this.prismaClient = prismaClient;
  }

  createTaxProfile = async (data: Prisma.TaxProfileCreateInput) => {
    return await this.prismaClient.taxProfile.create({ data });
  }

  findTaxProfiles = async (where: Prisma.TaxProfileWhereInput, skip: number, take: number) => {
    return await this.prismaClient.taxProfile.findMany({
      skip,
      take,
      where,
      orderBy: {
        updatedAt: "desc"
      }
    });
  }

  findTaxProfile = async (where: Prisma.TaxProfileWhereUniqueInput) => {
    return await this.prismaClient.taxProfile.findUnique({ where });
  }

  updateTaxProfile = async (where: Prisma.TaxProfileWhereUniqueInput, data: Prisma.TaxProfileUpdateWithoutUserInput) => {
    return await this.prismaClient.taxProfile.update({ data, where });
  }

  deleteTaxProfile = async (where: Prisma.TaxProfileWhereUniqueInput) => {
    return await this.prismaClient.taxProfile.delete({ where });
  }
}

export default new TaxProfileDAO();
export { TaxProfileDAO };