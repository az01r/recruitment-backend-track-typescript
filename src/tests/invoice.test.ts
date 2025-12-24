import { describe, it, after, before } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../index.js';
import prisma from '../utils/prisma.js';
import { Prisma } from '../generated/prisma/client.js';
import { INVOICE_DELETED, INVOICE_NOT_FOUND, TAX_PROFILE_NOT_FOUND, UNAUTHORIZED, VALIDATION_ERROR } from '../utils/constants.js';

describe('Integration Tests: Invoice', () => {
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    birthDate: '1990-01-01'
  };

  const testTaxProfile = {
    legalName: `Legal Name`,
    vatNumber: 'IT12345678901',
    address: 'Via Roma 1',
    city: 'Turin',
    zipCode: '100',
    country: 'Italy'
  };

  const testInvoice: Prisma.InvoiceCreateWithoutTaxProfileInput = { amount: 100, status: 'PENDING', currency: 'EUR' };

  let authToken: string;
  let userId: string;
  let taxProfileId: string;
  let invoiceId: string;

  before(async () => {
    try {
      const response = await request(app)
        .post('/user/signup')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(201);

      authToken = response.body.jwt;
      const userResponse = await request(app)
        .get('/user')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      userId = userResponse.body.id;
      const taxProfileResponse = await request(app)
        .post('/tax-profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testTaxProfile)
        .expect(201);
      taxProfileId = taxProfileResponse.body.taxProfile.id;
    } catch (error) {
      console.error('Setup failed:', error);
    }
  });

  after(async () => {
    try {
      await prisma.invoice.deleteMany({
        where: {
          taxProfile: { userId }
        }
      });
      await prisma.taxProfile.deleteMany({
        where: { userId }
      });
      await prisma.user.delete({
        where: { id: userId }
      });
    } catch (error) {
      console.error('Cleanup failed:', error);
    } finally {
      await prisma.$disconnect();
    }
  });

  it('POST /invoice should create a new invoice', async () => {
    const invoiceData = {
      ...testInvoice,
      taxProfileId
    };
    const response = await request(app)
      .post('/invoice')
      .set('Authorization', `Bearer ${authToken}`)
      .send(invoiceData)
      .expect(201);

    assert.ok(response.body.invoice);
    assert.strictEqual(response.body.invoice.amount, testInvoice.amount);
    assert.strictEqual(response.body.invoice.status, testInvoice.status);
    assert.strictEqual(response.body.invoice.currency, testInvoice.currency);
    invoiceId = response.body.invoice.id;
  });

  it('POST /invoice should return 401 with invalid token', async () => {
    const response = await request(app)
      .post('/invoice')
      .set('Authorization', `Bearer invalid-token`)
      .send()
      .expect(401);
    assert.strictEqual(response.body.message, UNAUTHORIZED);
    const response2 = await request(app)
      .post('/invoice')
      .set('Authorization', `Bearer invalid-token`)
      .send()
      .expect(401);
    assert.strictEqual(response2.body.message, UNAUTHORIZED);
  });

  it('POST /invoice should return 404 not found if tax profile does not exist or does not belong to user', async () => {
    const invoiceData = {
      ...testInvoice,
      taxProfileId: 'not-found'
    };
    const response = await request(app)
      .post('/invoice')
      .set('Authorization', `Bearer ${authToken}`)
      .send(invoiceData)
      .expect(404);

    assert.strictEqual(response.body.message, TAX_PROFILE_NOT_FOUND);
  });

  it('POST /invoice should return 422 for invalid inputs', async () => {
    const response = await request(app)
      .post('/invoice')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        taxProfileId,
        amount: 'invalid',
        status: 'invalid',
        currency: 'invalid'
      })
      .expect(422);
    assert.strictEqual(response.body.message, VALIDATION_ERROR);
    assert.strictEqual(response.body.errors.length, 3);
    assert.strictEqual(response.body.errors[0].msg, 'Amount must be a positive number.');
    assert.strictEqual(response.body.errors[1].msg, 'Status must be one of PENDING, PAID, CANCELLED.');
    assert.strictEqual(response.body.errors[2].msg, 'Currency must be one of EUR, USD, GBP.');
  });

  it('GET /invoice should return all user invoices', async () => {
    const response = await request(app)
      .get('/invoice')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    assert.ok(response.body.invoices);
    assert.strictEqual(response.body.invoices.length, 1);
  });

  it('GET /invoice should return 401', async () => {
    const response = await request(app)
      .get('/invoice')
      .expect(401);
    assert.strictEqual(response.body.message, UNAUTHORIZED);
    const response2 = await request(app)
      .get('/invoice')
      .set('Authorization', `Bearer invalid-token`)
      .expect(401);
    assert.strictEqual(response2.body.message, UNAUTHORIZED);
  });

  it('GET /invoice/:id should return a single invoice', async () => {
    const response = await request(app)
      .get(`/invoice/${invoiceId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    assert.ok(response.body.invoice);
    assert.strictEqual(response.body.invoice.id, invoiceId);
    assert.strictEqual(response.body.invoice.amount, testInvoice.amount);
    assert.strictEqual(response.body.invoice.status, testInvoice.status);
    assert.strictEqual(response.body.invoice.currency, testInvoice.currency);
  });

  it('GET /invoice/:id should return 401 with invalid token', async () => {
    const response = await request(app)
      .get(`/invoice/${invoiceId}`)
      .expect(401);
    assert.strictEqual(response.body.message, UNAUTHORIZED);
    const response2 = await request(app)
      .get(`/invoice/${invoiceId}`)
      .set('Authorization', `Bearer invalid-token`)
      .expect(401);
    assert.strictEqual(response2.body.message, UNAUTHORIZED);
  });

  it('GET /invoice/:id should return 404 not found if invoice does not exist or does not belong to user', async () => {
    const response = await request(app)
      .get('/invoice/not-found')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);

    assert.strictEqual(response.body.message, INVOICE_NOT_FOUND);
  });

  it('PUT /invoice/:id should update a single invoice', async () => {
    const response = await request(app)
      .put(`/invoice/${invoiceId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 200,
        status: 'PAID',
        currency: 'EUR'
      })
      .expect(200);

    assert.ok(response.body.invoice);
    assert.strictEqual(response.body.invoice.id, invoiceId);
    assert.strictEqual(response.body.invoice.amount, 200);
    assert.strictEqual(response.body.invoice.status, 'PAID');
    assert.strictEqual(response.body.invoice.currency, 'EUR');
  });

  it('PUT /invoice/:id should return 401 with invalid token', async () => {
    const response = await request(app)
      .put(`/invoice/${invoiceId}`)
      .set('Authorization', `Bearer invalid-token`)
      .send()
      .expect(401);
    assert.strictEqual(response.body.message, UNAUTHORIZED);
    const response2 = await request(app)
      .put(`/invoice/${invoiceId}`)
      .set('Authorization', `Bearer invalid-token`)
      .send()
      .expect(401);
    assert.strictEqual(response2.body.message, UNAUTHORIZED);
  });

  it('PUT /invoice/:id should return 404 not found if invoice does not exist or does not belong to user', async () => {
    const response = await request(app)
      .put('/invoice/not-found')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 200,
        status: 'PAID',
        currency: 'EUR'
      })
      .expect(404);

    assert.strictEqual(response.body.message, INVOICE_NOT_FOUND);
  });

  it('PUT /invoice/:id should return 422 for invalid inputs', async () => {
    const response = await request(app)
      .put(`/invoice/${invoiceId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        taxProfileId,
        amount: 'invalid',
        status: 'invalid',
        currency: 'invalid'
      })
      .expect(422);
    assert.strictEqual(response.body.message, VALIDATION_ERROR);
    assert.strictEqual(response.body.errors.length, 3);
    assert.strictEqual(response.body.errors[0].msg, 'Amount must be a positive number.');
    assert.strictEqual(response.body.errors[1].msg, 'Status must be one of PENDING, PAID, CANCELLED.');
    assert.strictEqual(response.body.errors[2].msg, 'Currency must be one of EUR, USD, GBP.');
  });

  it('DELETE /invoice/:id should delete a invoice', async () => {
    const response = await request(app)
      .delete(`/invoice/${invoiceId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    assert.strictEqual(response.body.message, INVOICE_DELETED);
  });

  it('DELETE /invoice/:id should return 401 with invalid token', async () => {
    const response = await request(app)
      .delete(`/invoice/${invoiceId}`)
      .expect(401);
    assert.strictEqual(response.body.message, UNAUTHORIZED);
    const response2 = await request(app)
      .delete(`/invoice/${invoiceId}`)
      .set('Authorization', `Bearer invalid-token`)
      .expect(401);
    assert.strictEqual(response2.body.message, UNAUTHORIZED);
  });

  it('DELETE /invoice/:id should return 404 not found if invoice does not exist or does not belong to user', async () => {
    const response = await request(app)
      .delete('/invoice/not-found')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);

    assert.strictEqual(response.body.message, INVOICE_NOT_FOUND);
  });
});