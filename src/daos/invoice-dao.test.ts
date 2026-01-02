import { describe, it, mock, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import { Prisma, InvoiceStatus, Currency, Invoice } from '../generated/prisma/client.js';
import ReqValidationError from "../types/request-validation-error.js";
import { INVOICE_NOT_FOUND, TAX_PROFILE_NOT_FOUND } from '../utils/constants.js';
import { InvoiceDAO } from "./invoice-dao.js";

describe('InvoiceDAO', () => {
  let invoiceDAO: InvoiceDAO;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      invoice: {
        create: mock.fn(),
        findMany: mock.fn(),
        findUnique: mock.fn(),
        update: mock.fn(),
        delete: mock.fn(),
      },
    };
    invoiceDAO = new InvoiceDAO(prismaMock);
  });

  after(() => {
    mock.reset();
  });

  describe('createInvoice', () => {
    it('should create a new invoice', async () => {
      const data: Prisma.InvoiceCreateInput = {
        taxProfile: {
          connect: {
            id: 'taxProfile123',
            userId: 'user123'
          }
        },
        amount: 1000,
        status: InvoiceStatus.PENDING,
        currency: Currency.EUR
      };

      const prismaInvoice: Invoice = { id: 'invoice123', taxProfileId: 'taxProfile123', amount: 1000, status: InvoiceStatus.PENDING, currency: Currency.EUR, createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') };

      prismaMock.invoice.create.mock.mockImplementationOnce(() => Promise.resolve(prismaInvoice));

      const result = await invoiceDAO.createInvoice(data);

      const callArgs = prismaMock.invoice.create.mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [{ data }]);
      assert.deepStrictEqual(result, prismaInvoice);
      assert.strictEqual(prismaMock.invoice.create.mock.callCount(), 1);
    });
  });

  describe('findInvoices', () => {
    it('should return invoices', async () => {
      const skip = 0;
      const take = 10;
      const where: Prisma.InvoiceWhereInput = { taxProfile: { userId: 'user123', id: 'taxProfile123' }, amount: 1000, status: InvoiceStatus.PENDING, currency: Currency.EUR, createdAt: { gte: new Date('2025-01-01T00:00:00.000Z'), lte: new Date('2025-01-01T00:00:00.000Z') }, updatedAt: { gte: new Date('2025-01-01T00:00:00.000Z'), lte: new Date('2025-01-01T00:00:00.000Z') } };
      const prismaInvoices: Invoice[] = [
        { id: 'invoice1', taxProfileId: 'taxProfile123', amount: 1000, status: InvoiceStatus.PENDING, currency: Currency.EUR, createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') },
        { id: 'invoice2', taxProfileId: 'taxProfile123', amount: 2000, status: InvoiceStatus.PAID, currency: Currency.EUR, createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') }
      ];

      prismaMock.invoice.findMany.mock.mockImplementationOnce(() => Promise.resolve(prismaInvoices));

      const result = await invoiceDAO.findInvoices(where, skip, take);

      const callArgs = prismaMock.invoice.findMany.mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [{
        skip,
        take,
        where,
        orderBy: {
          createdAt: 'desc'
        }
      }]);
      assert.deepStrictEqual(result, prismaInvoices);
      assert.strictEqual(prismaMock.invoice.findMany.mock.callCount(), 1);
    });
  });

  describe('findInvoice', () => {
    it('should find an invoice by id and userId', async () => {
      const where: Prisma.InvoiceWhereUniqueInput = { id: 'invoice123', taxProfile: { userId: 'user123' } };
      const prismaInvoice: Invoice = { id: 'invoice123', taxProfileId: 'taxProfile123', amount: 1000, status: InvoiceStatus.PENDING, currency: Currency.EUR, createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') };

      prismaMock.invoice.findUnique.mock.mockImplementationOnce(() => Promise.resolve(prismaInvoice));

      const result = await invoiceDAO.findInvoice(where);

      const callArgs = prismaMock.invoice.findUnique.mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [{ where }]);
      assert.deepStrictEqual(result, prismaInvoice);
      assert.strictEqual(prismaMock.invoice.findUnique.mock.callCount(), 1);
    });
  });

  describe('updateInvoice', () => {
    it('should update an invoice', async () => {
      const where: Prisma.InvoiceWhereUniqueInput = { id: 'invoice123', taxProfile: { userId: 'user123' } };
      const data: Prisma.InvoiceUpdateWithoutTaxProfileInput = { amount: 1500, status: InvoiceStatus.PAID, currency: Currency.USD };
      const prismaInvoice: Invoice = { id: 'invoice123', taxProfileId: 'taxProfile123', amount: 1500, status: InvoiceStatus.PAID, currency: Currency.USD, createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') };

      prismaMock.invoice.update.mock.mockImplementationOnce(() => Promise.resolve(prismaInvoice));

      const result = await invoiceDAO.updateInvoice(where, data);

      const updateCallArgs = prismaMock.invoice.update.mock.calls[0].arguments;
      assert.deepStrictEqual(updateCallArgs, [{ where, data }]);
      assert.deepStrictEqual(result, prismaInvoice);
      assert.strictEqual(prismaMock.invoice.update.mock.callCount(), 1);
    });
  });

  describe('deleteInvoice', () => {
    it('should delete an invoice', async () => {
      const where: Prisma.InvoiceWhereUniqueInput = { id: 'invoice123', taxProfile: { userId: 'user123' } };
      const prismaInvoice: Invoice = { id: 'invoice123', taxProfileId: 'taxProfile123', amount: 1500, status: InvoiceStatus.PAID, currency: Currency.USD, createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') };

      prismaMock.invoice.delete.mock.mockImplementationOnce(() => Promise.resolve(prismaInvoice));

      const result = await invoiceDAO.deleteInvoice(where);

      const deleteCallArgs = prismaMock.invoice.delete.mock.calls[0].arguments;
      assert.deepStrictEqual(deleteCallArgs, [{ where }]);
      assert.deepStrictEqual(result, prismaInvoice);
      assert.strictEqual(prismaMock.invoice.delete.mock.callCount(), 1);
    });
  });
});