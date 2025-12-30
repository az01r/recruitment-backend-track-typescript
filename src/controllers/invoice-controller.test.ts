import { describe, it, mock, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import InvoiceController from './invoice-controller.js';
import InvoiceService from '../services/invoice-service.js';
import { INVOICE_DELETED, INVOICE_NOT_FOUND } from '../utils/constants.js';
import { Prisma } from '../generated/prisma/client.js';

mock.method(InvoiceService, 'createInvoice');
mock.method(InvoiceService, 'findInvoices');
mock.method(InvoiceService, 'findInvoice');
mock.method(InvoiceService, 'updateInvoice');
mock.method(InvoiceService, 'deleteInvoice');

describe('InvoiceController', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    (InvoiceService.createInvoice as any).mock.resetCalls();
    (InvoiceService.findInvoices as any).mock.resetCalls();
    (InvoiceService.findInvoice as any).mock.resetCalls();
    (InvoiceService.updateInvoice as any).mock.resetCalls();
    (InvoiceService.deleteInvoice as any).mock.resetCalls();
    req = {
      body: {},
      query: {},
      params: {},
      userId: 'user123'
    };
    res = {
      statusCode: 0,
      jsonData: null,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(data: any) {
        this.jsonData = data;
        return this;
      }
    };
    next = mock.fn();
  });

  after(() => {
    mock.reset();
  });

  describe('createInvoice', () => {
    it('should create a new invoice', async () => {
      req.userId = 'user123';
      req.body = { taxProfileId: 'taxProfile123', amount: 1000, status: 'PENDING', currency: 'EUR' };
      const invoice = { id: 'invoice123', ...req.body, createdAt: new Date(), updatedAt: new Date() };

      (InvoiceService.createInvoice as any).mock.mockImplementationOnce(() => Promise.resolve(invoice));

      await InvoiceController.createInvoice(req, res, next);

      assert.strictEqual(res.statusCode, 201);
      assert.deepStrictEqual(res.jsonData, { invoice });
      assert.strictEqual((InvoiceService.createInvoice as any).mock.callCount(), 1);
    });
  });

  describe('getUserInvoices', () => {
    it('should get all logged user invoices without tax profile filter', async () => {
      const mockInvoices = [
        { id: 'invoice1', amount: 1000, status: 'PENDING', currency: 'EUR', createdAt: new Date(), updatedAt: new Date() },
        { id: 'invoice2', amount: 2000, status: 'PAID', currency: 'USD', createdAt: new Date(), updatedAt: new Date() }
      ];
      req.query = {};

      (InvoiceService.findInvoices as any).mock.mockImplementationOnce(() => Promise.resolve(mockInvoices));

      await InvoiceController.getInvoices(req, res, next);

      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { invoices: mockInvoices });
      assert.strictEqual((InvoiceService.findInvoices as any).mock.callCount(), 1);
    });

    it('should use query params to filter invoices', async () => {
      req.query = { taxProfileId: 'taxProfile123', skip: '10', take: '20', status: 'PENDING', currency: 'EUR', gteCreatedAt: '2025-01-01', lteCreatedAt: '2025-12-31', gteUpdatedAt: '2025-01-01', lteUpdatedAt: '2025-12-31' };
      const { taxProfileId, skip, take, status, currency, gteCreatedAt, lteCreatedAt, gteUpdatedAt, lteUpdatedAt } = req.query;
      const where: Prisma.InvoiceWhereInput = { taxProfile: { userId: req.userId! }, taxProfileId, status, currency, createdAt: { gte: gteCreatedAt, lte: lteCreatedAt }, updatedAt: { gte: gteUpdatedAt, lte: lteUpdatedAt } };

      (InvoiceService.findInvoices as any).mock.mockImplementationOnce(() => Promise.resolve([]));

      await InvoiceController.getInvoices(req, res, next);

      const callArgs = (InvoiceService.findInvoices as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [where, Number(skip), Number(take)]);
    });
  });

  describe('getInvoice', () => {
    it('should get an invoice by id', async () => {
      const mockInvoice = { id: 'invoice123', amount: 1000, status: 'PENDING', currency: 'EUR' };
      req.params = { id: 'invoice123' };

      (InvoiceService.findInvoice as any).mock.mockImplementationOnce(() => Promise.resolve(mockInvoice));

      await InvoiceController.getInvoice(req, res, next);

      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { invoice: mockInvoice });
      assert.strictEqual((InvoiceService.findInvoice as any).mock.callCount(), 1);
    });

    it('should throw error if invoice not found', async () => {
      req.params = { id: 'notfound' };

      (InvoiceService.findInvoice as any).mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await InvoiceController.getInvoice(req, res, next);
        },
        (error: any) => {
          assert(error instanceof Error);
          assert.strictEqual(error.message, INVOICE_NOT_FOUND);
          assert.strictEqual(res.statusCode, 404);
          return true;
        }
      );
      assert.strictEqual((InvoiceService.findInvoice as any).mock.callCount(), 1);
    });
  });

  describe('updateInvoice', () => {
    it('should update an invoice', async () => {
      req.params = { id: 'invoice123' };
      req.body = {
        amount: 1500,
        status: 'PAID',
        currency: 'EUR'
      };
      const updatedInvoice = { id: 'invoice123', ...req.body };

      (InvoiceService.updateInvoice as any).mock.mockImplementationOnce(() => Promise.resolve(updatedInvoice));

      await InvoiceController.updateInvoice(req, res, next);

      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { invoice: updatedInvoice });
      assert.strictEqual((InvoiceService.updateInvoice as any).mock.callCount(), 1);
    });
  });

  describe('deleteInvoice', () => {
    it('should delete an invoice', async () => {
      req.params = { id: 'invoice123' };
      const invoice = { id: 'invoice123', amount: 1000, status: 'PAID', currency: 'EUR' };

      (InvoiceService.deleteInvoice as any).mock.mockImplementationOnce(() => Promise.resolve(invoice));

      await InvoiceController.deleteInvoice(req, res, next);

      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { message: INVOICE_DELETED });
      assert.strictEqual((InvoiceService.deleteInvoice as any).mock.callCount(), 1);
    });
  });
});
