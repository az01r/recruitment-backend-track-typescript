import { describe, it, mock, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import TaxProfileController from './tax-profile-controller.js';
import TaxProfileService from '../services/tax-profile-service.js';
import { Prisma } from '../generated/prisma/client.js';
import { TAX_PROFILE_DELETED, TAX_PROFILE_NOT_FOUND } from '../utils/constants.js';

mock.method(TaxProfileService, 'createTaxProfile');
mock.method(TaxProfileService, 'findTaxProfiles');
mock.method(TaxProfileService, 'findTaxProfile');
mock.method(TaxProfileService, 'updateTaxProfile');
mock.method(TaxProfileService, 'deleteTaxProfile');

describe('TaxProfileController', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    (TaxProfileService.createTaxProfile as any).mock.resetCalls();
    (TaxProfileService.findTaxProfiles as any).mock.resetCalls();
    (TaxProfileService.findTaxProfile as any).mock.resetCalls();
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
      (TaxProfileService.findTaxProfiles as any).mock.mockImplementationOnce(() => Promise.resolve(taxProfiles));

      await TaxProfileController.getTaxProfiles(req, res, next);

      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { taxProfiles });
      assert.strictEqual((TaxProfileService.findTaxProfiles as any).mock.callCount(), 1);
    });

    it('should use query params to filter tax profiles', async () => {
      req.query = { userId: 'user123', skip: '10', take: '20', legalName: 'Legal Name', vatNumber: 'VAT Number', city: 'City', country: 'Country', zipCode: '12345' };
      const where: Prisma.TaxProfileWhereInput = { userId: { equals: 'user123' }, legalName: { contains: 'Legal Name' }, vatNumber: { contains: 'VAT Number' }, city: { contains: 'City' }, country: { contains: 'Country' }, zipCode: { contains: '12345' } };

      (TaxProfileService.findTaxProfiles as any).mock.mockImplementationOnce(() => Promise.resolve([]));

      await TaxProfileController.getTaxProfiles(req, res, next);

      const callArgs = (TaxProfileService.findTaxProfiles as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [where, Number(req.query.skip), Number(req.query.take)]);
    });
  });

  describe('getTaxProfile', () => {
    it('should get logged user tax profile by tax profile id', async () => {
      req.userId = 'user123';
      req.params = { id: '1' };

      const taxProfile = { id: '1', legalName: 'Test', vatNumber: '123456789', address: '123 Test St', city: 'Test City', zipCode: '12345', country: 'Test Country', createdAt: new Date(), updatedAt: new Date(), userId: 'user123' };
      (TaxProfileService.findTaxProfile as any).mock.mockImplementationOnce(() => Promise.resolve(taxProfile));

      await TaxProfileController.getTaxProfile(req, res, next);

      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { taxProfile });
      assert.strictEqual((TaxProfileService.findTaxProfile as any).mock.callCount(), 1);
    });

    it('should throw error 404 if tax profile was not found or does not belong to user', async () => {
      req.userId = 'user123';
      req.params = { id: 'notFound' };
      (TaxProfileService.findTaxProfile as any).mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await TaxProfileController.getTaxProfile(req, res, next);
        },
        (error: any) => {
          assert(error instanceof Error);
          assert.strictEqual(error.message, TAX_PROFILE_NOT_FOUND);
          assert.strictEqual(res.statusCode, 404);
          return true;
        }
      );
      assert.strictEqual((TaxProfileService.findTaxProfile as any).mock.callCount(), 1);
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
      assert.deepStrictEqual(res.jsonData, { message: TAX_PROFILE_DELETED });
      assert.strictEqual((TaxProfileService.deleteTaxProfile as any).mock.callCount(), 1);
    });
  });
});
