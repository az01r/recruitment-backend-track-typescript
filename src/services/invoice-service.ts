import { Prisma } from "../generated/prisma/client.js";
import ReqValidationError from "../types/request-validation-error.js";
import { DEFAULT_SKIP, DEFAULT_TAKE, INVOICE_NOT_FOUND } from "../utils/constants.js";
import { CreateInvoiceDto, ReadInvoiceOptionsDto, ReadUniqueInvoiceDto, ResponseInvoiceDTO, UpdateInvoiceDto } from "../types/invoice-dto.js";
import InvoiceDAO from "../daos/invoice-dao.js";
import TaxProfileService from "./tax-profile-service.js";

class InvoiceService {

  createInvoice = async (invoiceDto: CreateInvoiceDto) => {
    await TaxProfileService.findTaxProfile({ id: invoiceDto.taxProfileId, userId: invoiceDto.userId });
    const prismaData: Prisma.InvoiceCreateInput = { amount: invoiceDto.amount, status: invoiceDto.status, currency: invoiceDto.currency, taxProfile: { connect: { id: invoiceDto.taxProfileId, userId: invoiceDto.userId } } };
    const invoice = await InvoiceDAO.createInvoice(prismaData);
    const invoiceResponseDto: ResponseInvoiceDTO = {
      id: invoice.id,
      taxProfileId: invoice.taxProfileId,
      amount: invoice.amount,
      status: invoice.status,
      currency: invoice.currency,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString()
    };
    return invoiceResponseDto;
  }

  findInvoices = async (invoicesDto: ReadInvoiceOptionsDto) => {
    const where: Prisma.InvoiceWhereInput = {
      taxProfile: {
        userId: invoicesDto.userId
      }
    };
    if (invoicesDto.taxProfileId) where.taxProfileId = invoicesDto.taxProfileId;
    if (invoicesDto.amount) where.amount = invoicesDto.amount;
    if (invoicesDto.status) where.status = invoicesDto.status;
    if (invoicesDto.currency) where.currency = invoicesDto.currency;

    let createdAtWhere: Prisma.DateTimeFilter<"Invoice"> = {};
    if (invoicesDto.gteCreatedAt) {
      createdAtWhere.gte = invoicesDto.gteCreatedAt;
    }
    if (invoicesDto.lteCreatedAt) {
      createdAtWhere.lte = invoicesDto.lteCreatedAt;
    }
    if (invoicesDto.gteCreatedAt || invoicesDto.lteCreatedAt) {
      where.createdAt = createdAtWhere;
    }

    let updatedAtWhere: Prisma.DateTimeFilter<"Invoice"> = {};
    if (invoicesDto.gteUpdatedAt) {
      updatedAtWhere.gte = invoicesDto.gteUpdatedAt;
    }
    if (invoicesDto.lteUpdatedAt) {
      updatedAtWhere.lte = invoicesDto.lteUpdatedAt;
    }
    if (invoicesDto.gteUpdatedAt || invoicesDto.lteUpdatedAt) {
      where.updatedAt = updatedAtWhere;
    }
    const invoices = await InvoiceDAO.findInvoices(where, invoicesDto.skip || DEFAULT_SKIP, invoicesDto.take || DEFAULT_TAKE);
    const invoicesResponseDTO: ResponseInvoiceDTO[] = invoices.map(invoice => ({
      id: invoice.id,
      taxProfileId: invoice.taxProfileId,
      amount: invoice.amount,
      status: invoice.status,
      currency: invoice.currency,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString()
    }));
    return invoicesResponseDTO;
  }

  findInvoice = async (invoiceDto: ReadUniqueInvoiceDto) => {
    const where: Prisma.InvoiceWhereUniqueInput = { id: invoiceDto.id, taxProfile: { userId: invoiceDto.userId } };
    const invoice = await InvoiceDAO.findInvoice(where);
    if (!invoice) {
      throw new ReqValidationError({ message: INVOICE_NOT_FOUND, statusCode: 404 });
    }
    const invoiceResponseDTO: ResponseInvoiceDTO = {
      id: invoice.id,
      taxProfileId: invoice.taxProfileId,
      amount: invoice.amount,
      status: invoice.status,
      currency: invoice.currency,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString()
    };
    return invoiceResponseDTO;
  }

  updateInvoice = async (invoiceDto: UpdateInvoiceDto) => {
    await this.findInvoice(invoiceDto);
    const where: Prisma.InvoiceWhereUniqueInput = { id: invoiceDto.id, taxProfile: { userId: invoiceDto.userId } };
    const dataToUpdate: Prisma.InvoiceUpdateWithoutTaxProfileInput = { amount: invoiceDto.amount, status: invoiceDto.status, currency: invoiceDto.currency };
    const invoice = await InvoiceDAO.updateInvoice(where, dataToUpdate);
    const invoiceResponseDTO: ResponseInvoiceDTO = {
      id: invoice.id,
      taxProfileId: invoice.taxProfileId,
      amount: invoice.amount,
      status: invoice.status,
      currency: invoice.currency,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString()
    };
    return invoiceResponseDTO;
  }

  deleteInvoice = async (invoiceDto: ReadUniqueInvoiceDto) => {
    await this.findInvoice(invoiceDto);
    const where: Prisma.InvoiceWhereUniqueInput = { id: invoiceDto.id, taxProfile: { userId: invoiceDto.userId } };
    await InvoiceDAO.deleteInvoice(where);
  }
}

export default new InvoiceService();