import type { Request, Response, NextFunction } from "express";
import InvoiceService from "../services/invoice-service.js";
import { Currency, InvoiceStatus, Prisma } from "../generated/prisma/client.js";
import { INVOICE_DELETED, INVOICE_NOT_FOUND } from "../utils/constants.js";
import { getValidatedWhereDateTimeFilter } from "../utils/dates.js";

class InvoiceController {

  createInvoice = async (req: Request, res: Response, _next: NextFunction) => {
    const { taxProfileId, amount, status, currency } = req.body;
    const data: Prisma.InvoiceCreateInput = { amount, status, currency, taxProfile: { connect: { id: taxProfileId, userId: req.userId! } } };
    const invoice = await InvoiceService.createInvoice(data);
    res.status(201).json({ invoice });
  }

  getInvoices = async (req: Request, res: Response, _next: NextFunction) => {
    const { taxProfileId, skip, take, status, currency, gteCreatedAt, lteCreatedAt, gteUpdatedAt, lteUpdatedAt } = req.query;
    const where: Prisma.InvoiceWhereInput = {};

    where.taxProfile = {
      userId: req.userId!
    };
    if (taxProfileId) where.taxProfileId = String(taxProfileId);
    if (status) where.status = status as InvoiceStatus;
    if (currency) where.currency = currency as Currency;
    where.createdAt = getValidatedWhereDateTimeFilter(gteCreatedAt, lteCreatedAt);
    where.updatedAt = getValidatedWhereDateTimeFilter(gteUpdatedAt, lteUpdatedAt);

    const invoices = await InvoiceService.findInvoices(where, skip ? Number(skip) : undefined, take ? Number(take) : undefined);
    res.status(200).json({ invoices });
  }

  getInvoice = async (req: Request, res: Response, _next: NextFunction) => {
    const where: Prisma.InvoiceWhereUniqueInput = { id: req.params.id, taxProfile: { userId: req.userId! } };
    const invoice = await InvoiceService.findInvoice(where);
    if (!invoice) {
      res.status(404);
      throw new Error(INVOICE_NOT_FOUND);
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
    res.status(200).json({ message: INVOICE_DELETED });
  }
}

export default new InvoiceController();