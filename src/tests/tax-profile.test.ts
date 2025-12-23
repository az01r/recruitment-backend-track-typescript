import { describe, it, after, before } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../index.js';
import prisma from '../utils/prisma.js';

describe('Integration Tests: Tax Profile', () => {
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    birthDate: '1990-01-01'
  };

  let authToken: string;
  let userId: string;
  let taxProfileId: string;

  const testTaxProfile = {
    legalName: `Legal Name`,
    vatNumber: 'IT12345678901',
    address: 'Via Roma 1',
    city: 'Rome',
    zipCode: '100',
    country: 'Italy'
  };

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
      await prisma.user.deleteMany({
        where: { email: { endsWith: '@example.com' } }
      });
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  });

  it('POST /tax-profile should create a new tax profile', async () => {
    const response = await request(app)
      .post('/tax-profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send(testTaxProfile)
      .expect(201);

    assert.ok(response.body.taxProfile);
    assert.strictEqual(response.body.taxProfile.legalName, testTaxProfile.legalName);
    assert.strictEqual(response.body.taxProfile.vatNumber, testTaxProfile.vatNumber);
    assert.strictEqual(response.body.taxProfile.address, testTaxProfile.address);
    assert.strictEqual(response.body.taxProfile.city, testTaxProfile.city);
    assert.strictEqual(response.body.taxProfile.zipCode, testTaxProfile.zipCode);
    assert.strictEqual(response.body.taxProfile.country, testTaxProfile.country);
    taxProfileId = response.body.taxProfile.id;
  });

  it('GET /tax-profile should return all user tax profiles', async () => {
    const response = await request(app)
      .get('/tax-profile')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    assert.ok(response.body.taxProfiles);
    assert.strictEqual(response.body.taxProfiles.length, 1);
  });

  it('GET /tax-profile/:id should return a single tax profile', async () => {
    const response = await request(app)
      .get(`/tax-profile/${taxProfileId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    assert.ok(response.body.taxProfile);
    assert.strictEqual(response.body.taxProfile.id, taxProfileId);
    assert.strictEqual(response.body.taxProfile.legalName, testTaxProfile.legalName);
    assert.strictEqual(response.body.taxProfile.vatNumber, testTaxProfile.vatNumber);
    assert.strictEqual(response.body.taxProfile.address, testTaxProfile.address);
    assert.strictEqual(response.body.taxProfile.city, testTaxProfile.city);
    assert.strictEqual(response.body.taxProfile.zipCode, testTaxProfile.zipCode);
    assert.strictEqual(response.body.taxProfile.country, testTaxProfile.country);
  });

  it('PUT /tax-profile/:id should update a single tax profile', async () => {
    const response = await request(app)
      .put(`/tax-profile/${taxProfileId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        legalName: 'Updated Legal Name',
        vatNumber: 'IT12345678902',
        address: 'Via Roma 2',
        city: 'Turin',
        zipCode: '101',
        country: 'Italy'
      })
      .expect(200);

    assert.ok(response.body.taxProfile);
    assert.strictEqual(response.body.taxProfile.id, taxProfileId);
    assert.strictEqual(response.body.taxProfile.legalName, 'Updated Legal Name');
    assert.strictEqual(response.body.taxProfile.vatNumber, 'IT12345678902');
    assert.strictEqual(response.body.taxProfile.address, 'Via Roma 2');
    assert.strictEqual(response.body.taxProfile.city, 'Turin');
    assert.strictEqual(response.body.taxProfile.zipCode, '101');
    assert.strictEqual(response.body.taxProfile.country, 'Italy');
  });

  it('PUT /tax-profile/:id should return 404 if tax profile does not exists or does not belong to user', async () => {
    const response = await request(app)
      .put('/tax-profile/not-found')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        legalName: 'Updated Legal Name',
        vatNumber: 'IT12345678902',
        address: 'Via Roma 2',
        city: 'Turin',
        zipCode: '101',
        country: 'Italy'
      })
      .expect(404);

    assert.strictEqual(response.body.message, 'Tax Profile not found or does not belong to user.');
  });

  it('DELETE /tax-profile/:id should delete a tax profile', async () => {
    const response = await request(app)
      .delete(`/tax-profile/${taxProfileId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    assert.strictEqual(response.body.message, 'Tax profile deleted.');
  });

  it('DELETE /tax-profile/:id should return 404 if tax profile does not exists or does not belong to user', async () => {
    const response = await request(app)
      .delete('/tax-profile/not-found')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);

    assert.strictEqual(response.body.message, 'Tax Profile not found or does not belong to user.');
  });
});