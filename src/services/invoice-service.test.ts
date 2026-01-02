import { describe, it, mock, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import InvoiceService from "./invoice-service.js";
import { Prisma, InvoiceStatus, Currency, Invoice, TaxProfile } from '../generated/prisma/client.js';
import ReqValidationError from "../types/request-validation-error.js";
import { INVOICE_NOT_FOUND, TAX_PROFILE_NOT_FOUND } from '../utils/constants.js';
import InvoiceDAO from '../daos/invoice-dao.js';
import { ReadUniqueTaxProfileDto } from '../types/tax-profile-dto.js';
import { CreateInvoiceDto, ReadInvoiceOptionsDto, ReadUniqueInvoiceDto, ResponseInvoiceDTO, UpdateInvoiceDto } from '../types/invoice-dto.js';
import TaxProfileDAO from '../daos/tax-profile-dao.js';

mock.method(InvoiceDAO, 'createInvoice');
mock.method(InvoiceDAO, 'findInvoices');
mock.method(InvoiceDAO, 'findInvoice');
mock.method(InvoiceDAO, 'updateInvoice');
mock.method(InvoiceDAO, 'deleteInvoice');
mock.method(TaxProfileDAO, 'findTaxProfile');

describe('InvoiceService', () => {

  beforeEach(() => {
    (InvoiceDAO.createInvoice as any).mock.resetCalls();
    (InvoiceDAO.findInvoices as any).mock.resetCalls();
    (InvoiceDAO.findInvoice as any).mock.resetCalls();
    (InvoiceDAO.updateInvoice as any).mock.resetCalls();
    (InvoiceDAO.deleteInvoice as any).mock.resetCalls();
    (TaxProfileDAO.findTaxProfile as any).mock.resetCalls();
  });

  after(() => {
    mock.reset();
  });

  describe('createInvoice', () => {
    it('should create a new invoice', async () => {
      const invoiceDto: CreateInvoiceDto = { taxProfileId: 'taxProfile123', userId: 'user123', amount: 1000, status: InvoiceStatus.PENDING, currency: Currency.EUR };
      const taxProfileUniqueDto: ReadUniqueTaxProfileDto = { id: invoiceDto.taxProfileId, userId: invoiceDto.userId };
      const prismaData: Prisma.InvoiceCreateInput = { amount: invoiceDto.amount, status: invoiceDto.status, currency: invoiceDto.currency, taxProfile: { connect: { id: invoiceDto.taxProfileId, userId: invoiceDto.userId } } };
      const invoiceResponseDto: ResponseInvoiceDTO = { id: 'invoice123', taxProfileId: invoiceDto.taxProfileId, amount: invoiceDto.amount, status: invoiceDto.status, currency: invoiceDto.currency, createdAt: '2025-12-31T00:00:00.000Z', updatedAt: '2025-12-31T00:00:00.000Z' };
      const taxProfile: TaxProfile = {
        id: invoiceDto.taxProfileId,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
        updatedAt: new Date('2025-01-01T00:00:00.000Z'),
        legalName: 'legalName',
        vatNumber: 'vatNumber',
        address: 'address',
        city: 'city',
        zipCode: 'zipCode',
        country: 'country',
        userId: invoiceDto.userId,
      };

      const prismaInvoice: Invoice = {
        id: 'invoice123',
        taxProfileId: invoiceDto.taxProfileId,
        amount: invoiceDto.amount,
        status: invoiceDto.status,
        currency: invoiceDto.currency,
        createdAt: new Date('2025-12-31T00:00:00.000Z'),
        updatedAt: new Date('2025-12-31T00:00:00.000Z')
      };

      (TaxProfileDAO.findTaxProfile as any).mock.mockImplementationOnce(() => Promise.resolve(taxProfile));
      (InvoiceDAO.createInvoice as any).mock.mockImplementationOnce(() => Promise.resolve(prismaInvoice));

      const result = await InvoiceService.createInvoice(invoiceDto);

      const findTaxProfileCallArgs = (TaxProfileDAO.findTaxProfile as any).mock.calls[0].arguments;
      assert.deepStrictEqual(findTaxProfileCallArgs, [taxProfileUniqueDto]);
      const createInvoiceCallArgs = (InvoiceDAO.createInvoice as any).mock.calls[0].arguments;
      assert.deepStrictEqual(createInvoiceCallArgs, [prismaData]);
      assert.deepStrictEqual(result, invoiceResponseDto);
      assert.strictEqual((TaxProfileDAO.findTaxProfile as any).mock.callCount(), 1);
      assert.strictEqual((InvoiceDAO.createInvoice as any).mock.callCount(), 1);
    });

    it('should throw 404 error if tax profile does not exists or does not belong to user', async () => {
      const invoiceDto: CreateInvoiceDto = { taxProfileId: 'notOwnedTaxProfileId', userId: 'user123', amount: 1000, status: InvoiceStatus.PENDING, currency: Currency.EUR };

      (TaxProfileDAO.findTaxProfile as any).mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await InvoiceService.createInvoice(invoiceDto);
        },
        (error: any) => {
          assert(error instanceof ReqValidationError);
          assert.strictEqual(error.message, TAX_PROFILE_NOT_FOUND);
          assert.strictEqual(error.statusCode, 404);
          return true;
        }
      );
      assert.strictEqual((TaxProfileDAO.findTaxProfile as any).mock.callCount(), 1);
      assert.strictEqual((InvoiceDAO.createInvoice as any).mock.callCount(), 0);
    });
  });

  describe('findInvoices', () => {
    it('should find invoices using filters', async () => {
      const invoicesDto: ReadInvoiceOptionsDto = { userId: 'user123', taxProfileId: 'taxProfile123', amount: 1000, status: "PENDING", currency: "EUR", gteCreatedAt: "2025-12-31T00:00:00.000Z", lteCreatedAt: "2026-01-01T00:00:00.000Z", gteUpdatedAt: "2025-12-31T00:00:00.000Z", lteUpdatedAt: "2026-01-01T00:00:00.000Z", skip: 0, take: 10 };
      const where: Prisma.InvoiceWhereInput = { taxProfile: { userId: invoicesDto.userId }, taxProfileId: invoicesDto.taxProfileId, amount: invoicesDto.amount, status: invoicesDto.status, currency: invoicesDto.currency, createdAt: { gte: invoicesDto.gteCreatedAt, lte: invoicesDto.lteCreatedAt }, updatedAt: { gte: invoicesDto.gteUpdatedAt, lte: invoicesDto.lteUpdatedAt } };
      const prismaInvoices: Invoice[] = [
        { id: 'invoice1', taxProfileId: 'taxProfile123', amount: 1000, status: 'PENDING', currency: 'EUR', createdAt: new Date('2025-12-31T00:00:00.000Z'), updatedAt: new Date('2025-12-31T00:00:00.000Z') },
        { id: 'invoice2', taxProfileId: 'taxProfile123', amount: 2000, status: 'PAID', currency: 'USD', createdAt: new Date('2025-12-31T00:00:00.000Z'), updatedAt: new Date('2025-12-31T00:00:00.000Z') }
      ];
      const invoicesResponseDTO: ResponseInvoiceDTO[] = [
        { id: 'invoice1', taxProfileId: 'taxProfile123', amount: 1000, status: 'PENDING', currency: 'EUR', createdAt: "2025-12-31T00:00:00.000Z", updatedAt: "2025-12-31T00:00:00.000Z" },
        { id: 'invoice2', taxProfileId: 'taxProfile123', amount: 2000, status: 'PAID', currency: 'USD', createdAt: "2025-12-31T00:00:00.000Z", updatedAt: "2025-12-31T00:00:00.000Z" }
      ];

      (InvoiceDAO.findInvoices as any).mock.mockImplementationOnce(() => Promise.resolve(prismaInvoices));

      const result = await InvoiceService.findInvoices(invoicesDto);

      const callArgs = (InvoiceDAO.findInvoices as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [where, invoicesDto.skip, invoicesDto.take]);
      assert.deepStrictEqual(result, invoicesResponseDTO);
      assert.strictEqual((InvoiceDAO.findInvoices as any).mock.callCount(), 1);
    });
  });

  describe('findInvoice', () => {
    it('should find an invoice by id and userId', async () => {
      const invoiceDto: ReadUniqueInvoiceDto = { id: 'invoice123', userId: 'user123' };
      const where: Prisma.InvoiceWhereUniqueInput = { id: invoiceDto.id, taxProfile: { userId: invoiceDto.userId } };
      const prismaInvoice: Invoice = { id: invoiceDto.id, taxProfileId: 'taxProfile123', amount: 1000, status: 'PENDING', currency: 'EUR', createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') };
      const invoiceResponseDTO: ResponseInvoiceDTO = {
        id: prismaInvoice.id,
        taxProfileId: prismaInvoice.taxProfileId,
        amount: prismaInvoice.amount,
        status: prismaInvoice.status,
        currency: prismaInvoice.currency,
        createdAt: prismaInvoice.createdAt.toISOString(),
        updatedAt: prismaInvoice.updatedAt.toISOString()
      };

      (InvoiceDAO.findInvoice as any).mock.mockImplementationOnce(() => Promise.resolve(prismaInvoice));

      const result = await InvoiceService.findInvoice(invoiceDto);

      const callArgs = (InvoiceDAO.findInvoice as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [where]);
      assert.deepStrictEqual(result, invoiceResponseDTO);
      assert.strictEqual((InvoiceDAO.findInvoice as any).mock.callCount(), 1);
    });

    it('should throw 404 error if invoice does not exists or does not belong to user', async () => {
      const invoiceDto: ReadUniqueInvoiceDto = { id: 'invoice123', userId: 'user123' };
      const where: Prisma.InvoiceWhereUniqueInput = { id: invoiceDto.id, taxProfile: { userId: invoiceDto.userId } };

      (InvoiceDAO.findInvoice as any).mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await InvoiceService.findInvoice(invoiceDto);
        },
        (error: any) => {
          assert(error instanceof ReqValidationError);
          assert.strictEqual(error.message, INVOICE_NOT_FOUND);
          assert.strictEqual(error.statusCode, 404);
          return true;
        }
      );
      assert.strictEqual((InvoiceDAO.findInvoice as any).mock.callCount(), 1);
    });
  });

  describe('updateInvoice', () => {
    it('should update an invoice', async () => {
      const invoiceDto: UpdateInvoiceDto = { id: 'invoice123', userId: 'user123', amount: 1000, status: "PENDING", currency: "EUR" };
      const readUniqueInvoiceDto: ReadUniqueInvoiceDto = { id: invoiceDto.id, userId: invoiceDto.userId };
      const where: Prisma.InvoiceWhereInput = { id: readUniqueInvoiceDto.id, taxProfile: { userId: readUniqueInvoiceDto.userId } };
      const dataToUpdate: Prisma.InvoiceUpdateWithoutTaxProfileInput = { amount: invoiceDto.amount, status: invoiceDto.status, currency: invoiceDto.currency };
      const prismaInvoice: Invoice = { id: 'invoice123', taxProfileId: 'taxProfile123', amount: 1000, status: 'PENDING', currency: 'EUR', createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') };
      const invoiceResponseDTO: ResponseInvoiceDTO = { id: prismaInvoice.id, taxProfileId: prismaInvoice.taxProfileId, amount: prismaInvoice.amount, status: prismaInvoice.status, currency: prismaInvoice.currency, createdAt: prismaInvoice.createdAt.toISOString(), updatedAt: prismaInvoice.updatedAt.toISOString() };

      (InvoiceDAO.findInvoice as any).mock.mockImplementationOnce(() => Promise.resolve(prismaInvoice));
      (InvoiceDAO.updateInvoice as any).mock.mockImplementationOnce(() => Promise.resolve(prismaInvoice));

      const result = await InvoiceService.updateInvoice(invoiceDto);

      const findCallArgs = (InvoiceDAO.findInvoice as any).mock.calls[0].arguments;
      assert.deepStrictEqual(findCallArgs, [where]);
      const updateCallArgs = (InvoiceDAO.updateInvoice as any).mock.calls[0].arguments;
      assert.deepStrictEqual(updateCallArgs, [where, dataToUpdate]);
      assert.deepStrictEqual(result, invoiceResponseDTO);
      assert.strictEqual((InvoiceDAO.findInvoice as any).mock.callCount(), 1);
      assert.strictEqual((InvoiceDAO.updateInvoice as any).mock.callCount(), 1);
    });

    it('should throw 404 error if invoice was not found or does not belong to user', async () => {
      const invoiceDto: UpdateInvoiceDto = { id: 'invoice123', userId: 'user123', amount: 1000, status: "PENDING", currency: "EUR" };

      (InvoiceDAO.findInvoice as any).mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await InvoiceService.updateInvoice(invoiceDto);
        },
        (error: any) => {
          assert(error instanceof ReqValidationError);
          assert.strictEqual(error.message, INVOICE_NOT_FOUND);
          assert.strictEqual(error.statusCode, 404);
          return true;
        }
      );
      assert.strictEqual((InvoiceDAO.findInvoice as any).mock.callCount(), 1);
      assert.strictEqual((InvoiceDAO.updateInvoice as any).mock.callCount(), 0);
    });
  });

  describe('deleteInvoice', () => {
    it('should delete an invoice using invoice id and user id', async () => {
      const readUniqueInvoiceDto: ReadUniqueInvoiceDto = { id: 'invoice123', userId: 'user123' };
      const prismaInvoice: Invoice = { id: 'invoice123', taxProfileId: 'taxProfile123', amount: 1000, status: 'PENDING', currency: 'EUR', createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') };
      const where: Prisma.InvoiceWhereUniqueInput = { id: readUniqueInvoiceDto.id, taxProfile: { userId: readUniqueInvoiceDto.userId } };

      (InvoiceDAO.findInvoice as any).mock.mockImplementationOnce(() => Promise.resolve(prismaInvoice));
      (InvoiceDAO.deleteInvoice as any).mock.mockImplementationOnce(() => Promise.resolve(void 0));

      await InvoiceService.deleteInvoice(readUniqueInvoiceDto);

      const findCallArgs = (InvoiceDAO.findInvoice as any).mock.calls[0].arguments;
      assert.deepStrictEqual(findCallArgs, [where]);
      const deleteCallArgs = (InvoiceDAO.deleteInvoice as any).mock.calls[0].arguments;
      assert.deepStrictEqual(deleteCallArgs, [where]);
      assert.strictEqual((InvoiceDAO.findInvoice as any).mock.callCount(), 1);
      assert.strictEqual((InvoiceDAO.deleteInvoice as any).mock.callCount(), 1);
    });

    it('should throw 404 error if invoice was not found or does not belong to user', async () => {
      const readUniqueInvoiceDto: ReadUniqueInvoiceDto = { id: 'invoice123', userId: 'user123' };

      (InvoiceDAO.findInvoice as any).mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await InvoiceService.deleteInvoice(readUniqueInvoiceDto);
        },
        (error: any) => {
          assert(error instanceof ReqValidationError);
          assert.strictEqual(error.message, INVOICE_NOT_FOUND);
          assert.strictEqual(error.statusCode, 404);
          return true;
        }
      );
      assert.strictEqual((InvoiceDAO.findInvoice as any).mock.callCount(), 1);
      assert.strictEqual((InvoiceDAO.deleteInvoice as any).mock.callCount(), 0);
    });
  });
});