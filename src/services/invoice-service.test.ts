import { describe, it, mock, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import { InvoiceService } from "./invoice-service.js";
import { Prisma, InvoiceStatus, Currency } from '../generated/prisma/client.js';
import ReqValidationError from "../types/request-validation-error.js";

describe('InvoiceService', () => {
  let invoiceService: InvoiceService;
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
    invoiceService = new InvoiceService(prismaMock);
  });

  after(() => {
    mock.reset();
  });

  describe('createInvoice', () => {
    it('should create a new invoice', async () => {
      const userId = 'user123';
      const invoiceData = {
        taxProfileId: 'taxProfile123',
        amount: 1000,
        status: InvoiceStatus.PENDING,
        currency: Currency.EUR
      };

      const mockTaxProfile = { id: 'taxProfile123', userId };
      const createdInvoice = { id: 'invoice123', ...invoiceData, createdAt: new Date(), updatedAt: new Date() };

      prismaMock.taxProfile.findUnique.mock.mockImplementationOnce(() => Promise.resolve(mockTaxProfile));
      prismaMock.invoice.create.mock.mockImplementationOnce(() => Promise.resolve(createdInvoice));

      const result = await invoiceService.createInvoice(userId, invoiceData);

      assert.deepStrictEqual(result, createdInvoice);
      assert.strictEqual(prismaMock.taxProfile.findUnique.mock.callCount(), 1);
      assert.strictEqual(prismaMock.invoice.create.mock.callCount(), 1);
    });

    it('should throw error if tax profile does not belong to user', async () => {
      const userId = 'user123';
      const invoiceData = {
        taxProfileId: 'taxProfile123',
        amount: 1000,
        status: InvoiceStatus.PENDING,
        currency: Currency.EUR
      };

      prismaMock.taxProfile.findUnique.mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await invoiceService.createInvoice(userId, invoiceData);
        },
        (error: any) => {
          assert(error instanceof ReqValidationError);
          assert.strictEqual(error.message, "Tax Profile not found or does not belong to user.");
          assert.strictEqual(error.statusCode, 404);
          return true;
        }
      );
      assert.strictEqual(prismaMock.taxProfile.findUnique.mock.callCount(), 1);
      assert.strictEqual(prismaMock.invoice.create.mock.callCount(), 0);
    });
  });

  describe('findInvoicesByUserId', () => {
    it('should find all invoices of an user', async () => {
      const userId = 'user123';
      const skip = 0;
      const take = 10;

      const invoices = [
        { id: 'invoice1', taxProfileId: 'taxProfile123', amount: 1000, status: 'PENDING', currency: 'EUR', createdAt: new Date(), updatedAt: new Date() },
        { id: 'invoice2', taxProfileId: 'taxProfile123', amount: 2000, status: 'PAID', currency: 'USD', createdAt: new Date(), updatedAt: new Date() }
      ];
      prismaMock.invoice.findMany.mock.mockImplementationOnce(() => Promise.resolve(invoices));

      const result = await invoiceService.findInvoicesByUserId(userId, skip, take);

      const callArgs = prismaMock.invoice.findMany.mock.calls[0].arguments[0];
      assert.deepStrictEqual(callArgs, {
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
      assert.deepStrictEqual(result, invoices);
      assert.strictEqual(prismaMock.invoice.findMany.mock.callCount(), 1);
    });
  });

  describe('findInvoicesByUserIdAndTaxProfileId', () => {
    it('should find all invoices of a user filtered by tax profile', async () => {
      const userId = 'user123';
      const taxProfileId = 'taxProfile123';
      const skip = 0;
      const take = 10;

      const invoices = [
        { id: 'invoice1', taxProfileId, amount: 1000, status: 'PENDING', currency: 'EUR', createdAt: new Date(), updatedAt: new Date() }
      ];
      prismaMock.invoice.findMany.mock.mockImplementationOnce(() => Promise.resolve(invoices));

      const result = await invoiceService.findInvoicesByUserIdAndTaxProfileId(userId, taxProfileId, skip, take);

      const callArgs = prismaMock.invoice.findMany.mock.calls[0].arguments[0];
      assert.deepStrictEqual(callArgs, {
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
      assert.deepStrictEqual(result, invoices);
      assert.strictEqual(prismaMock.invoice.findMany.mock.callCount(), 1);
    });
  });

  describe('findInvoiceByUserIdAndId', () => {
    it('should find an invoice by id and userId', async () => {
      const userId = 'user123';
      const invoiceId = 'invoice123';

      const invoice = { id: invoiceId, taxProfileId: 'taxProfile123', amount: 1000, status: 'PENDING', currency: 'EUR', createdAt: new Date(), updatedAt: new Date() };
      prismaMock.invoice.findUnique.mock.mockImplementationOnce(() => Promise.resolve(invoice));

      const result = await invoiceService.findInvoiceByUserIdAndId(userId, invoiceId);

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
  });

  describe('updateInvoice', () => {
    it('should update an invoice', async () => {
      const userId = 'user123';
      const invoiceId = 'invoice123';
      const updateData: Prisma.InvoiceUpdateWithoutTaxProfileInput = { amount: 1500, status: 'PAID' };

      const mockInvoice = { id: invoiceId, taxProfileId: 'taxProfile123', amount: 1000, status: 'PENDING', currency: 'EUR', createdAt: new Date(), updatedAt: new Date() };
      const updatedInvoice = { id: invoiceId, taxProfileId: 'taxProfile123', amount: 1500, status: 'PAID', currency: 'EUR', createdAt: new Date(), updatedAt: new Date() };

      prismaMock.invoice.findUnique.mock.mockImplementationOnce(() => Promise.resolve(mockInvoice));
      prismaMock.invoice.update.mock.mockImplementationOnce(() => Promise.resolve(updatedInvoice));

      const result = await invoiceService.updateInvoice(userId, invoiceId, updateData);

      const updateCallArgs = prismaMock.invoice.update.mock.calls[0].arguments[0];
      assert.deepStrictEqual(updateCallArgs, {
        where: { id: invoiceId },
        data: updateData
      });
      assert.deepStrictEqual(result, updatedInvoice);
      assert.strictEqual(prismaMock.invoice.findUnique.mock.callCount(), 1);
      assert.strictEqual(prismaMock.invoice.update.mock.callCount(), 1);
    });

    it('should throw error if invoice was not found ordoes not belong to user', async () => {
      const userId = 'user123';
      const invoiceId = 'invoice123';
      const updateData: Prisma.InvoiceUpdateWithoutTaxProfileInput = { amount: 1500 };

      prismaMock.invoice.findUnique.mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await invoiceService.updateInvoice(userId, invoiceId, updateData);
        },
        (error: any) => {
          assert(error instanceof ReqValidationError);
          assert.strictEqual(error.message, "Invoice not found or does not belong to user.");
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
      const userId = 'user123';
      const invoiceId = 'invoice123';

      const mockInvoice = { id: invoiceId, taxProfileId: 'taxProfile123', amount: 1000, status: 'PENDING', currency: 'EUR', createdAt: new Date(), updatedAt: new Date() };
      const deletedInvoice = { id: invoiceId, taxProfileId: 'taxProfile123', amount: 1000, status: 'PENDING', currency: 'EUR', createdAt: new Date(), updatedAt: new Date() };

      prismaMock.invoice.findUnique.mock.mockImplementationOnce(() => Promise.resolve(mockInvoice));
      prismaMock.invoice.delete.mock.mockImplementationOnce(() => Promise.resolve(deletedInvoice));

      const result = await invoiceService.deleteInvoice(userId, invoiceId);

      const deleteCallArgs = prismaMock.invoice.delete.mock.calls[0].arguments[0];
      assert.deepStrictEqual(deleteCallArgs, {
        where: { id: invoiceId }
      });
      assert.deepStrictEqual(result, deletedInvoice);
      assert.strictEqual(prismaMock.invoice.findUnique.mock.callCount(), 1);
      assert.strictEqual(prismaMock.invoice.delete.mock.callCount(), 1);
    });

    it('should throw error if invoice was not found or does not belong to user', async () => {
      const userId = 'user123';
      const invoiceId = 'invoice123';

      prismaMock.invoice.findUnique.mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await invoiceService.deleteInvoice(userId, invoiceId);
        },
        (error: any) => {
          assert(error instanceof ReqValidationError);
          assert.strictEqual(error.message, "Invoice not found or does not belong to user.");
          assert.strictEqual(error.statusCode, 404);
          return true;
        }
      );
      assert.strictEqual(prismaMock.invoice.findUnique.mock.callCount(), 1);
      assert.strictEqual(prismaMock.invoice.delete.mock.callCount(), 0);
    });
  });
});