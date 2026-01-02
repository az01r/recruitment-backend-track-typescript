import { describe, it, mock, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import InvoiceController from './invoice-controller.js';
import InvoiceService from '../services/invoice-service.js';
import { INVOICE_DELETED } from '../utils/constants.js';
import { CurrencyDto, InvoiceStatusDto, ReadInvoiceOptionsDto, ReadUniqueInvoiceDto, ResponseInvoiceDTO, UpdateInvoiceDto } from '../types/invoice-dto.js';

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
      status: function (code: number) {
        this.statusCode = code;
        return this;
      },
      json: function (data: any) {
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
      req.body = { taxProfileId: 'taxProfile123', amount: 1000, status: 'PENDING', currency: 'EUR' };
      const invoice: ResponseInvoiceDTO = { id: 'invoice123', ...req.body, createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') };

      (InvoiceService.createInvoice as any).mock.mockImplementationOnce(() => Promise.resolve(invoice));

      await InvoiceController.createInvoice(req, res, next);

      assert.strictEqual(res.statusCode, 201);
      assert.deepStrictEqual(res.jsonData, { invoice });
      assert.strictEqual((InvoiceService.createInvoice as any).mock.callCount(), 1);
    });
  });

  describe('getInvoices', () => {
    it('should get invoices filtered by query params', async () => {
      req.query = { taxProfileId: 'taxProfile123', skip: '10', take: '20', status: 'PENDING', currency: 'EUR', amount: '1000', gteCreatedAt: '2025-01-01', lteCreatedAt: '2025-12-31', gteUpdatedAt: '2025-01-01', lteUpdatedAt: '2025-12-31' };
      const readInvoiceOptionsDto: ReadInvoiceOptionsDto = { userId: req.userId!, taxProfileId: req.query.taxProfileId!, skip: Number(req.query.skip), take: Number(req.query.take), status: req.query.status as InvoiceStatusDto, currency: req.query.currency as CurrencyDto, amount: Number(req.query.amount), gteCreatedAt: req.query.gteCreatedAt, lteCreatedAt: req.query.lteCreatedAt, gteUpdatedAt: req.query.gteUpdatedAt, lteUpdatedAt: req.query.lteUpdatedAt };
      const invoicesResponseDto: ResponseInvoiceDTO[] = [
        { id: 'invoice1', taxProfileId: 'taxProfile123', amount: 1000, status: 'PENDING', currency: 'EUR', createdAt: new Date('2025-01-01T00:00:00.000Z').toISOString(), updatedAt: new Date('2025-01-01T00:00:00.000Z').toISOString() },
        { id: 'invoice2', taxProfileId: 'taxProfile123', amount: 2000, status: 'PAID', currency: 'USD', createdAt: new Date('2025-01-01T00:00:00.000Z').toISOString(), updatedAt: new Date('2025-01-01T00:00:00.000Z').toISOString() }
      ];

      (InvoiceService.findInvoices as any).mock.mockImplementationOnce(() => Promise.resolve(invoicesResponseDto));

      await InvoiceController.getInvoices(req, res, next);

      const callArgs = (InvoiceService.findInvoices as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [readInvoiceOptionsDto]);
      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { invoices: invoicesResponseDto });
      assert.strictEqual((InvoiceService.findInvoices as any).mock.callCount(), 1);
    });
  });

  describe('getInvoice', () => {
    it('should get an invoice using invoice id and user id', async () => {
      req.params = { id: 'invoice123' };
      const invoiceDto: ReadUniqueInvoiceDto = { id: req.params.id, userId: req.userId! };
      const invoiceResponseDTO: ResponseInvoiceDTO = { id: 'invoice123', taxProfileId: 'taxProfile123', amount: 1000, status: 'PENDING', currency: 'EUR', createdAt: new Date('2025-01-01T00:00:00.000Z').toISOString(), updatedAt: new Date('2025-01-01T00:00:00.000Z').toISOString() };

      (InvoiceService.findInvoice as any).mock.mockImplementationOnce(() => Promise.resolve(invoiceResponseDTO));

      await InvoiceController.getInvoice(req, res, next);

      const callArgs = (InvoiceService.findInvoice as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [invoiceDto]);
      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { invoice: invoiceResponseDTO });
      assert.strictEqual((InvoiceService.findInvoice as any).mock.callCount(), 1);
    });
  });

  describe('updateInvoice', () => {
    it('should update an invoice using invoice id and user id', async () => {
      req.params = { id: 'invoice123' };
      req.body = {
        amount: 1500,
        status: 'PAID',
        currency: 'EUR'
      };
      const invoiceDto: UpdateInvoiceDto = { id: req.params.id, userId: req.userId!, ...req.body };
      const responseInvoiceDto: ResponseInvoiceDTO = { id: 'invoice123', taxProfileId: 'taxProfile123', amount: 1500, status: 'PAID', currency: 'EUR', createdAt: new Date('2025-01-01T00:00:00.000Z').toISOString(), updatedAt: new Date('2025-01-01T00:00:00.000Z').toISOString() };

      (InvoiceService.updateInvoice as any).mock.mockImplementationOnce(() => Promise.resolve(responseInvoiceDto));

      await InvoiceController.updateInvoice(req, res, next);

      const callArgs = (InvoiceService.updateInvoice as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [invoiceDto]);
      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { invoice: responseInvoiceDto });
      assert.strictEqual((InvoiceService.updateInvoice as any).mock.callCount(), 1);
    });
  });

  describe('deleteInvoice', () => {
    it('should delete an invoice using invoice id and user id', async () => {
      req.params = { id: 'invoice123' };
      const invoiceDto: ReadUniqueInvoiceDto = { id: req.params.id, userId: req.userId! };

      (InvoiceService.deleteInvoice as any).mock.mockImplementationOnce(() => Promise.resolve(void 0));

      await InvoiceController.deleteInvoice(req, res, next);

      const callArgs = (InvoiceService.deleteInvoice as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [invoiceDto]);
      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { message: INVOICE_DELETED });
      assert.strictEqual((InvoiceService.deleteInvoice as any).mock.callCount(), 1);
    });
  });
});
