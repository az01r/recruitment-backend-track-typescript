import { describe, it, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../index.js';
import prisma from '../utils/prisma.js';
import { INVALID_EMAIL, SIGNED_UP, UNAUTHORIZED, USER_DELETED, VALIDATION_ERROR, WRONG_PASSWORD } from '../utils/constants.js';


describe('Integration Tests: User', () => {
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    birthDate: '1990-01-01'
  };
  let authToken: string;

  after(async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: { endsWith: '@example.com' } }
      });
    } catch (error) {
      console.error('Cleanup failed:', error);
    } finally {
      await prisma.$disconnect();
    }
  });

  it('POST /user/signup should create a new user and return a jwt', async () => {
    const response = await request(app)
      .post('/user/signup')
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(201);

    assert.ok(response.body.jwt);
    assert.strictEqual(response.body.message, SIGNED_UP);
  });

  it('POST /user/signup should return 409 for duplicate email', async () => {
    await request(app)
      .post('/user/signup')
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(409);
  });

  it('POST /user/signup should return 422 for invalid email and password', async () => {
    const response = await request(app)
      .post('/user/signup')
      .send({
        email: 'invalid-email',
        password: 'short'
      })
      .expect(422);
    assert.strictEqual(response.body.message, VALIDATION_ERROR);
    assert.strictEqual(response.body.errors.length, 2);
    assert.strictEqual(response.body.errors[0].msg, INVALID_EMAIL);
    assert.strictEqual(response.body.errors[1].msg, 'Password must be at least 8 characters long.');
  });

  it('POST /user/login should return a JWT', async () => {
    const response = await request(app)
      .post('/user/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(200);

    assert.ok(response.body.jwt);
    authToken = response.body.jwt;
  });

  it('POST /user/login should return 422 for invalid email', async () => {
    const response = await request(app)
      .post('/user/login')
      .send({
        email: 'invalid-email',
        password: 'testtest'
      })
      .expect(422);
    assert.strictEqual(response.body.message, VALIDATION_ERROR);
    assert.strictEqual(response.body.errors.length, 1);
    assert.strictEqual(response.body.errors[0].msg, INVALID_EMAIL);
  });

  it('POST /user/login should return 401 for wrong password', async () => {
    const response = await request(app)
      .post('/user/login')
      .send({
        email: testUser.email,
        password: 'wrong-password'
      })
      .expect(401);
    assert.strictEqual(response.body.message, WRONG_PASSWORD);
  });

  it('GET /user should return user profile', async () => {
    const response = await request(app)
      .get('/user')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    assert.strictEqual(response.body.email, testUser.email);
  });

  it('GET /user should return 401 with invalid token', async () => {
    const response = await request(app)
      .get('/user')
      .expect(401);
    assert.strictEqual(response.body.message, UNAUTHORIZED);
    const response2 = await request(app)
      .get('/user')
      .set('Authorization', `Bearer invalid-token`)
      .expect(401);
    assert.strictEqual(response2.body.message, UNAUTHORIZED);
  });

  it('PUT /user should update profile', async () => {
    const response = await request(app)
      .put('/user')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        birthDate: testUser.birthDate
      })
      .expect(200);

    assert.strictEqual(response.body.firstName, testUser.firstName);
    assert.strictEqual(response.body.lastName, testUser.lastName);
    assert.strictEqual(response.body.birthDate.split('T')[0], testUser.birthDate);
  });

  it('PUT /user should return 422 for invalid inputs', async () => {
    const response = await request(app)
      .put('/user')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        email: 'invalid-email',
        password: 'short',
        firstName: 's',
        lastName: 's',
        birthDate: 'invalid-date'
      })
      .expect(422);
    assert.strictEqual(response.body.message, VALIDATION_ERROR);
    assert.strictEqual(response.body.errors.length, 5);
    assert.strictEqual(response.body.errors[0].msg, INVALID_EMAIL);
    assert.strictEqual(response.body.errors[1].msg, 'Password must be at least 8 characters long.');
    assert.strictEqual(response.body.errors[2].msg, 'First name must be at least 2 characters long.');
    assert.strictEqual(response.body.errors[3].msg, 'Last name must be at least 2 characters long.');
    assert.strictEqual(response.body.errors[4].msg, 'Birth date must be a valid date.');
  });

  it('PUT /user should return 401 with invalid token', async () => {
    const response = await request(app)
      .put('/user')
      .expect(401);
    assert.strictEqual(response.body.message, UNAUTHORIZED);
    const response2 = await request(app)
      .put('/user')
      .set('Authorization', `Bearer invalid-token`)
      .expect(401);
    assert.strictEqual(response2.body.message, UNAUTHORIZED);
  });

  it('DELETE /user should delete the user', async () => {
    const response = await request(app)
      .delete('/user')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    assert.strictEqual(response.body.message, USER_DELETED);

    await request(app)
      .post('/user/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(404);
  });

  it('DELETE /user should return 401 with invalid token', async () => {
    const response = await request(app)
      .delete('/user')
      .expect(401);
    assert.strictEqual(response.body.message, UNAUTHORIZED);
    const response2 = await request(app)
      .delete('/user')
      .set('Authorization', `Bearer invalid-token`)
      .expect(401);
    assert.strictEqual(response2.body.message, UNAUTHORIZED);
  });
});