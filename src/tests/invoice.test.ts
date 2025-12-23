import { describe, it, after, before } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../index.js';
import prisma from '../utils/prisma.js';
import { Prisma } from '../generated/prisma/client.js';

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
    city: 'Rome',
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

    assert.strictEqual(response.body.message, 'Tax Profile not found or does not belong to user.');
  });

  it('GET /invoice should return all user invoices', async () => {
    const response = await request(app)
      .get('/invoice')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    assert.ok(response.body.invoices);
    assert.strictEqual(response.body.invoices.length, 1);
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

  it('GET /invoice/:id should return 404 not found if invoice does not exist or does not belong to user', async () => {
    const response = await request(app)
      .get('/invoice/not-found')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);

    assert.strictEqual(response.body.message, 'Invoice not found.');
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

    assert.strictEqual(response.body.message, 'Invoice not found or does not belong to user.');
  });

  it('DELETE /invoice/:id should delete a invoice', async () => {
    const response = await request(app)
      .delete(`/invoice/${invoiceId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    assert.strictEqual(response.body.message, 'Invoice deleted.');
  });

  it('DELETE /invoice/:id should return 404 not found if invoice does not exist or does not belong to user', async () => {
    const response = await request(app)
      .delete('/invoice/not-found')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);

    assert.strictEqual(response.body.message, 'Invoice not found or does not belong to user.');
  });
});