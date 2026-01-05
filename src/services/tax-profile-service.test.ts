import { describe, it, mock, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import TaxProfileService from "./tax-profile-service.js";
import { Prisma, TaxProfile } from '../generated/prisma/client.js';
import { ResourceNotFoundError } from '../types/error.js';
import { TAX_PROFILE_NOT_FOUND } from '../utils/constants.js';
import TaxProfileDAO from '../daos/tax-profile-dao.js';
import { CreateTaxProfileDTO, ReadTaxProfileOptionsDto, ReadUniqueTaxProfileDto, TaxProfileResponseDTO, UpdateTaxProfileDto } from '../types/tax-profile-dto.js';

mock.method(TaxProfileDAO, 'createTaxProfile');
mock.method(TaxProfileDAO, 'findTaxProfiles');
mock.method(TaxProfileDAO, 'findTaxProfile');
mock.method(TaxProfileDAO, 'updateTaxProfile');
mock.method(TaxProfileDAO, 'deleteTaxProfile');

describe('TaxProfileService', () => {
  beforeEach(() => {
    (TaxProfileDAO.createTaxProfile as any).mock.resetCalls();
    (TaxProfileDAO.findTaxProfiles as any).mock.resetCalls();
    (TaxProfileDAO.findTaxProfile as any).mock.resetCalls();
    (TaxProfileDAO.updateTaxProfile as any).mock.resetCalls();
    (TaxProfileDAO.deleteTaxProfile as any).mock.resetCalls();
  });

  after(() => {
    mock.reset();
  });

  describe('createTaxProfile', () => {
    it('should create a new tax profile', async () => {
      const taxProfileDto: CreateTaxProfileDTO = { userId: '1', legalName: 'Legal Name', vatNumber: 'VAT Number', address: 'Address', city: 'City', zipCode: '12345', country: 'Country' };
      const taxProfileData: Prisma.TaxProfileCreateInput = { user: { connect: { id: taxProfileDto.userId } }, legalName: taxProfileDto.legalName, vatNumber: taxProfileDto.vatNumber, address: taxProfileDto.address, city: taxProfileDto.city, zipCode: taxProfileDto.zipCode, country: taxProfileDto.country };
      const prismaTaxProfile: TaxProfile = { ...taxProfileDto, id: '1', createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') };
      const taxProfileResponseDTO: TaxProfileResponseDTO = { ...taxProfileDto, id: '1', createdAt: prismaTaxProfile.createdAt.toISOString(), updatedAt: prismaTaxProfile.updatedAt.toISOString() };

      (TaxProfileDAO.createTaxProfile as any).mock.mockImplementationOnce(() => Promise.resolve(prismaTaxProfile));

      const result = await TaxProfileService.createTaxProfile(taxProfileDto);

      const callArgs = (TaxProfileDAO.createTaxProfile as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [taxProfileData]);
      assert.deepStrictEqual(result, taxProfileResponseDTO);
      assert.strictEqual((TaxProfileDAO.createTaxProfile as any).mock.callCount(), 1);
    });
  });

  describe('findTaxProfiles', () => {
    it('should find tax profiles using filters', async () => {
      const skip = 10;
      const take = 20;
      const userId = '1';
      const readTaxProfileOptionsDto: ReadTaxProfileOptionsDto = { userId, legalName: 'Legal Name', vatNumber: 'VAT Number', address: 'Address', city: 'City', country: 'Country', zipCode: '12345', gteCreatedAt: '2025-01-01T00:00:00.000Z', lteCreatedAt: '2025-12-31T00:00:00.000Z', gteUpdatedAt: '2025-01-01T00:00:00.000Z', lteUpdatedAt: '2025-12-31T00:00:00.000Z', skip, take };
      const where: Prisma.TaxProfileWhereInput = {
        userId: readTaxProfileOptionsDto.userId,
        legalName: { contains: readTaxProfileOptionsDto.legalName },
        vatNumber: { contains: readTaxProfileOptionsDto.vatNumber },
        address: { contains: readTaxProfileOptionsDto.address },
        city: { contains: readTaxProfileOptionsDto.city },
        country: { contains: readTaxProfileOptionsDto.country },
        zipCode: { contains: readTaxProfileOptionsDto.zipCode },
        createdAt: { gte: readTaxProfileOptionsDto.gteCreatedAt, lte: readTaxProfileOptionsDto.lteCreatedAt },
        updatedAt: { gte: readTaxProfileOptionsDto.gteUpdatedAt, lte: readTaxProfileOptionsDto.lteUpdatedAt },
      };
      const prismaTaxProfiles: TaxProfile[] = [
        { id: '1', legalName: readTaxProfileOptionsDto.legalName!, vatNumber: readTaxProfileOptionsDto.vatNumber!, address: readTaxProfileOptionsDto.address!, city: readTaxProfileOptionsDto.city!, zipCode: readTaxProfileOptionsDto.zipCode!, country: readTaxProfileOptionsDto.country!, createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z'), userId },
        { id: '2', legalName: readTaxProfileOptionsDto.legalName!, vatNumber: readTaxProfileOptionsDto.vatNumber!, address: readTaxProfileOptionsDto.address!, city: readTaxProfileOptionsDto.city!, zipCode: readTaxProfileOptionsDto.zipCode!, country: readTaxProfileOptionsDto.country!, createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z'), userId },
      ];
      const taxProfilesResponseDTO: TaxProfileResponseDTO[] = [
        { id: '1', legalName: readTaxProfileOptionsDto.legalName!, vatNumber: readTaxProfileOptionsDto.vatNumber!, address: readTaxProfileOptionsDto.address!, city: readTaxProfileOptionsDto.city!, zipCode: readTaxProfileOptionsDto.zipCode!, country: readTaxProfileOptionsDto.country!, createdAt: new Date('2025-01-01T00:00:00.000Z').toISOString(), updatedAt: new Date('2025-01-01T00:00:00.000Z').toISOString(), userId },
        { id: '2', legalName: readTaxProfileOptionsDto.legalName!, vatNumber: readTaxProfileOptionsDto.vatNumber!, address: readTaxProfileOptionsDto.address!, city: readTaxProfileOptionsDto.city!, zipCode: readTaxProfileOptionsDto.zipCode!, country: readTaxProfileOptionsDto.country!, createdAt: new Date('2025-01-01T00:00:00.000Z').toISOString(), updatedAt: new Date('2025-01-01T00:00:00.000Z').toISOString(), userId },
      ];

      (TaxProfileDAO.findTaxProfiles as any).mock.mockImplementationOnce(() => Promise.resolve(prismaTaxProfiles));

      const result = await TaxProfileService.findTaxProfiles(readTaxProfileOptionsDto);

      const callArgs = (TaxProfileDAO.findTaxProfiles as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [where, skip, take]);
      assert.deepStrictEqual(result, taxProfilesResponseDTO);
      assert.strictEqual((TaxProfileDAO.findTaxProfiles as any).mock.callCount(), 1);
    });
  });

  describe('findTaxProfile', () => {
    it('should find a tax profile using taxProfileId and userId', async () => {
      const taxProfileDto: ReadUniqueTaxProfileDto = { id: '1', userId: '1' };
      const where: Prisma.TaxProfileWhereUniqueInput = { id: taxProfileDto.id, userId: taxProfileDto.userId };
      const prismaTaxProfile: TaxProfile = { id: taxProfileDto.id, legalName: 'Legal Name', vatNumber: 'VAT Number', address: 'Address', city: 'City', zipCode: '12345', country: 'Country', createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z'), userId: taxProfileDto.userId };
      const taxProfileResponseDTO: TaxProfileResponseDTO = { ...prismaTaxProfile, createdAt: prismaTaxProfile.createdAt.toISOString(), updatedAt: prismaTaxProfile.updatedAt.toISOString() };

      (TaxProfileDAO.findTaxProfile as any).mock.mockImplementationOnce(() => Promise.resolve(prismaTaxProfile));

      const result = await TaxProfileService.findTaxProfile(taxProfileDto);

      const callArgs = (TaxProfileDAO.findTaxProfile as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [where]);
      assert.deepStrictEqual(result, taxProfileResponseDTO);
      assert.strictEqual((TaxProfileDAO.findTaxProfile as any).mock.callCount(), 1);
    });

    it('should throw error if no tax profile was found', async () => {
      const taxProfileDto: ReadUniqueTaxProfileDto = { id: '1', userId: '1' };

      (TaxProfileDAO.findTaxProfile as any).mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await TaxProfileService.findTaxProfile(taxProfileDto);
        },
        (error: any) => {
          assert(error instanceof ResourceNotFoundError);
          assert.strictEqual(error.message, TAX_PROFILE_NOT_FOUND);
          return true;
        }
      );
    });
  });

  describe('updateTaxProfile', () => {
    it('should update a tax profile', async () => {
      const taxProfileDto: UpdateTaxProfileDto = { id: '1', userId: '1', legalName: 'updatedLegalName', vatNumber: 'updatedVatNumber', address: 'updatedAddress', city: 'updatedCity', zipCode: 'updatedZipCode', country: 'updatedCountry' };
      const prismaTaxProfile: TaxProfile = { id: taxProfileDto.id, userId: taxProfileDto.userId, legalName: taxProfileDto.legalName!, vatNumber: taxProfileDto.vatNumber!, address: taxProfileDto.address!, city: taxProfileDto.city!, zipCode: taxProfileDto.zipCode!, country: taxProfileDto.country!, createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') };
      const where: Prisma.TaxProfileWhereUniqueInput = { id: taxProfileDto.id, userId: taxProfileDto.userId };
      const data: Prisma.TaxProfileUpdateWithoutUserInput = { legalName: taxProfileDto.legalName, vatNumber: taxProfileDto.vatNumber, address: taxProfileDto.address, city: taxProfileDto.city, zipCode: taxProfileDto.zipCode, country: taxProfileDto.country };
      const taxProfileResponseDTO: TaxProfileResponseDTO = { id: prismaTaxProfile.id, legalName: prismaTaxProfile.legalName!, vatNumber: prismaTaxProfile.vatNumber!, address: prismaTaxProfile.address!, city: prismaTaxProfile.city!, zipCode: prismaTaxProfile.zipCode!, country: prismaTaxProfile.country!, createdAt: prismaTaxProfile.createdAt.toISOString(), updatedAt: prismaTaxProfile.updatedAt.toISOString(), userId: prismaTaxProfile.userId };

      (TaxProfileDAO.findTaxProfile as any).mock.mockImplementationOnce(() => Promise.resolve(prismaTaxProfile));
      (TaxProfileDAO.updateTaxProfile as any).mock.mockImplementationOnce(() => Promise.resolve(prismaTaxProfile));

      const result = await TaxProfileService.updateTaxProfile(taxProfileDto);

      const findCallArgs = (TaxProfileDAO.findTaxProfile as any).mock.calls[0].arguments;
      assert.deepStrictEqual(findCallArgs, [where]);
      const updateCallArgs = (TaxProfileDAO.updateTaxProfile as any).mock.calls[0].arguments;
      assert.deepStrictEqual(updateCallArgs, [where, data]);
      assert.deepStrictEqual(result, taxProfileResponseDTO);
      assert.strictEqual((TaxProfileDAO.updateTaxProfile as any).mock.callCount(), 1);
      assert.strictEqual((TaxProfileDAO.findTaxProfile as any).mock.callCount(), 1);
    });

    it('should throw error if tax profile was not found or does not belong to user', async () => {
      const taxProfileDto: ReadUniqueTaxProfileDto = { id: '1', userId: '1' };

      (TaxProfileDAO.findTaxProfile as any).mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await TaxProfileService.updateTaxProfile(taxProfileDto);
        },
        (error: any) => {
          assert(error instanceof ResourceNotFoundError);
          assert.strictEqual(error.message, TAX_PROFILE_NOT_FOUND);
          return true;
        }
      );
      assert.strictEqual((TaxProfileDAO.findTaxProfile as any).mock.callCount(), 1);
      assert.strictEqual((TaxProfileDAO.updateTaxProfile as any).mock.callCount(), 0);
    });
  });

  describe('deleteTaxProfile', () => {
    it('should delete a tax profile', async () => {
      const taxProfileDto: ReadUniqueTaxProfileDto = { id: '1', userId: '1', };
      const prismaTaxProfile: TaxProfile = { id: taxProfileDto.id, userId: taxProfileDto.userId, legalName: 'Legal Name', vatNumber: 'Vat Number', address: 'Address', city: 'City', zipCode: 'Zip Code', country: 'Country', createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') };
      const where: Prisma.TaxProfileWhereUniqueInput = { id: taxProfileDto.id, userId: taxProfileDto.userId };

      (TaxProfileDAO.findTaxProfile as any).mock.mockImplementationOnce(() => Promise.resolve(prismaTaxProfile));
      (TaxProfileDAO.deleteTaxProfile as any).mock.mockImplementationOnce(() => Promise.resolve(prismaTaxProfile));

      await TaxProfileService.deleteTaxProfile(taxProfileDto);

      const findCallArgs = (TaxProfileDAO.findTaxProfile as any).mock.calls[0].arguments;
      assert.deepStrictEqual(findCallArgs, [where]);
      const deleteCallArgs = (TaxProfileDAO.deleteTaxProfile as any).mock.calls[0].arguments;
      assert.deepStrictEqual(deleteCallArgs, [where]);
      assert.strictEqual((TaxProfileDAO.deleteTaxProfile as any).mock.callCount(), 1);
    });

    it('should throw error if tax profile was not found or does not belong to user', async () => {
      const taxProfileDto: ReadUniqueTaxProfileDto = { id: '1', userId: '1' };

      (TaxProfileDAO.findTaxProfile as any).mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await TaxProfileService.deleteTaxProfile(taxProfileDto);
        },
        (error: any) => {
          assert(error instanceof ResourceNotFoundError);
          assert.strictEqual(error.message, TAX_PROFILE_NOT_FOUND);
          return true;
        }
      );
      assert.strictEqual((TaxProfileDAO.findTaxProfile as any).mock.callCount(), 1);
      assert.strictEqual((TaxProfileDAO.deleteTaxProfile as any).mock.callCount(), 0);
    });
  });
});
