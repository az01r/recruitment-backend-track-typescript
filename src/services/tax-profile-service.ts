import TaxProfileDAO from "../daos/tax-profile-dao.js";
import { Prisma } from "../generated/prisma/client.js";
import { ResourceNotFoundError } from "../types/error.js";
import { CreateTaxProfileDTO, ReadUniqueTaxProfileDto, ReadTaxProfileOptionsDto, UpdateTaxProfileDto, TaxProfileResponseDTO } from "../types/tax-profile-dto.js";
import { DEFAULT_SKIP, DEFAULT_TAKE, TAX_PROFILE_NOT_FOUND } from "../utils/constants.js";

class TaxProfileService {

  createTaxProfile = async (taxProfileDto: CreateTaxProfileDTO) => {
    const taxProfileData: Prisma.TaxProfileCreateInput = {
      user: { connect: { id: taxProfileDto.userId } },
      legalName: taxProfileDto.legalName,
      vatNumber: taxProfileDto.vatNumber,
      address: taxProfileDto.address,
      city: taxProfileDto.city,
      zipCode: taxProfileDto.zipCode,
      country: taxProfileDto.country,
    };
    const taxProfile = await TaxProfileDAO.createTaxProfile(taxProfileData);
    const taxProfileResponseDTO: TaxProfileResponseDTO = {
      id: taxProfile.id,
      userId: taxProfile.userId,
      legalName: taxProfile.legalName,
      vatNumber: taxProfile.vatNumber,
      address: taxProfile.address,
      city: taxProfile.city,
      zipCode: taxProfile.zipCode,
      country: taxProfile.country,
      createdAt: taxProfile.createdAt.toISOString(),
      updatedAt: taxProfile.updatedAt.toISOString()
    };
    return taxProfileResponseDTO;
  }

  findTaxProfiles = async (taxProfileDto: ReadTaxProfileOptionsDto) => {
    const where: Prisma.TaxProfileWhereInput = {
      userId: taxProfileDto.userId,
      legalName: taxProfileDto.legalName ? { contains: taxProfileDto.legalName } : undefined,
      vatNumber: taxProfileDto.vatNumber ? { contains: taxProfileDto.vatNumber } : undefined,
      address: taxProfileDto.address ? { contains: taxProfileDto.address } : undefined,
      city: taxProfileDto.city ? { contains: taxProfileDto.city } : undefined,
      country: taxProfileDto.country ? { contains: taxProfileDto.country } : undefined,
      zipCode: taxProfileDto.zipCode ? { contains: taxProfileDto.zipCode } : undefined,
    };

    let createdAtWhere: Prisma.DateTimeFilter<"TaxProfile"> = {};
    if (taxProfileDto.gteCreatedAt) {
      createdAtWhere.gte = taxProfileDto.gteCreatedAt;
    }
    if (taxProfileDto.lteCreatedAt) {
      createdAtWhere.lte = taxProfileDto.lteCreatedAt;
    }
    if (taxProfileDto.gteCreatedAt || taxProfileDto.lteCreatedAt) {
      where.createdAt = createdAtWhere;
    }

    let updatedAtWhere: Prisma.DateTimeFilter<"TaxProfile"> = {};
    if (taxProfileDto.gteUpdatedAt) {
      updatedAtWhere.gte = taxProfileDto.gteUpdatedAt;
    }
    if (taxProfileDto.lteUpdatedAt) {
      updatedAtWhere.lte = taxProfileDto.lteUpdatedAt;
    }
    if (taxProfileDto.gteUpdatedAt || taxProfileDto.lteUpdatedAt) {
      where.updatedAt = updatedAtWhere;
    }

    const taxProfiles = await TaxProfileDAO.findTaxProfiles(where, taxProfileDto.skip || DEFAULT_SKIP, taxProfileDto.take || DEFAULT_TAKE);
    const taxProfilesResponseDTO: TaxProfileResponseDTO[] = taxProfiles.map(taxProfile => ({
      id: taxProfile.id,
      userId: taxProfile.userId,
      legalName: taxProfile.legalName,
      vatNumber: taxProfile.vatNumber,
      address: taxProfile.address,
      city: taxProfile.city,
      zipCode: taxProfile.zipCode,
      country: taxProfile.country,
      createdAt: taxProfile.createdAt.toISOString(),
      updatedAt: taxProfile.updatedAt.toISOString()
    }));
    return taxProfilesResponseDTO;
  }

  findTaxProfile = async ({ id, userId }: ReadUniqueTaxProfileDto) => {
    const where: Prisma.TaxProfileWhereUniqueInput = { id, userId };
    const taxProfile = await TaxProfileDAO.findTaxProfile(where);
    if (!taxProfile) {
      throw new ResourceNotFoundError(TAX_PROFILE_NOT_FOUND);
    }
    const taxProfileResponseDTO: TaxProfileResponseDTO = {
      id: taxProfile.id,
      userId: taxProfile.userId,
      legalName: taxProfile.legalName,
      vatNumber: taxProfile.vatNumber,
      address: taxProfile.address,
      city: taxProfile.city,
      zipCode: taxProfile.zipCode,
      country: taxProfile.country,
      createdAt: taxProfile.createdAt.toISOString(),
      updatedAt: taxProfile.updatedAt.toISOString()
    };
    return taxProfileResponseDTO;
  }

  updateTaxProfile = async (taxProfileDto: UpdateTaxProfileDto) => {
    await this.findTaxProfile(taxProfileDto);
    const where: Prisma.TaxProfileWhereUniqueInput = { id: taxProfileDto.id, userId: taxProfileDto.userId };
    const dataToUpdate: Prisma.TaxProfileUpdateWithoutUserInput = { legalName: taxProfileDto.legalName, vatNumber: taxProfileDto.vatNumber, address: taxProfileDto.address, city: taxProfileDto.city, zipCode: taxProfileDto.zipCode, country: taxProfileDto.country };
    const taxProfile = await TaxProfileDAO.updateTaxProfile(where, dataToUpdate);
    const taxProfileResponseDTO: TaxProfileResponseDTO = {
      id: taxProfile.id,
      userId: taxProfile.userId,
      legalName: taxProfile.legalName,
      vatNumber: taxProfile.vatNumber,
      address: taxProfile.address,
      city: taxProfile.city,
      zipCode: taxProfile.zipCode,
      country: taxProfile.country,
      createdAt: taxProfile.createdAt.toISOString(),
      updatedAt: taxProfile.updatedAt.toISOString()
    };
    return taxProfileResponseDTO;
  }

  deleteTaxProfile = async (taxProfileDto: ReadUniqueTaxProfileDto) => {
    await this.findTaxProfile(taxProfileDto);
    const where: Prisma.TaxProfileWhereUniqueInput = { id: taxProfileDto.id, userId: taxProfileDto.userId };
    await TaxProfileDAO.deleteTaxProfile(where);
  }
}

export default new TaxProfileService();