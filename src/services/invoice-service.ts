import prismaClientSingleton from "../utils/prisma.js";
import { Prisma, PrismaClient } from "../generated/prisma/client.js";
import ReqValidationError from "../types/request-validation-error.js";

class InvoiceService {
  private prismaClient: PrismaClient;

  constructor(prismaClient: PrismaClient = prismaClientSingleton) {
    this.prismaClient = prismaClient;
  }

  createInvoice = async (userId: string, data: Prisma.InvoiceCreateWithoutTaxProfileInput & { taxProfileId: string }) => {
    await this.validateTaxProfileOwnership(userId, data.taxProfileId);

    return await this.prismaClient.invoice.create({ data });
  }

  findInvoicesByUserId = async (userId: string, skip: number, take: number) => {
    return await this.prismaClient.invoice.findMany({
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
  }

  findInvoicesByUserIdAndTaxProfileId = async (userId: string, taxProfileId: string, skip: number, take: number) => {
    return await this.prismaClient.invoice.findMany({
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
  }

  findInvoiceByUserIdAndId = async (userId: string, invoiceId: string) => {
    return await this.prismaClient.invoice.findUnique({
      where: {
        id: invoiceId,
        taxProfile: {
          userId
        }
      }
    });
  }

  updateInvoice = async (userId: string, invoiceId: string, data: Prisma.InvoiceUpdateWithoutTaxProfileInput) => {
    await this.validateInvoiceOwnership(userId, invoiceId);
    return await this.prismaClient.invoice.update({
      where: {
        id: invoiceId
      },
      data
    });
  }

  deleteInvoice = async (userId: string, invoiceId: string) => {
    await this.validateInvoiceOwnership(userId, invoiceId);
    return await this.prismaClient.invoice.delete({
      where: {
        id: invoiceId
      }
    });
  }

  private validateInvoiceOwnership = async (userId: string, invoiceId: string) => {
    const invoice = await this.prismaClient.invoice.findUnique({
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
    const taxProfile = await this.prismaClient.taxProfile.findUnique({
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
export { InvoiceService };