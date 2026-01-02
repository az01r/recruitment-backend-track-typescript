import type { Request, Response, NextFunction } from "express";
import TaxProfileService from "../services/tax-profile-service.js";
import { TAX_PROFILE_DELETED } from "../utils/constants.js";
import { CreateTaxProfileDTO, ReadTaxProfileOptionsDto, ReadUniqueTaxProfileDto, UpdateTaxProfileDto } from "../types/tax-profile-dto.js";

class TaxProfileController {

  createTaxProfile = async (req: Request, res: Response, _next: NextFunction) => {
    const { legalName, vatNumber, address, city, zipCode, country } = req.body;
    const taxProfileDto: CreateTaxProfileDTO = { userId: req.userId!, legalName, vatNumber, address, city, zipCode, country };
    const taxProfile = await TaxProfileService.createTaxProfile(taxProfileDto);
    res.status(201).json({ taxProfile });
  }

  getTaxProfiles = async (req: Request, res: Response, _next: NextFunction) => {
    const { legalName, vatNumber, address, city, country, zipCode, gteCreatedAt, lteCreatedAt, gteUpdatedAt, lteUpdatedAt, skip, take } = req.query;

    const taxProfileDto: ReadTaxProfileOptionsDto = { userId: req.userId! };

    if (legalName) taxProfileDto.legalName = String(legalName);
    if (vatNumber) taxProfileDto.vatNumber = String(vatNumber);
    if (address) taxProfileDto.address = String(address);
    if (city) taxProfileDto.city = String(city);
    if (country) taxProfileDto.country = String(country);
    if (zipCode) taxProfileDto.zipCode = String(zipCode);
    if (gteCreatedAt) taxProfileDto.gteCreatedAt = String(gteCreatedAt);
    if (lteCreatedAt) taxProfileDto.lteCreatedAt = String(lteCreatedAt);
    if (gteUpdatedAt) taxProfileDto.gteUpdatedAt = String(gteUpdatedAt);
    if (lteUpdatedAt) taxProfileDto.lteUpdatedAt = String(lteUpdatedAt);
    if (skip) taxProfileDto.skip = Number(skip);
    if (take) taxProfileDto.take = Number(take);

    const taxProfiles = await TaxProfileService.findTaxProfiles(taxProfileDto);
    res.status(200).json({ taxProfiles });
  }

  getTaxProfile = async (req: Request, res: Response, _next: NextFunction) => {
    const taxProfileDto: ReadUniqueTaxProfileDto = { id: req.params.id, userId: req.userId! };
    const taxProfile = await TaxProfileService.findTaxProfile(taxProfileDto);
    res.status(200).json({ taxProfile });
  }

  updateTaxProfile = async (req: Request, res: Response, _next: NextFunction) => {
    const { legalName, vatNumber, address, city, zipCode, country } = req.body;
    const taxProfileDto: UpdateTaxProfileDto = { id: req.params.id, userId: req.userId!, legalName, vatNumber, address, city, zipCode, country };
    const taxProfile = await TaxProfileService.updateTaxProfile(taxProfileDto);
    res.status(200).json({ taxProfile });
  }

  deleteTaxProfile = async (req: Request, res: Response, _next: NextFunction) => {
    const taxProfileDto: ReadUniqueTaxProfileDto = { id: req.params.id, userId: req.userId! };
    await TaxProfileService.deleteTaxProfile(taxProfileDto);
    res.status(200).json({ message: TAX_PROFILE_DELETED });
  }
}

export default new TaxProfileController();