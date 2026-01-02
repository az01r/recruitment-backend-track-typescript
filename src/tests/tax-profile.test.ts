import { describe, it, after, before } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../index.js';
import prisma from '../utils/prisma.js';
import { TAX_PROFILE_DELETED, TAX_PROFILE_NOT_FOUND, UNAUTHORIZED, VALIDATION_ERROR } from '../utils/constants.js';
import { CreateTaxProfileDTO } from '../types/tax-profile-dto.js';


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

  const testTaxProfile: CreateTaxProfileDTO = {
    userId: '',
    legalName: `Legal Name`,
    vatNumber: 'IT12345678901',
    address: 'Via Roma 1',
    city: 'Turin',
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
      userId = userResponse.body.user.id;
      testTaxProfile.userId = userId;
    } catch (error) {
      console.error('Setup failed:', error);
    }
  });

  after(async () => {
    try {
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

  it('POST /tax-profile should create a new tax profile', async () => {
    const response = await request(app)
      .post('/tax-profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send(testTaxProfile)
      .expect(201);

    assert.ok(response.body.taxProfile);
    console.log(response.body.taxProfile);
    assert.strictEqual(response.body.taxProfile.userId, testTaxProfile.userId);
    assert.strictEqual(response.body.taxProfile.legalName, testTaxProfile.legalName);
    assert.strictEqual(response.body.taxProfile.vatNumber, testTaxProfile.vatNumber);
    assert.strictEqual(response.body.taxProfile.address, testTaxProfile.address);
    assert.strictEqual(response.body.taxProfile.city, testTaxProfile.city);
    assert.strictEqual(response.body.taxProfile.zipCode, testTaxProfile.zipCode);
    assert.strictEqual(response.body.taxProfile.country, testTaxProfile.country);
    taxProfileId = response.body.taxProfile.id;
  });

  it('POST /tax-profile should return 401 with invalid token', async () => {
    const response = await request(app)
      .post('/tax-profile')
      .set('Authorization', `Bearer invalid-token`)
      .send(testTaxProfile)
      .expect(401);
    assert.strictEqual(response.body.message, UNAUTHORIZED);
    const response2 = await request(app)
      .post('/tax-profile')
      .send(testTaxProfile)
      .expect(401);
    assert.strictEqual(response2.body.message, UNAUTHORIZED);
  });

  it('POST /tax-profile should return 422 for invalid inputs', async () => {
    const response = await request(app)
      .post('/tax-profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send()
      .expect(422);
    assert.strictEqual(response.body.message, VALIDATION_ERROR);
    assert.strictEqual(response.body.errors.length, 6);
    assert.strictEqual(response.body.errors[0].msg, 'Legal name must be at least 2 characters long.');
    assert.strictEqual(response.body.errors[1].msg, 'VAT number must be at least 2 characters long.');
    assert.strictEqual(response.body.errors[2].msg, 'Address must be at least 2 characters long.');
    assert.strictEqual(response.body.errors[3].msg, 'City must be at least 2 characters long.');
    assert.strictEqual(response.body.errors[4].msg, 'Zip code must be at least 2 characters long.');
    assert.strictEqual(response.body.errors[5].msg, 'Country must be at least 2 characters long.');
  });

  it('GET /tax-profile should return all user tax profiles', async () => {
    const response = await request(app)
      .get('/tax-profile')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    assert.ok(response.body.taxProfiles);
    assert.strictEqual(response.body.taxProfiles.length, 1);
  });

  it('GET /tax-profile should return 401 with invalid token', async () => {
    const response = await request(app)
      .get('/tax-profile')
      .expect(401);
    assert.strictEqual(response.body.message, UNAUTHORIZED);
    const response2 = await request(app)
      .get('/tax-profile')
      .set('Authorization', `Bearer invalid-token`)
      .expect(401);
    assert.strictEqual(response2.body.message, UNAUTHORIZED);
  });

  it('GET /tax-profile should return 422 for invalid query params', async () => {
    const response = await request(app)
      .get(`/tax-profile`)
      .query({
        skip: 'invalid-skip',
        take: 'invalid-take',
        legalName: 'f',
        vatNumber: 'f',
        address: 'f',
        city: 'f',
        zipCode: 'f',
        country: 'f',
        gteCreatedAt: '2025-12-31T00:00:00.000Z',
        lteCreatedAt: '2025-12-01T00:00:00.000Z',
        gteUpdatedAt: '2025-12-31T00:00:00.000Z',
        lteUpdatedAt: '2025-12-01T00:00:00.000Z',
      })
      .set('Authorization', `Bearer ${authToken}`)
      .expect(422);
    assert.strictEqual(response.body.message, VALIDATION_ERROR);
    assert.strictEqual(response.body.errors.length, 10);
    assert.strictEqual(response.body.errors[0].msg, 'Skip must be a non-negative integer.');
    assert.strictEqual(response.body.errors[1].msg, 'Take must be a positive integer.');
    assert.strictEqual(response.body.errors[2].msg, 'Legal name must be at least 2 characters long.');
    assert.strictEqual(response.body.errors[3].msg, 'VAT number must be at least 2 characters long.');
    assert.strictEqual(response.body.errors[4].msg, 'Address must be at least 2 characters long.');
    assert.strictEqual(response.body.errors[5].msg, 'City must be at least 2 characters long.');
    assert.strictEqual(response.body.errors[6].msg, 'Country must be at least 2 characters long.');
    assert.strictEqual(response.body.errors[7].msg, 'Zip code must be at least 2 characters long.');
    assert.strictEqual(response.body.errors[8].msg, 'lteCreatedAt must be after gteCreatedAt');
    assert.strictEqual(response.body.errors[9].msg, 'lteUpdatedAt must be after gteUpdatedAt');
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

  it('GET /tax-profile/:id should return 401 with invalid token', async () => {
    const response = await request(app)
      .get(`/tax-profile/${taxProfileId}`)
      .expect(401);
    assert.strictEqual(response.body.message, UNAUTHORIZED);
    const response2 = await request(app)
      .get(`/tax-profile/${taxProfileId}`)
      .set('Authorization', `Bearer invalid-token`)
      .expect(401);
    assert.strictEqual(response2.body.message, UNAUTHORIZED);
  });

  it('GET /tax-profile/:id should return 404 if tax profile does not exists or does not belong to user', async () => {
    const response = await request(app)
      .get(`/tax-profile/not-found`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
    assert.strictEqual(response.body.message, TAX_PROFILE_NOT_FOUND);
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

  it('PUT /tax-profile/:id should return 401 with invalid token', async () => {
    const response = await request(app)
      .put(`/tax-profile/${taxProfileId}`)
      .expect(401);
    assert.strictEqual(response.body.message, UNAUTHORIZED);
    const response2 = await request(app)
      .put(`/tax-profile/${taxProfileId}`)
      .set('Authorization', `Bearer invalid-token`)
      .expect(401);
    assert.strictEqual(response2.body.message, UNAUTHORIZED);
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

    assert.strictEqual(response.body.message, TAX_PROFILE_NOT_FOUND);
  });

  it('PUT /tax-profile/:id should return 422 for invalid inputs', async () => {
    const response = await request(app)
      .put(`/tax-profile/${taxProfileId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        legalName: 's',
        vatNumber: 's',
        address: 's',
        city: 's',
        zipCode: 's',
        country: 's'
      })
      .expect(422);
    assert.strictEqual(response.body.message, VALIDATION_ERROR);
    assert.strictEqual(response.body.errors.length, 6);
    assert.strictEqual(response.body.errors[0].msg, 'Legal name must be at least 2 characters long.');
    assert.strictEqual(response.body.errors[1].msg, 'VAT number must be at least 2 characters long.');
    assert.strictEqual(response.body.errors[2].msg, 'Address must be at least 2 characters long.');
    assert.strictEqual(response.body.errors[3].msg, 'City must be at least 2 characters long.');
    assert.strictEqual(response.body.errors[4].msg, 'Zip code must be at least 2 characters long.');
    assert.strictEqual(response.body.errors[5].msg, 'Country must be at least 2 characters long.');
  });

  it('DELETE /tax-profile/:id should delete a tax profile', async () => {
    const response = await request(app)
      .delete(`/tax-profile/${taxProfileId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    assert.strictEqual(response.body.message, TAX_PROFILE_DELETED);
  });

  it('DELETE /tax-profile/:id should return 401 with invalid token', async () => {
    const response = await request(app)
      .delete(`/tax-profile/${taxProfileId}`)
      .expect(401);
    assert.strictEqual(response.body.message, UNAUTHORIZED);
    const response2 = await request(app)
      .delete(`/tax-profile/${taxProfileId}`)
      .set('Authorization', `Bearer invalid-token`)
      .expect(401);
    assert.strictEqual(response2.body.message, UNAUTHORIZED);
  });

  it('DELETE /tax-profile/:id should return 404 if tax profile does not exists or does not belong to user', async () => {
    const response = await request(app)
      .delete('/tax-profile/not-found')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);

    assert.strictEqual(response.body.message, TAX_PROFILE_NOT_FOUND);
  });
});