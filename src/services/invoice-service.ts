import prisma from "../utils/prisma.js";
import { Prisma } from "../generated/prisma/client.js";
import ReqValidationError from "../types/req-validation-error.js";

class InvoiceService {
  findInvoicesByUserId = async (userId: string, skip: number, take: number) => {
    const invoices = await prisma.invoice.findMany({
      skip,
      take,
      where: {
        taxProfile: {
          userId
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return invoices;
  }

  findInvoicesByUserIdAndTaxProfileId = async (userId: string, taxProfileId: string, skip: number, take: number) => {
    const invoices = await prisma.invoice.findMany({
      skip,
      take,
      where: {
        taxProfileId,
        taxProfile: {
          userId
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return invoices;
  }

  findInvoiceByUserIdAndId = async (userId: string, invoiceId: string) => {
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        taxProfile: {
          userId
        }
      }
    });
    return invoice;
  }

  createInvoice = async (userId: string, data: Prisma.InvoiceCreateWithoutTaxProfileInput & { taxProfileId: string }) => {
    this.validateTaxProfileOwnership(userId, data.taxProfileId);

    return await prisma.invoice.create({
      data
    });
  }

  updateInvoice = async (userId: string, invoiceId: string, data: Prisma.InvoiceUpdateWithoutTaxProfileInput) => {
    this.validateInvoiceOwnership(userId, invoiceId);
    return await prisma.invoice.update({
      where: {
        id: invoiceId
      },
      data
    });
  }

  deleteInvoice = async (userId: string, invoiceId: string) => {
    this.validateInvoiceOwnership(userId, invoiceId);
    return await prisma.invoice.delete({
      where: {
        id: invoiceId
      }
    });
  }

  private validateInvoiceOwnership = async (userId: string, invoiceId: string) => {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        taxProfile: {
          userId
        }
      }
    });

    if (!invoice) {
      throw new ReqValidationError({ message: "Invoice not found or does not belong to user.", statusCode: 404 });
    }
  }

  private validateTaxProfileOwnership = async (userId: string, taxProfileId: string) => {
    const taxProfile = await prisma.taxProfile.findFirst({
      where: {
        id: taxProfileId,
        userId
      }
    });

    if (!taxProfile) {
      throw new ReqValidationError({ message: "Tax Profile not found or does not belong to user.", statusCode: 404 });
    }
  }
}

export default new InvoiceService();
