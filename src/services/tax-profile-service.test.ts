import { describe, it, mock, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import { TaxProfileService } from "./tax-profile-service.js";
import { Prisma } from '../generated/prisma/client.js';
import ReqValidationError from '../types/request-validation-error.js';

describe('TaxProfileService', () => {
  let taxProfileService: TaxProfileService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      taxProfile: {
        create: mock.fn(),
        findMany: mock.fn(),
        findUnique: mock.fn(),
        update: mock.fn(),
        delete: mock.fn(),
      },
    };
    taxProfileService = new TaxProfileService(prismaMock);
  });

  after(() => {
    mock.reset();
  });

  describe('createTaxProfile', () => {
    it('should create a new tax profile', async () => {
      const data: Prisma.TaxProfileCreateInput = { user: { connect: { id: '1' } }, legalName: 'Test Legal Name', vatNumber: 'IT1234567890', address: 'Test Address', city: 'Test City', zipCode: '12345', country: 'Test Country' };
      const expectedResult = { id: '1', createdAt: new Date(), updatedAt: new Date(), ...data };

      prismaMock.taxProfile.create.mock.mockImplementationOnce(() => Promise.resolve(expectedResult));

      const result = await taxProfileService.createTaxProfile(data);

      const callArgs = prismaMock.taxProfile.create.mock.calls[0].arguments[0];
      assert.deepStrictEqual(callArgs, { data });
      assert.deepStrictEqual(result, expectedResult);
      assert.strictEqual(prismaMock.taxProfile.create.mock.callCount(), 1);
    });
  });

  describe('findTaxProfiles', () => {
    it('should find all tax profiles of an user', async () => {
      const skip = 0;
      const take = 10;
      const orderBy = { createdAt: 'desc' };
      const where: Prisma.TaxProfileWhereInput = { userId: '1' };

      const taxProfiles = [{ user: { connect: { id: '1' } }, id: '1', legalName: 'Test Legal Name', vatNumber: 'IT1234567890', address: 'Test Address', city: 'Test City', zipCode: '12345', country: 'Test Country', createdAt: new Date(), updatedAt: new Date() }];
      prismaMock.taxProfile.findMany.mock.mockImplementationOnce(() => Promise.resolve(taxProfiles));

      const result = await taxProfileService.findTaxProfiles(where, skip, take);

      const callArgs = prismaMock.taxProfile.findMany.mock.calls[0].arguments[0];
      assert.deepStrictEqual(callArgs, { where, skip, take, orderBy });
      assert.deepStrictEqual(result, taxProfiles);
      assert.strictEqual(prismaMock.taxProfile.findMany.mock.callCount(), 1);
    });
  });

  describe('findTaxProfile', () => {
    it('should find a tax profile by taxProfileId and userId', async () => {
      const where: Prisma.TaxProfileWhereUniqueInput = { id: '1', userId: '1' };
      const taxProfile = { user: { connect: { id: '1' } }, id: '1', legalName: 'Test Legal Name', vatNumber: 'IT1234567890', address: 'Test Address', city: 'Test City', zipCode: '12345', country: 'Test Country', createdAt: new Date(), updatedAt: new Date() };

      prismaMock.taxProfile.findUnique.mock.mockImplementationOnce(() => Promise.resolve(taxProfile));

      const result = await taxProfileService.findTaxProfile(where);

      const callArgs = prismaMock.taxProfile.findUnique.mock.calls[0].arguments[0];
      assert.deepStrictEqual(callArgs, { where });
      assert.deepStrictEqual(result, taxProfile);
      assert.strictEqual(prismaMock.taxProfile.findUnique.mock.callCount(), 1);
    });
  });

  describe('updateTaxProfile', () => {
    it('should update a tax profile', async () => {
      const where: Prisma.TaxProfileWhereUniqueInput = { id: '1', userId: '1' };
      const data: Prisma.TaxProfileUpdateWithoutUserInput = { legalName: 'Updated Legal Name' };

      const updatedTaxProfile = { user: { connect: { id: '1' } }, id: '1', legalName: 'Updated Legal Name', vatNumber: 'IT1234567890', address: 'Test Address', city: 'Test City', zipCode: '12345', country: 'Test Country', createdAt: new Date(), updatedAt: new Date() };
      prismaMock.taxProfile.findUnique.mock.mockImplementationOnce(() => Promise.resolve(updatedTaxProfile));
      prismaMock.taxProfile.update.mock.mockImplementationOnce(() => Promise.resolve(updatedTaxProfile));

      const result = await taxProfileService.updateTaxProfile(where, data);

      const callArgs = prismaMock.taxProfile.update.mock.calls[0].arguments[0];
      assert.deepStrictEqual(callArgs, { where, data });
      assert.deepStrictEqual(result, updatedTaxProfile);
      assert.strictEqual(prismaMock.taxProfile.update.mock.callCount(), 1);
    });

    it('should throw error if tax profile was not found or does not belong to user', async () => {
      const where: Prisma.TaxProfileWhereUniqueInput = { id: 'notFound', userId: '1' };
      const data: Prisma.TaxProfileUpdateWithoutUserInput = { legalName: 'Updated Legal Name' };

      prismaMock.taxProfile.findUnique.mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await taxProfileService.updateTaxProfile(where, data);
        },
        (error: any) => {
          assert(error instanceof ReqValidationError);
          assert.strictEqual(error.message, "Tax Profile not found or does not belong to user.");
          assert.strictEqual(error.statusCode, 404);
          return true;
        }
      );
      assert.strictEqual(prismaMock.taxProfile.findUnique.mock.callCount(), 1);
      assert.strictEqual(prismaMock.taxProfile.update.mock.callCount(), 0);
    });
  });

  describe('deleteTaxProfile', () => {
    it('should delete a tax profile', async () => {
      const where: Prisma.TaxProfileWhereUniqueInput = { id: '1', userId: '1' };

      const deletedTaxProfile = { user: { connect: { id: '1' } }, id: '1', legalName: 'Test Legal Name', vatNumber: 'IT1234567890', address: 'Test Address', city: 'Test City', zipCode: '12345', country: 'Test Country', createdAt: new Date(), updatedAt: new Date() };
      prismaMock.taxProfile.findUnique.mock.mockImplementationOnce(() => Promise.resolve(deletedTaxProfile));
      prismaMock.taxProfile.delete.mock.mockImplementationOnce(() => Promise.resolve(deletedTaxProfile));

      const result = await taxProfileService.deleteTaxProfile(where);

      const callArgs = prismaMock.taxProfile.delete.mock.calls[0].arguments[0];
      assert.deepStrictEqual(callArgs, { where });
      assert.deepStrictEqual(result, deletedTaxProfile);
      assert.strictEqual(prismaMock.taxProfile.delete.mock.callCount(), 1);
    });

    it('should throw error if tax profile was not found or does not belong to user', async () => {
      const where: Prisma.TaxProfileWhereUniqueInput = { id: 'notFound', userId: '1' };

      prismaMock.taxProfile.findUnique.mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await taxProfileService.deleteTaxProfile(where);
        },
        (error: any) => {
          assert(error instanceof ReqValidationError);
          assert.strictEqual(error.message, "Tax Profile not found or does not belong to user.");
          assert.strictEqual(error.statusCode, 404);
          return true;
        }
      );
      assert.strictEqual(prismaMock.taxProfile.findUnique.mock.callCount(), 1);
      assert.strictEqual(prismaMock.taxProfile.delete.mock.callCount(), 0);
    });
  });
});
