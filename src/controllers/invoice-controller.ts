import type { Request, Response, NextFunction } from "express";
import InvoiceService from "../services/invoice-service.js";
import { Currency, InvoiceStatus, Prisma } from "../generated/prisma/client.js";

class InvoiceController {

  createInvoice = async (req: Request, res: Response, _next: NextFunction) => {
    const { taxProfileId, amount, status, currency } = req.body;
    const data: Prisma.InvoiceCreateInput = { amount, status, currency, taxProfile: { connect: { id: taxProfileId, userId: req.userId! } } };
    const invoice = await InvoiceService.createInvoice(data);
    res.status(201).json({ invoice });
  }

  getInvoices = async (req: Request, res: Response, _next: NextFunction) => {
    const { taxProfileId, skip, take, status, currency } = req.query;
    const where: Prisma.InvoiceWhereInput = {};

    where.taxProfile = {
      userId: req.userId!
    };
    if (taxProfileId) where.taxProfileId = String(taxProfileId);
    if (status) where.status = status as InvoiceStatus;
    if (currency) where.currency = currency as Currency;

    const invoices = await InvoiceService.findInvoices(where, Number(skip), Number(take));
    res.status(200).json({ invoices });
  }

  getInvoice = async (req: Request, res: Response, _next: NextFunction) => {
    const where: Prisma.InvoiceWhereUniqueInput = { id: req.params.id, taxProfile: { userId: req.userId! } };
    const invoice = await InvoiceService.findInvoice(where);
    if (!invoice) {
      res.status(404);
      throw new Error('Invoice not found.');
    }
    res.status(200).json({ invoice });
  }

  updateInvoice = async (req: Request, res: Response, _next: NextFunction) => {
    const { amount, status, currency } = req.body;
    const where: Prisma.InvoiceWhereUniqueInput = { id: req.params.id, taxProfile: { userId: req.userId! } };
    const data: Prisma.InvoiceUpdateWithoutTaxProfileInput = { amount, status, currency };
    const invoice = await InvoiceService.updateInvoice(where, data);
    res.status(200).json({ invoice });
  }

  deleteInvoice = async (req: Request, res: Response, _next: NextFunction) => {
    const where: Prisma.InvoiceWhereUniqueInput = { id: req.params.id, taxProfile: { userId: req.userId! } };
    await InvoiceService.deleteInvoice(where);
    res.status(200).json({ message: 'Invoice deleted.' });
  }
}

export default new InvoiceController();