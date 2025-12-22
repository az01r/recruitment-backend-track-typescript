import type { Request, Response, NextFunction } from "express";
import TaxProfileService from "../services/tax-profile-service.js";

class TaxProfileController {

  createTaxProfile = async (req: Request, res: Response, _next: NextFunction) => {
    const { legalName, vatNumber, address, city, zipCode, country } = req.body;
    const taxProfile = await TaxProfileService.createTaxProfile(req.userId!, {
      legalName,
      vatNumber,
      address,
      city,
      zipCode,
      country
    });
    res.status(201).json({ taxProfile });
  }

  getTaxProfiles = async (req: Request, res: Response, _next: NextFunction) => {
    const skip = Number(req.query.skip) || 0;
    const take = Number(req.query.take) || 2;
    const taxProfiles = await TaxProfileService.findTaxProfilesByUserId(req.userId!, skip, take);
    res.status(200).json({ taxProfiles });
  }

  getTaxProfile = async (req: Request, res: Response, _next: NextFunction) => {
    const taxProfile = await TaxProfileService.findTaxProfileByIdAndUserId(req.userId!, req.params.id);
    if (!taxProfile) {
      res.status(404);
      throw new Error('Tax profile not found.');
    }
    res.status(200).json({ taxProfile });
  }

  updateTaxProfile = async (req: Request, res: Response, _next: NextFunction) => {
    const { legalName, vatNumber, address, city, zipCode, country } = req.body;
    const taxProfile = await TaxProfileService.updateTaxProfile(req.userId!, req.params.id, {
      legalName,
      vatNumber,
      address,
      city,
      zipCode,
      country
    });
    res.status(200).json({ taxProfile });
  }

  deleteTaxProfile = async (req: Request, res: Response, _next: NextFunction) => {
    await TaxProfileService.deleteTaxProfile(req.userId!, req.params.id);
    res.status(200).json({ message: 'Tax profile deleted.' });
  }
}

export default new TaxProfileController();