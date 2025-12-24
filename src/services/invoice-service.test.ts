import { describe, it, mock, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import { InvoiceService } from "./invoice-service.js";
import { Prisma, InvoiceStatus, Currency } from '../generated/prisma/client.js';
import ReqValidationError from "../types/request-validation-error.js";
import { TaxProfileService } from "./tax-profile-service.js";
import { INVOICE_NOT_FOUND, TAX_PROFILE_NOT_FOUND } from '../utils/constants.js';

describe('InvoiceService', () => {
  let invoiceService: InvoiceService;
  let taxProfileService: TaxProfileService;
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
      taxProfile: {
        findUnique: mock.fn(),
      },
    };
    taxProfileService = new TaxProfileService(prismaMock);
    invoiceService = new InvoiceService(prismaMock, taxProfileService);
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

      const createdInvoice = { id: 'invoice123', ...data, createdAt: new Date(), updatedAt: new Date() };

      prismaMock.taxProfile.findUnique.mock.mockImplementationOnce(() => Promise.resolve({}));
      prismaMock.invoice.create.mock.mockImplementationOnce(() => Promise.resolve(createdInvoice));

      const result = await invoiceService.createInvoice(data);

      assert.deepStrictEqual(result, createdInvoice);
      assert.strictEqual(prismaMock.taxProfile.findUnique.mock.callCount(), 1);
      assert.strictEqual(prismaMock.invoice.create.mock.callCount(), 1);
    });

    it('should throw error 404 if tax profile does not exist or does not belong to user', async () => {
      const data: Prisma.InvoiceCreateInput = {
        taxProfile: {
          connect: {
            id: 'notOwnedTaxProfileId',
            userId: 'user123'
          }
        },
        amount: 1000,
        status: InvoiceStatus.PENDING,
        currency: Currency.EUR
      };

      prismaMock.taxProfile.findUnique.mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await invoiceService.createInvoice(data);
        },
        (error: any) => {
          assert(error instanceof ReqValidationError);
          assert.strictEqual(error.message, TAX_PROFILE_NOT_FOUND);
          assert.strictEqual(error.statusCode, 404);
          return true;
        }
      );
      assert.strictEqual(prismaMock.taxProfile.findUnique.mock.callCount(), 1);
      assert.strictEqual(prismaMock.invoice.create.mock.callCount(), 0);
    });
  });

  describe('findInvoices', () => {
    it('should find all invoices of an user', async () => {
      const where: Prisma.InvoiceWhereInput = { taxProfile: { userId: 'user123' } };
      const skip = 0;
      const take = 10;
      const invoices = [
        { id: 'invoice1', taxProfileId: 'taxProfile123', amount: 1000, status: 'PENDING', currency: 'EUR', createdAt: new Date(), updatedAt: new Date() },
        { id: 'invoice2', taxProfileId: 'taxProfile123', amount: 2000, status: 'PAID', currency: 'USD', createdAt: new Date(), updatedAt: new Date() }
      ];

      prismaMock.invoice.findMany.mock.mockImplementationOnce(() => Promise.resolve(invoices));

      const result = await invoiceService.findInvoices(where, skip, take);

      const callArgs = prismaMock.invoice.findMany.mock.calls[0].arguments[0];
      assert.deepStrictEqual(callArgs, {
        skip,
        take,
        where,
        orderBy: {
          createdAt: 'desc'
        }
      });
      assert.deepStrictEqual(result, invoices);
      assert.strictEqual(prismaMock.invoice.findMany.mock.callCount(), 1);
    });

    it('should find all invoices of a user filtered by tax profile', async () => {
      const where: Prisma.InvoiceWhereInput = { taxProfile: { id: 'taxProfile123', userId: 'user123' } };
      const skip = 0;
      const take = 10;
      const invoices = [
        { id: 'invoice1', taxProfileId: 'taxProfile123', amount: 1000, status: 'PENDING', currency: 'EUR', createdAt: new Date(), updatedAt: new Date() }
      ];

      prismaMock.invoice.findMany.mock.mockImplementationOnce(() => Promise.resolve(invoices));

      const result = await invoiceService.findInvoices(where, skip, take);

      const callArgs = prismaMock.invoice.findMany.mock.calls[0].arguments[0];
      assert.deepStrictEqual(callArgs, {
        skip,
        take,
        where,
        orderBy: {
          createdAt: 'desc'
        }
      });
      assert.deepStrictEqual(result, invoices);
      assert.strictEqual(prismaMock.invoice.findMany.mock.callCount(), 1);
    });

    it('should return empty array if no invoices are found', async () => {
      const where: Prisma.InvoiceWhereInput = { taxProfile: { id: 'taxProfile123', userId: 'user123' } };
      const skip = 0;
      const take = 10;

      prismaMock.invoice.findMany.mock.mockImplementationOnce(() => Promise.resolve([]));

      const result = await invoiceService.findInvoices(where, skip, take);

      const callArgs = prismaMock.invoice.findMany.mock.calls[0].arguments[0];
      assert.deepStrictEqual(callArgs, {
        skip,
        take,
        where,
        orderBy: {
          createdAt: 'desc'
        }
      });
      assert.deepStrictEqual(result, []);
      assert.strictEqual(prismaMock.invoice.findMany.mock.callCount(), 1);
    });
  });

  describe('findInvoice', () => {
    it('should find an invoice by id and userId', async () => {
      const userId = 'user123';
      const invoiceId = 'invoice123';
      const invoice = { id: invoiceId, taxProfileId: 'taxProfile123', amount: 1000, status: 'PENDING', currency: 'EUR', createdAt: new Date(), updatedAt: new Date() };

      prismaMock.invoice.findUnique.mock.mockImplementationOnce(() => Promise.resolve(invoice));

      const result = await invoiceService.findInvoice({
        id: invoiceId,
        taxProfile: {
          userId
        }
      });

      const callArgs = prismaMock.invoice.findUnique.mock.calls[0].arguments[0];
      assert.deepStrictEqual(callArgs, {
        where: {
          id: invoiceId,
          taxProfile: {
            userId
          }
        }
      });
      assert.deepStrictEqual(result, invoice);
      assert.strictEqual(prismaMock.invoice.findUnique.mock.callCount(), 1);
    });

    it('should return null if no invoice is found', async () => {
      const userId = 'user123';
      const invoiceId = 'invoice123';

      prismaMock.invoice.findUnique.mock.mockImplementationOnce(() => Promise.resolve(null));

      const result = await invoiceService.findInvoice({
        id: invoiceId,
        taxProfile: {
          userId
        }
      });

      const callArgs = prismaMock.invoice.findUnique.mock.calls[0].arguments[0];
      assert.deepStrictEqual(callArgs, {
        where: {
          id: invoiceId,
          taxProfile: {
            userId
          }
        }
      });
      assert.deepStrictEqual(result, null);
      assert.strictEqual(prismaMock.invoice.findUnique.mock.callCount(), 1);
    });
  });

  describe('updateInvoice', () => {
    it('should update an invoice', async () => {
      const where: Prisma.InvoiceWhereUniqueInput = { id: 'invoice123', taxProfile: { userId: 'user123' } };
      const data: Prisma.InvoiceUpdateWithoutTaxProfileInput = { amount: 1500, status: 'PAID' };
      const updatedInvoice = { id: 'invoice123', taxProfile: data };

      prismaMock.invoice.findUnique.mock.mockImplementationOnce(() => Promise.resolve({}));
      prismaMock.invoice.update.mock.mockImplementationOnce(() => Promise.resolve(updatedInvoice));

      const result = await invoiceService.updateInvoice(where, data);

      const updateCallArgs = prismaMock.invoice.update.mock.calls[0].arguments[0];
      assert.deepStrictEqual(updateCallArgs, { where, data });
      assert.deepStrictEqual(result, updatedInvoice);
      assert.strictEqual(prismaMock.invoice.findUnique.mock.callCount(), 1);
      assert.strictEqual(prismaMock.invoice.update.mock.callCount(), 1);
    });

    it('should throw error if invoice was not found or does not belong to user', async () => {
      const where: Prisma.InvoiceWhereUniqueInput = { id: 'invoice123', taxProfile: { userId: 'user123' } };
      const data: Prisma.InvoiceUpdateWithoutTaxProfileInput = { amount: 1500 };

      prismaMock.invoice.findUnique.mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await invoiceService.updateInvoice(where, data);
        },
        (error: any) => {
          assert(error instanceof ReqValidationError);
          assert.strictEqual(error.message, INVOICE_NOT_FOUND);
          assert.strictEqual(error.statusCode, 404);
          return true;
        }
      );
      assert.strictEqual(prismaMock.invoice.findUnique.mock.callCount(), 1);
      assert.strictEqual(prismaMock.invoice.update.mock.callCount(), 0);
    });
  });

  describe('deleteInvoice', () => {
    it('should delete an invoice', async () => {
      const where: Prisma.InvoiceWhereUniqueInput = { id: 'invoice123', taxProfile: { userId: 'user123' } };
      const deletedInvoice = where;

      prismaMock.invoice.findUnique.mock.mockImplementationOnce(() => Promise.resolve(deletedInvoice));
      prismaMock.invoice.delete.mock.mockImplementationOnce(() => Promise.resolve(deletedInvoice));

      const result = await invoiceService.deleteInvoice(where);

      const deleteCallArgs = prismaMock.invoice.delete.mock.calls[0].arguments[0];
      assert.deepStrictEqual(deleteCallArgs, { where });
      assert.deepStrictEqual(result, deletedInvoice);
      assert.strictEqual(prismaMock.invoice.findUnique.mock.callCount(), 1);
      assert.strictEqual(prismaMock.invoice.delete.mock.callCount(), 1);
    });

    it('should throw error if invoice was not found or does not belong to user', async () => {
      const where: Prisma.InvoiceWhereUniqueInput = { id: 'invoice123', taxProfile: { userId: 'user123' } };

      prismaMock.invoice.findUnique.mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await invoiceService.deleteInvoice(where);
        },
        (error: any) => {
          assert(error instanceof ReqValidationError);
          assert.strictEqual(error.message, INVOICE_NOT_FOUND);
          assert.strictEqual(error.statusCode, 404);
          return true;
        }
      );
      assert.strictEqual(prismaMock.invoice.findUnique.mock.callCount(), 1);
      assert.strictEqual(prismaMock.invoice.delete.mock.callCount(), 0);
    });
  });
});