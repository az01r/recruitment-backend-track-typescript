import type { Request, Response, NextFunction } from "express";
import InvoiceService from "../services/invoice-service.js";
import { INVOICE_DELETED } from "../utils/constants.js";
import { CreateInvoiceDto, CurrencyDto, InvoiceStatusDto, ReadInvoiceOptionsDto, ReadUniqueInvoiceDto, UpdateInvoiceDto } from "../types/invoice-dto.js";

class InvoiceController {

  createInvoice = async (req: Request, res: Response, _next: NextFunction) => {
    const { taxProfileId, amount, status, currency } = req.body;
    const invoiceDto: CreateInvoiceDto = { amount, status, currency, taxProfileId, userId: req.userId! };
    const invoice = await InvoiceService.createInvoice(invoiceDto);
    res.status(201).json({ invoice });
  }

  getInvoices = async (req: Request, res: Response, _next: NextFunction) => {
    const { taxProfileId, skip, take, status, currency, amount, gteCreatedAt, lteCreatedAt, gteUpdatedAt, lteUpdatedAt } = req.query;
    const invoiceDto: ReadInvoiceOptionsDto = { userId: req.userId! };

    if (taxProfileId) invoiceDto.taxProfileId = String(taxProfileId);
    if (amount) invoiceDto.amount = Number(amount);
    if (status) invoiceDto.status = status as InvoiceStatusDto;
    if (currency) invoiceDto.currency = currency as CurrencyDto;
    if (gteCreatedAt) invoiceDto.gteCreatedAt = gteCreatedAt as string;
    if (lteCreatedAt) invoiceDto.lteCreatedAt = lteCreatedAt as string;
    if (gteUpdatedAt) invoiceDto.gteUpdatedAt = gteUpdatedAt as string;
    if (lteUpdatedAt) invoiceDto.lteUpdatedAt = lteUpdatedAt as string;
    if (skip) invoiceDto.skip = Number(skip);
    if (take) invoiceDto.take = Number(take);

    const invoices = await InvoiceService.findInvoices(invoiceDto);
    res.status(200).json({ invoices });
  }

  getInvoice = async (req: Request, res: Response, _next: NextFunction) => {
    const invoiceDto: ReadUniqueInvoiceDto = { id: req.params.id, userId: req.userId! };
    const invoice = await InvoiceService.findInvoice(invoiceDto);
    res.status(200).json({ invoice });
  }

  updateInvoice = async (req: Request, res: Response, _next: NextFunction) => {
    const { amount, status, currency } = req.body;
    const invoiceDto: UpdateInvoiceDto = { id: req.params.id, userId: req.userId!, amount, status, currency };
    const invoice = await InvoiceService.updateInvoice(invoiceDto);
    res.status(200).json({ invoice });
  }

  deleteInvoice = async (req: Request, res: Response, _next: NextFunction) => {
    const invoiceDto: ReadUniqueInvoiceDto = { id: req.params.id, userId: req.userId! };
    await InvoiceService.deleteInvoice(invoiceDto);
    res.status(200).json({ message: INVOICE_DELETED });
  }
}

export default new InvoiceController();