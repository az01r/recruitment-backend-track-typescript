import { describe, it, mock, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import TaxProfileController from './tax-profile-controller.js';
import TaxProfileService from '../services/tax-profile-service.js';

mock.method(TaxProfileService, 'createTaxProfile');
mock.method(TaxProfileService, 'findManyTaxProfiles');
mock.method(TaxProfileService, 'findUniqueTaxProfile');
mock.method(TaxProfileService, 'updateTaxProfile');
mock.method(TaxProfileService, 'deleteTaxProfile');

describe('TaxProfileController', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    (TaxProfileService.createTaxProfile as any).mock.resetCalls();
    (TaxProfileService.findManyTaxProfiles as any).mock.resetCalls();
    (TaxProfileService.findUniqueTaxProfile as any).mock.resetCalls();
    (TaxProfileService.updateTaxProfile as any).mock.resetCalls();
    (TaxProfileService.deleteTaxProfile as any).mock.resetCalls();

    req = {
      body: {},
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

  describe('createTaxProfile', () => {
    it('should create a new tax profile', async () => {
      req.userId = 'user123';
      req.body = { legalName: 'Test', vatNumber: '123456789', address: '123 Test St', city: 'Test City', zipCode: '12345', country: 'Test Country' };

      const taxProfile = { id: '1', legalName: 'Test', vatNumber: '123456789', address: '123 Test St', city: 'Test City', zipCode: '12345', country: 'Test Country', createdAt: new Date(), updatedAt: new Date(), userId: 'user123' };
      (TaxProfileService.createTaxProfile as any).mock.mockImplementationOnce(() => Promise.resolve(taxProfile));

      await TaxProfileController.createTaxProfile(req, res, next);

      assert.strictEqual(res.statusCode, 201);
      assert.deepStrictEqual(res.jsonData, { taxProfile });
      assert.strictEqual((TaxProfileService.createTaxProfile as any).mock.callCount(), 1);
    });
  });

  describe('getTaxProfiles', () => {
    it('should get logged user tax profiles', async () => {
      req.userId = 'user123';
      req.query = { skip: 30, take: 10 };

      const taxProfiles = [
        { id: '1', legalName: 'Test', vatNumber: '123456789', address: '123 Test St', city: 'Test City', zipCode: '12345', country: 'Test Country', createdAt: new Date(), updatedAt: new Date(), userId: 'user123' },
        { id: '2', legalName: 'Test', vatNumber: '123456789', address: '123 Test St', city: 'Test City', zipCode: '12345', country: 'Test Country', createdAt: new Date(), updatedAt: new Date(), userId: 'user123' },
      ];
      (TaxProfileService.findManyTaxProfiles as any).mock.mockImplementationOnce(() => Promise.resolve(taxProfiles));

      await TaxProfileController.getTaxProfiles(req, res, next);

      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { taxProfiles });
      assert.strictEqual((TaxProfileService.findManyTaxProfiles as any).mock.callCount(), 1);
    });
  });

  describe('getTaxProfile', () => {
    it('should get logged user tax profile by tax profile id', async () => {
      req.userId = 'user123';
      req.params = { id: '1' };

      const taxProfile = { id: '1', legalName: 'Test', vatNumber: '123456789', address: '123 Test St', city: 'Test City', zipCode: '12345', country: 'Test Country', createdAt: new Date(), updatedAt: new Date(), userId: 'user123' };
      (TaxProfileService.findUniqueTaxProfile as any).mock.mockImplementationOnce(() => Promise.resolve(taxProfile));

      await TaxProfileController.getTaxProfile(req, res, next);

      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { taxProfile });
      assert.strictEqual((TaxProfileService.findUniqueTaxProfile as any).mock.callCount(), 1);
    });

    it('should throw error if tax profile not found', async () => {
      req.userId = 'user123';
      req.params = { id: 'notFound' };
      (TaxProfileService.findUniqueTaxProfile as any).mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await TaxProfileController.getTaxProfile(req, res, next);
        },
        (error: any) => {
          assert(error instanceof Error);
          assert.strictEqual(error.message, "Tax profile not found.");
          assert.strictEqual(res.statusCode, 404);
          return true;
        }
      );
      assert.strictEqual((TaxProfileService.findUniqueTaxProfile as any).mock.callCount(), 1);
    });
  });

  describe('updateTaxProfile', () => {
    it('should update logged user tax profile', async () => {
      req.userId = 'user123';
      req.params = { id: '1' };
      req.body = { legalName: 'Updated' };

      const taxProfile = { id: '1', legalName: 'Updated', vatNumber: '123456789', address: '123 Test St', city: 'Test City', zipCode: '12345', country: 'Test Country', createdAt: new Date(), updatedAt: new Date(), userId: 'user123' };
      (TaxProfileService.updateTaxProfile as any).mock.mockImplementationOnce(() => Promise.resolve(taxProfile));

      await TaxProfileController.updateTaxProfile(req, res, next);

      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { taxProfile });
      assert.strictEqual((TaxProfileService.updateTaxProfile as any).mock.callCount(), 1);
    });
  });

  describe('deleteTaxProfile', () => {
    it('should delete logged user tax profile', async () => {
      req.userId = 'user123';
      req.params = { id: '1' };

      const taxProfile = { id: '1', legalName: 'Test', vatNumber: '123456789', address: '123 Test St', city: 'Test City', zipCode: '12345', country: 'Test Country', createdAt: new Date(), updatedAt: new Date(), userId: 'user123' };
      (TaxProfileService.deleteTaxProfile as any).mock.mockImplementationOnce(() => Promise.resolve(taxProfile));

      await TaxProfileController.deleteTaxProfile(req, res, next);

      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { message: 'Tax profile deleted.' });
      assert.strictEqual((TaxProfileService.deleteTaxProfile as any).mock.callCount(), 1);
    });
  });
});
