import type { Request, Response, NextFunction } from "express";
import InvoiceService from "../services/invoice-service.js";

class InvoiceController {

  getUserInvoices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taxProfileId = req.query.taxProfileId as string;
      let invoices;
      if (taxProfileId) {
        invoices = await InvoiceService.findInvoicesByUserIdAndTaxProfileId(req.userId!, taxProfileId);
      } else {
        invoices = await InvoiceService.findInvoicesByUserId(req.userId!);
      }
      res.status(200).json({ invoices });
    } catch (error) {
      next(error);
    }
  }

  getInvoice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invoice = await InvoiceService.findInvoiceByUserIdAndId(req.userId!, req.params.id);
      if (!invoice) {
        res.status(404);
        throw new Error('Invoice not found.');
      }
      res.status(200).json({ invoice });
    } catch (error) {
      next(error);
    }
  }

  createInvoice = async (req: Request, res: Response, next: NextFunction) => {
    const { taxProfileId, amount, status, currency } = req.body;
    try {
      const invoice = await InvoiceService.createInvoice(req.userId!, {
        taxProfileId,
        amount,
        status,
        currency
      });
      res.status(201).json({ invoice });
    } catch (error) {
      next(error);
    }
  }

  updateInvoice = async (req: Request, res: Response, next: NextFunction) => {
    const { amount, status, currency } = req.body;
    try {
      const invoice = await InvoiceService.updateInvoice(req.userId!, req.params.id, {
        amount,
        status,
        currency
      });
      res.status(200).json({ invoice });
    } catch (error) {
      next(error);
    }
  }

  deleteInvoice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await InvoiceService.deleteInvoice(req.userId!, req.params.id);
      res.status(200).json({ message: 'Invoice deleted.' });
    } catch (error) {
      next(error);
    }
  }
}

export default new InvoiceController();