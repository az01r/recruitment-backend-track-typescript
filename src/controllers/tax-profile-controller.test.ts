import { describe, it, mock, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import TaxProfileController from './tax-profile-controller.js';
import TaxProfileService from '../services/tax-profile-service.js';
import { TAX_PROFILE_DELETED } from '../utils/constants.js';
import { CreateTaxProfileDTO, ReadTaxProfileOptionsDto, ReadUniqueTaxProfileDto, TaxProfileResponseDTO, UpdateTaxProfileDto } from '../types/tax-profile-dto.js';

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

  describe('createTaxProfile', () => {
    it('should create a new tax profile', async () => {
      req.body = { legalName: 'Legal Name', vatNumber: 'VAT Number', address: 'Address', city: 'City', country: 'Country', zipCode: '12345' };
      const taxProfileDto: CreateTaxProfileDTO = { userId: req.userId!, legalName: req.body.legalName, vatNumber: req.body.vatNumber, address: req.body.address, city: req.body.city, zipCode: req.body.zipCode, country: req.body.country };
      const taxProfileResponseDTO: TaxProfileResponseDTO = { id: '1', userId: req.userId, legalName: taxProfileDto.legalName, vatNumber: taxProfileDto.vatNumber, address: taxProfileDto.address, city: taxProfileDto.city, zipCode: taxProfileDto.zipCode, country: taxProfileDto.country, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' };

      (TaxProfileService.createTaxProfile as any).mock.mockImplementationOnce(() => Promise.resolve(taxProfileResponseDTO));

      await TaxProfileController.createTaxProfile(req, res, next);

      const callArgs = (TaxProfileService.createTaxProfile as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [taxProfileDto]);
      assert.strictEqual(res.statusCode, 201);
      assert.deepStrictEqual(res.jsonData, { taxProfile: taxProfileResponseDTO });
      assert.strictEqual((TaxProfileService.createTaxProfile as any).mock.callCount(), 1);
    });
  });

  describe('getTaxProfiles', () => {
    it('should get tax profiles filtered by query params', async () => {
      req.query = { legalName: 'Legal Name', vatNumber: 'VAT Number', address: 'Address', city: 'City', country: 'Country', zipCode: '12345', gteCreatedAt: '2025-01-01T00:00:00.000Z', lteCreatedAt: '2025-12-31T00:00:00.000Z', gteUpdatedAt: '2025-01-01T00:00:00.000Z', lteUpdatedAt: '2025-12-31T00:00:00.000Z', skip: '10', take: '20' };
      const readTaxProfileOptionsDto: ReadTaxProfileOptionsDto = { userId: req.userId!, legalName: req.query.legalName, vatNumber: req.query.vatNumber, address: req.query.address, city: req.query.city, country: req.query.country, zipCode: req.query.zipCode, gteCreatedAt: req.query.gteCreatedAt, lteCreatedAt: req.query.lteCreatedAt, gteUpdatedAt: req.query.gteUpdatedAt, lteUpdatedAt: req.query.lteUpdatedAt, skip: Number(req.query.skip), take: Number(req.query.take) };
      const taxProfilesResponseDTO: TaxProfileResponseDTO[] = [
        { id: '1', userId: req.userId, legalName: readTaxProfileOptionsDto.legalName!, vatNumber: readTaxProfileOptionsDto.vatNumber!, address: readTaxProfileOptionsDto.address!, city: readTaxProfileOptionsDto.city!, zipCode: readTaxProfileOptionsDto.zipCode!, country: readTaxProfileOptionsDto.country!, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
        { id: '2', userId: req.userId, legalName: readTaxProfileOptionsDto.legalName!, vatNumber: readTaxProfileOptionsDto.vatNumber!, address: readTaxProfileOptionsDto.address!, city: readTaxProfileOptionsDto.city!, zipCode: readTaxProfileOptionsDto.zipCode!, country: readTaxProfileOptionsDto.country!, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
      ];

      (TaxProfileService.findTaxProfiles as any).mock.mockImplementationOnce(() => Promise.resolve(taxProfilesResponseDTO));

      await TaxProfileController.getTaxProfiles(req, res, next);

      const callArgs = (TaxProfileService.findTaxProfiles as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [readTaxProfileOptionsDto]);
      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { taxProfiles: taxProfilesResponseDTO });
      assert.strictEqual((TaxProfileService.findTaxProfiles as any).mock.callCount(), 1);
    });
  });

  describe('getTaxProfile', () => {
    it('should get a tax profile using tax profile id and user id', async () => {
      req.params = { id: '1' };
      const taxProfileDto: ReadUniqueTaxProfileDto = { id: req.params.id, userId: req.userId! };
      const taxProfileResponseDTO: TaxProfileResponseDTO = { id: req.params.id, userId: req.userId!, legalName: 'Legal Name', vatNumber: 'VAT Number', address: 'Address', city: 'City', country: 'Country', zipCode: '12345', createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' };
      (TaxProfileService.findTaxProfile as any).mock.mockImplementationOnce(() => Promise.resolve(taxProfileResponseDTO));

      await TaxProfileController.getTaxProfile(req, res, next);

      const callArgs = (TaxProfileService.findTaxProfile as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [taxProfileDto]);
      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { taxProfile: taxProfileResponseDTO });
      assert.strictEqual((TaxProfileService.findTaxProfile as any).mock.callCount(), 1);
    });
  });

  describe('updateTaxProfile', () => {
    it('should update a tax profile using tax profile id and user id', async () => {
      req.params = { id: '1' };
      req.body = { legalName: 'updatedLegalName', vatNumber: 'updatedVatNumber', address: 'updatedAddress', city: 'updatedCity', zipCode: 'updatedZipCode', country: 'updatedCountry' };
      const taxProfileDto: UpdateTaxProfileDto = { id: req.params.id, userId: req.userId, legalName: req.body.legalName, vatNumber: req.body.vatNumber, address: req.body.address, city: req.body.city, zipCode: req.body.zipCode, country: req.body.country };
      const taxProfileResponseDTO: TaxProfileResponseDTO = { id: '1', userId: req.userId, legalName: 'updatedLegalName', vatNumber: 'updatedVatNumber', address: 'updatedAddress', city: 'updatedCity', zipCode: 'updatedZipCode', country: 'updatedCountry', createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' };
      (TaxProfileService.updateTaxProfile as any).mock.mockImplementationOnce(() => Promise.resolve(taxProfileResponseDTO));

      await TaxProfileController.updateTaxProfile(req, res, next);

      const callArgs = (TaxProfileService.updateTaxProfile as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [taxProfileDto]);
      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { taxProfile: taxProfileResponseDTO });
      assert.strictEqual((TaxProfileService.updateTaxProfile as any).mock.callCount(), 1);
    });
  });

  describe('deleteTaxProfile', () => {
    it('should delete logged user tax profile', async () => {
      req.params = { id: '1' };
      const taxProfileDto: ReadUniqueTaxProfileDto = { id: req.params.id, userId: req.userId };

      (TaxProfileService.deleteTaxProfile as any).mock.mockImplementationOnce(() => Promise.resolve(void 0));

      await TaxProfileController.deleteTaxProfile(req, res, next);

      const callArgs = (TaxProfileService.deleteTaxProfile as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [taxProfileDto]);
      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { message: TAX_PROFILE_DELETED });
      assert.strictEqual((TaxProfileService.deleteTaxProfile as any).mock.callCount(), 1);
    });
  });
});
