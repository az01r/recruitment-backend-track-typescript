import prismaClientSingleton from "../utils/prisma.js";
import { Prisma, PrismaClient } from "../generated/prisma/client.js";

class InvoiceDAO {
  private prismaClient: PrismaClient;

  constructor(prismaClient: PrismaClient = prismaClientSingleton) {
    this.prismaClient = prismaClient;
  }

  createInvoice = async (data: Prisma.InvoiceCreateInput) => {
    return await this.prismaClient.invoice.create({ data });
  }

  findInvoices = async (where: Prisma.InvoiceWhereInput, skip: number, take: number) => {
    return await this.prismaClient.invoice.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  findInvoice = async (where: Prisma.InvoiceWhereUniqueInput) => {
    return await this.prismaClient.invoice.findUnique({ where });
  }

  updateInvoice = async (where: Prisma.InvoiceWhereUniqueInput, data: Prisma.InvoiceUpdateWithoutTaxProfileInput) => {
    return await this.prismaClient.invoice.update({ where, data });
  }

  deleteInvoice = async (where: Prisma.InvoiceWhereUniqueInput) => {
    return await this.prismaClient.invoice.delete({ where });
  }
}

export default new InvoiceDAO();
export { InvoiceDAO };