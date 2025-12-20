import type { Request, Response, NextFunction } from "express";
import TaxProfileService from "../services/tax-profile-service.js";

class TaxProfileController {

  async getTaxProfiles(req: Request, res: Response, next: NextFunction) {
    try {
      const taxProfiles = await TaxProfileService.findTaxProfilesByUserId(req.userId!);
      res.status(200).json({ taxProfiles });
    } catch (error) {
      next(error);
    }
  }

  async getTaxProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const taxProfile = await TaxProfileService.findTaxProfileByIdAndUserId(req.userId!, req.params.id);
      if (!taxProfile) {
        res.status(404);
        throw new Error('Tax profile not found.');
      }
      res.status(200).json({ taxProfile });
    } catch (error) {
      next(error);
    }
  }

  async createTaxProfile(req: Request, res: Response, next: NextFunction) {
    const { legalName, vatNumber, address, city, zipCode, country } = req.body;
    try {
      const taxProfile = await TaxProfileService.createTaxProfile(req.userId!, {
        legalName,
        vatNumber,
        address,
        city,
        zipCode,
        country
      });
      res.status(201).json({ taxProfile });
    } catch (error) {
      next(error);
    }
  }

  async updateTaxProfile(req: Request, res: Response, next: NextFunction) {
    const { legalName, vatNumber, address, city, zipCode, country } = req.body;
    try {
      const taxProfile = await TaxProfileService.updateTaxProfile(req.userId!, req.params.id, {
        legalName,
        vatNumber,
        address,
        city,
        zipCode,
        country
      });
      res.status(200).json({ taxProfile });
    } catch (error) {
      next(error);
    }
  }

  async deleteTaxProfile(req: Request, res: Response, next: NextFunction) {
    try {
      await TaxProfileService.deleteTaxProfile(req.userId!, req.params.id);
      res.status(200).json({ message: 'Tax profile deleted.' });
    } catch (error) {
      next(error);
    }
  }
}

export default new TaxProfileController();