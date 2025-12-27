import type { Request, Response, NextFunction } from "express";
import { Prisma } from "../generated/prisma/client.js";
import TaxProfileService from "../services/tax-profile-service.js";
import { TAX_PROFILE_DELETED, TAX_PROFILE_NOT_FOUND } from "../utils/constants.js";
import { getValidatedWhereDateTimeFilter } from "../utils/dates.js";

class TaxProfileController {

  createTaxProfile = async (req: Request, res: Response, _next: NextFunction) => {
    const { legalName, vatNumber, address, city, zipCode, country } = req.body;
    const taxProfileData: Prisma.TaxProfileCreateInput = { legalName, vatNumber, address, city, zipCode, country, user: { connect: { id: req.userId! } } };
    const taxProfile = await TaxProfileService.createTaxProfile(taxProfileData);
    res.status(201).json({ taxProfile });
  }

  getTaxProfiles = async (req: Request, res: Response, _next: NextFunction) => {
    const { legalName, vatNumber, city, country, zipCode, gteCreatedAt, lteCreatedAt, gteUpdatedAt, lteUpdatedAt, skip, take } = req.query;

    const where: Prisma.TaxProfileWhereInput = {};

    where.userId = { equals: req.userId! };
    if (legalName) where.legalName = { contains: String(legalName) };
    if (vatNumber) where.vatNumber = { contains: String(vatNumber) };
    if (city) where.city = { contains: String(city) };
    if (country) where.country = { contains: String(country) };
    if (zipCode) where.zipCode = { contains: String(zipCode) };
    where.createdAt = getValidatedWhereDateTimeFilter(gteCreatedAt, lteCreatedAt);
    where.updatedAt = getValidatedWhereDateTimeFilter(gteUpdatedAt, lteUpdatedAt);

    const taxProfiles = await TaxProfileService.findTaxProfiles(where, skip ? Number(skip) : undefined, take ? Number(take) : undefined);
    res.status(200).json({ taxProfiles });
  }

  getTaxProfile = async (req: Request, res: Response, _next: NextFunction) => {
    const where: Prisma.TaxProfileWhereUniqueInput = { id: req.params.id, userId: req.userId! };
    const taxProfile = await TaxProfileService.findTaxProfile(where);
    if (!taxProfile) {
      res.status(404);
      throw new Error(TAX_PROFILE_NOT_FOUND);
    }
    res.status(200).json({ taxProfile });
  }

  updateTaxProfile = async (req: Request, res: Response, _next: NextFunction) => {
    const { legalName, vatNumber, address, city, zipCode, country } = req.body;
    const data: Prisma.TaxProfileUpdateWithoutUserInput = { legalName, vatNumber, address, city, zipCode, country };
    const where: Prisma.TaxProfileWhereUniqueInput = { id: req.params.id, userId: req.userId! };
    const taxProfile = await TaxProfileService.updateTaxProfile(where, data);
    res.status(200).json({ taxProfile });
  }

  deleteTaxProfile = async (req: Request, res: Response, _next: NextFunction) => {
    const where: Prisma.TaxProfileWhereUniqueInput = { id: req.params.id, userId: req.userId! };
    await TaxProfileService.deleteTaxProfile(where);
    res.status(200).json({ message: TAX_PROFILE_DELETED });
  }
}

export default new TaxProfileController();