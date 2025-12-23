import prismaClientSingleton from "../utils/prisma.js";
import { Prisma, PrismaClient } from "../generated/prisma/client.js";
import ReqValidationError from "../types/request-validation-error.js";
import TaxProfileService, { TaxProfileService as TaxProfileServiceClass } from "./tax-profile-service.js";

class InvoiceService {
  private prismaClient: PrismaClient;
  private taxProfileService: TaxProfileServiceClass;

  constructor(prismaClient: PrismaClient = prismaClientSingleton, taxProfileService: TaxProfileServiceClass = TaxProfileService) {
    this.prismaClient = prismaClient;
    this.taxProfileService = taxProfileService;
  }

  createInvoice = async (data: Prisma.InvoiceCreateInput) => {
    if (!data.taxProfile.connect) {
      throw new ReqValidationError({ message: "Tax Profile not found or does not belong to user.", statusCode: 404 });
    }
    await this.validateTaxProfileOwnership(data.taxProfile.connect);
    return await this.prismaClient.invoice.create({ data });
  }

  findInvoices = async (where: Prisma.InvoiceWhereInput, skip?: number, take?: number) => {
    return await this.prismaClient.invoice.findMany({
      where,
      skip: skip || 0,
      take: take || 10,
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  findInvoice = async (where: Prisma.InvoiceWhereUniqueInput) => {
    return await this.prismaClient.invoice.findUnique({ where });
  }

  updateInvoice = async (where: Prisma.InvoiceWhereUniqueInput, data: Prisma.InvoiceUpdateWithoutTaxProfileInput) => {
    await this.validateInvoiceOwnership(where);
    return await this.prismaClient.invoice.update({ where, data });
  }

  deleteInvoice = async (where: Prisma.InvoiceWhereUniqueInput) => {
    await this.validateInvoiceOwnership(where);
    return await this.prismaClient.invoice.delete({ where });
  }

  private validateInvoiceOwnership = async (where: Prisma.InvoiceWhereUniqueInput) => {
    const invoice = await this.prismaClient.invoice.findUnique({ where });

    if (!invoice) {
      throw new ReqValidationError({ message: "Invoice not found or does not belong to user.", statusCode: 404 });
    }
  }

  private validateTaxProfileOwnership = async (where: Prisma.TaxProfileWhereUniqueInput) => {
    const taxProfile = await this.taxProfileService.findTaxProfile(where);

    if (!taxProfile) {
      throw new ReqValidationError({ message: "Tax Profile not found or does not belong to user.", statusCode: 404 });
    }
  }
}

export default new InvoiceService();
export { InvoiceService };