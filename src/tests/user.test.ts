import { describe, it, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../index.js';
import prisma from '../utils/prisma.js';

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

  it('POST /user/signup should create a new user', async () => {
    const response = await request(app)
      .post('/user/signup')
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(201);

    assert.ok(response.body.jwt);
    assert.strictEqual(response.body.message, 'Signed up.');
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

  it('GET /user should return user profile', async () => {
    const response = await request(app)
      .get('/user')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    assert.strictEqual(response.body.email, testUser.email);
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

  it('GET /user should return 401 without token', async () => {
    await request(app)
      .get('/user')
      .expect(401);
  });

  it('DELETE /user should delete the user', async () => {
    await request(app)
      .delete('/user')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    await request(app)
      .post('/user/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(404);
  });
});