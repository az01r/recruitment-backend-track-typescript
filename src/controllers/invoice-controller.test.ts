import { describe, it, mock, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import InvoiceController from './invoice-controller.js';
import InvoiceService from '../services/invoice-service.js';

mock.method(InvoiceService, 'createInvoice');
mock.method(InvoiceService, 'findInvoicesByUserId');
mock.method(InvoiceService, 'findInvoicesByUserIdAndTaxProfileId');
mock.method(InvoiceService, 'findInvoiceByUserIdAndId');
mock.method(InvoiceService, 'updateInvoice');
mock.method(InvoiceService, 'deleteInvoice');

describe('InvoiceController', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    (InvoiceService.createInvoice as any).mock.resetCalls();
    (InvoiceService.findInvoicesByUserId as any).mock.resetCalls();
    (InvoiceService.findInvoicesByUserIdAndTaxProfileId as any).mock.resetCalls();
    (InvoiceService.findInvoiceByUserIdAndId as any).mock.resetCalls();
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
      req.body = {
        taxProfileId: 'taxProfile123',
        amount: 1000,
        status: 'PENDING',
        currency: 'EUR'
      };
      const createdInvoice = { id: 'invoice123', ...req.body };

      (InvoiceService.createInvoice as any).mock.mockImplementationOnce(() => Promise.resolve(createdInvoice));

      await InvoiceController.createInvoice(req, res, next);

      const callArgs = (InvoiceService.createInvoice as any).mock.calls[0].arguments;
      assert.strictEqual(callArgs[0], 'user123');
      assert.deepStrictEqual(callArgs[1], req.body);
      assert.strictEqual(res.statusCode, 201);
      assert.deepStrictEqual(res.jsonData, { invoice: createdInvoice });
      assert.strictEqual((InvoiceService.createInvoice as any).mock.callCount(), 1);
    });
  });

  describe('getUserInvoices', () => {
    it('should get all user invoices without tax profile filter', async () => {
      const mockInvoices = [
        { id: 'invoice1', amount: 1000, status: 'PENDING', currency: 'EUR', createdAt: new Date(), updatedAt: new Date() },
        { id: 'invoice2', amount: 2000, status: 'PAID', currency: 'USD', createdAt: new Date(), updatedAt: new Date() }
      ];
      req.query = { skip: '0', take: '50' };

      (InvoiceService.findInvoicesByUserId as any).mock.mockImplementationOnce(() => Promise.resolve(mockInvoices));

      await InvoiceController.getUserInvoices(req, res, next);

      const callArgs = (InvoiceService.findInvoicesByUserId as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, ['user123', 0, 50]);
      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { invoices: mockInvoices });
      assert.strictEqual((InvoiceService.findInvoicesByUserId as any).mock.callCount(), 1);
    });

    it('should get user invoices filtered by tax profile', async () => {
      const mockInvoices = [
        { id: 'invoice1', taxProfileId: 'taxProfile123', amount: 1000, status: 'PENDING', currency: 'EUR', createdAt: new Date(), updatedAt: new Date() }
      ];
      req.query = { taxProfileId: 'taxProfile123', skip: '10', take: '20' };

      (InvoiceService.findInvoicesByUserIdAndTaxProfileId as any).mock.mockImplementationOnce(() => Promise.resolve(mockInvoices));

      await InvoiceController.getUserInvoices(req, res, next);

      const callArgs = (InvoiceService.findInvoicesByUserIdAndTaxProfileId as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, ['user123', 'taxProfile123', 10, 20]);
      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { invoices: mockInvoices });
      assert.strictEqual((InvoiceService.findInvoicesByUserIdAndTaxProfileId as any).mock.callCount(), 1);
    });

    it('should use default values for skip and take', async () => {
      const mockInvoices: any[] = [];
      req.query = {};

      (InvoiceService.findInvoicesByUserId as any).mock.mockImplementationOnce(() => Promise.resolve(mockInvoices));

      await InvoiceController.getUserInvoices(req, res, next);

      const callArgs = (InvoiceService.findInvoicesByUserId as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, ['user123', 0, 50]);
      assert.strictEqual(res.statusCode, 200);
    });
  });

  describe('getInvoice', () => {
    it('should get an invoice by id', async () => {
      const mockInvoice = { id: 'invoice123', amount: 1000, status: 'PENDING', currency: 'EUR' };
      req.params = { id: 'invoice123' };

      (InvoiceService.findInvoiceByUserIdAndId as any).mock.mockImplementationOnce(() => Promise.resolve(mockInvoice));

      await InvoiceController.getInvoice(req, res, next);

      const callArgs = (InvoiceService.findInvoiceByUserIdAndId as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, ['user123', 'invoice123']);
      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { invoice: mockInvoice });
      assert.strictEqual((InvoiceService.findInvoiceByUserIdAndId as any).mock.callCount(), 1);
    });

    it('should throw error if invoice not found', async () => {
      req.params = { id: 'notfound' };

      (InvoiceService.findInvoiceByUserIdAndId as any).mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await InvoiceController.getInvoice(req, res, next);
        },
        (error: any) => {
          assert(error instanceof Error);
          assert.strictEqual(error.message, "Invoice not found.");
          assert.strictEqual(res.statusCode, 404);
          return true;
        }
      );
      assert.strictEqual((InvoiceService.findInvoiceByUserIdAndId as any).mock.callCount(), 1);
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

      const callArgs = (InvoiceService.updateInvoice as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, ['user123', 'invoice123', req.body]);
      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { invoice: updatedInvoice });
      assert.strictEqual((InvoiceService.updateInvoice as any).mock.callCount(), 1);
    });

    // This check is implicit made in InvoiceService.updateInvoice
    //   it('should throw error if invoice not found', async () => {
    //     req.params = { id: 'notfound' };
    //     req.body = {
    //       amount: 1500,
    //       status: 'PAID',
    //       currency: 'EUR'
    //     };

    //     (InvoiceService.updateInvoice as any).mock.mockImplementationOnce(() => Promise.resolve(null));

    //     await assert.rejects(
    //       async () => {
    //         await InvoiceController.updateInvoice(req, res, next);
    //       },
    //       (error: any) => {
    //         assert(error instanceof Error);
    //         assert.strictEqual(error.message, "Invoice not found.");
    //         assert.strictEqual(res.statusCode, 404);
    //         return true;
    //       }
    //     );
    //     assert.strictEqual((InvoiceService.updateInvoice as any).mock.callCount(), 1);
    //   });
  });

  describe('deleteInvoice', () => {
    it('should delete an invoice', async () => {
      req.params = { id: 'invoice123' };
      const invoice = { id: 'invoice123', amount: 1000, status: 'PAID', currency: 'EUR' };

      (InvoiceService.deleteInvoice as any).mock.mockImplementationOnce(() => Promise.resolve(invoice));

      await InvoiceController.deleteInvoice(req, res, next);

      const callArgs = (InvoiceService.deleteInvoice as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, ['user123', 'invoice123']);
      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { message: 'Invoice deleted.' });
      assert.strictEqual((InvoiceService.deleteInvoice as any).mock.callCount(), 1);
    });

    // This check is implicit made in InvoiceService.deleteInvoice
    // it('should throw error if invoice not found', async () => {
    //   req.params = { id: 'notfound' };

    //   (InvoiceService.deleteInvoice as any).mock.mockImplementationOnce(() => Promise.resolve(null));

    //   await assert.rejects(
    //     async () => {
    //       await InvoiceController.deleteInvoice(req, res, next);
    //     },
    //     (error: any) => {
    //       assert(error instanceof Error);
    //       assert.strictEqual(error.message, "Invoice not found.");
    //       assert.strictEqual(res.statusCode, 404);
    //       return true;
    //     }
    //   );
    //   assert.strictEqual((InvoiceService.deleteInvoice as any).mock.callCount(), 1);
    // });
  });
});
