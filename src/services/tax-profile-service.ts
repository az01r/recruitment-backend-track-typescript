import prisma from "../utils/prisma.js";
import { Prisma } from "../generated/prisma/client.js";

class TaxProfileService {
  async findTaxProfilesByUserId(userId: string) {
    const taxProfiles = await prisma.taxProfile.findMany({
      where: {
        userId
      }
    });
    return taxProfiles;
  }

  async findTaxProfileByIdAndUserId(userId: string, taxProfileId: string) {
    const taxProfile = await prisma.taxProfile.findUnique({
      where: {
        id: taxProfileId,
        userId
      }
    });
    return taxProfile;
  }

  async createTaxProfile(userId: string, data: Prisma.TaxProfileCreateWithoutUserInput) {
    return await prisma.taxProfile.create({
      data: {
        ...data,
        userId
      }
    });
  }

  async updateTaxProfile(userId: string, taxProfileId: string, data: Prisma.TaxProfileUpdateWithoutUserInput) {
    return await prisma.taxProfile.update({
      where: {
        id: taxProfileId,
        userId
      },
      data
    });
  }

  async deleteTaxProfile(userId: string, taxProfileId: string) {
    return await prisma.taxProfile.delete({
      where: {
        id: taxProfileId,
        userId
      }
    });
  }
}

export default new TaxProfileService();
