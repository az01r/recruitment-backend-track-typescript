import { describe, it, mock, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import { Prisma, TaxProfile } from '../generated/prisma/client.js';
import { TaxProfileDAO } from './tax-profile-dao.js';

describe('TaxProfileDAO', () => {
  let taxProfileDAO: TaxProfileDAO;
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
    taxProfileDAO = new TaxProfileDAO(prismaMock);
  });

  after(() => {
    mock.reset();
  });

  describe('createTaxProfile', () => {
    it('should create a new tax profile', async () => {
      const data: Prisma.TaxProfileCreateInput = { user: { connect: { id: '1' } }, legalName: 'Test Legal Name', vatNumber: 'IT1234567890', address: 'Test Address', city: 'Test City', zipCode: '12345', country: 'Test Country' };
      const prismaTaxProfile: TaxProfile = { id: '1', userId: data.user.connect!.id!, legalName: data.legalName, vatNumber: data.vatNumber, address: data.address, city: data.city, zipCode: data.zipCode, country: data.country, createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') };

      prismaMock.taxProfile.create.mock.mockImplementationOnce(() => Promise.resolve(prismaTaxProfile));

      const result = await taxProfileDAO.createTaxProfile(data);

      const callArgs = prismaMock.taxProfile.create.mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [{ data }]);
      assert.deepStrictEqual(result, prismaTaxProfile);
      assert.strictEqual(prismaMock.taxProfile.create.mock.callCount(), 1);
    });
  });

  describe('findTaxProfiles', () => {
    it('should return tax profiles', async () => {
      const skip = 0;
      const take = 10;
      const where: Prisma.TaxProfileWhereInput = {
        userId: '1',
        legalName: { contains: 'Legal Name' },
        vatNumber: { contains: 'VAT Number' },
        address: { contains: 'Address' },
        city: { contains: 'City' },
        country: { contains: 'Country' },
        zipCode: { contains: '12345' },
        createdAt: { gte: new Date('2025-01-01T00:00:00.000Z'), lte: new Date('2025-12-31T00:00:00.000Z') },
        updatedAt: { gte: new Date('2025-01-01T00:00:00.000Z'), lte: new Date('2025-12-31T00:00:00.000Z') },
      };
      const prismaTaxProfiles: TaxProfile[] = [
        { id: '1', userId: '1', legalName: 'Legal Name', vatNumber: 'VAT Number', address: 'Address', city: 'City', zipCode: '12345', country: 'Country', createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') },
        { id: '2', userId: '1', legalName: 'Legal Name', vatNumber: 'VAT Number', address: 'Address', city: 'City', zipCode: '12345', country: 'Country', createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') },
      ];

      prismaMock.taxProfile.findMany.mock.mockImplementationOnce(() => Promise.resolve(prismaTaxProfiles));

      const result = await taxProfileDAO.findTaxProfiles(where, skip, take);

      const callArgs = prismaMock.taxProfile.findMany.mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [{ where, skip, take, orderBy: { updatedAt: 'desc' } }]);
      assert.deepStrictEqual(result, prismaTaxProfiles);
      assert.strictEqual(prismaMock.taxProfile.findMany.mock.callCount(), 1);
    });
  });

  describe('findTaxProfile', () => {
    it('should find a tax profile by taxProfileId and userId', async () => {
      const where: Prisma.TaxProfileWhereUniqueInput = { id: '1', userId: '1' };
      const prismaTaxProfile: TaxProfile = { id: '1', userId: '1', legalName: 'Test Legal Name', vatNumber: 'IT1234567890', address: 'Test Address', city: 'Test City', zipCode: '12345', country: 'Test Country', createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') };

      prismaMock.taxProfile.findUnique.mock.mockImplementationOnce(() => Promise.resolve(prismaTaxProfile));

      const result = await taxProfileDAO.findTaxProfile(where);

      const callArgs = prismaMock.taxProfile.findUnique.mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [{ where }]);
      assert.deepStrictEqual(result, prismaTaxProfile);
      assert.strictEqual(prismaMock.taxProfile.findUnique.mock.callCount(), 1);
    });
  });

  describe('updateTaxProfile', () => {
    it('should update a tax profile', async () => {
      const where: Prisma.TaxProfileWhereUniqueInput = { id: '1', userId: '1' };
      const data: Prisma.TaxProfileUpdateWithoutUserInput = { legalName: 'updatedLegalName', vatNumber: 'updatedVatNumber', address: 'updatedAddress', city: 'updatedCity', zipCode: 'updatedZipCode', country: 'updatedCountry' };
      const prismaTaxProfile: TaxProfile = { id: '1', legalName: 'updatedLegalName', vatNumber: 'updatedVatNumber', address: 'updatedAddress', city: 'updatedCity', zipCode: 'updatedZipCode', country: 'updatedCountry', createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z'), userId: '1' };

      prismaMock.taxProfile.update.mock.mockImplementationOnce(() => Promise.resolve(prismaTaxProfile));

      const result = await taxProfileDAO.updateTaxProfile(where, data);

      const callArgs = prismaMock.taxProfile.update.mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [{ where, data }]);
      assert.deepStrictEqual(result, prismaTaxProfile);
      assert.strictEqual(prismaMock.taxProfile.update.mock.callCount(), 1);
    });
  });

  describe('deleteTaxProfile', () => {
    it('should delete a tax profile', async () => {
      const where: Prisma.TaxProfileWhereUniqueInput = { id: '1', userId: '1' };
      const prismaTaxProfile: TaxProfile = { id: '1', legalName: 'Test Legal Name', vatNumber: 'IT1234567890', address: 'Test Address', city: 'Test City', zipCode: '12345', country: 'Test Country', createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z'), userId: '1' };

      prismaMock.taxProfile.delete.mock.mockImplementationOnce(() => Promise.resolve(prismaTaxProfile));

      const result = await taxProfileDAO.deleteTaxProfile(where);

      const callArgs = prismaMock.taxProfile.delete.mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [{ where }]);
      assert.deepStrictEqual(result, prismaTaxProfile);
      assert.strictEqual(prismaMock.taxProfile.delete.mock.callCount(), 1);
    });
  });
});
