import { describe, it, mock, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import UserController from './user-controller.js';
import UserService from '../services/user-service.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

mock.method(UserService, 'findUserByEmail');
mock.method(UserService, 'findUserById');
mock.method(UserService, 'createUser');
mock.method(UserService, 'updateUser');
mock.method(UserService, 'deleteUser');
mock.method(bcrypt, 'compare');
mock.method(jwt, 'sign', () => 'mock_token');

describe('UserController', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      body: {},
      userId: 'user123'
    };
    res = {
      statusCode: 0,
      jsonData: null,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(data: any) {
        this.jsonData = data;
        return this;
      }
    };
    next = mock.fn();
  });

  after(() => {
    mock.reset();
  });

  describe('signup', () => {
    it('should signup a new user', async () => {
      req.body = { email: 'test@test.com', password: 'testtest' };
      const mockUser = { id: '1', email: 'test@test.com' };
      (UserService.createUser as any).mock.mockImplementationOnce(() => Promise.resolve(mockUser));
      (UserService.findUserByEmail as any).mock.mockImplementationOnce(() => Promise.resolve(null));

      await UserController.signup(req, res, next);

      assert.strictEqual(res.statusCode, 201);
      assert.deepStrictEqual(res.jsonData, { message: "Signed up.", jwt: 'mock_token' });
      assert.strictEqual((UserService.createUser as any).mock.callCount(), 1);
    });

    it('should fallback to 409 if user already exists', async () => {
      req.body = { email: 'existinguser@test.com', password: 'testtest' };
      const error = new Error('User already registered.');
      (UserService.createUser as any).mock.mockImplementationOnce(() => Promise.reject(error));
      (UserService.findUserByEmail as any).mock.mockImplementationOnce(() => Promise.resolve({ id: '1', email: 'existinguser@test.com' }));

      await UserController.signup(req, res, next);

      assert.strictEqual(next.mock.callCount(), 1);
      assert.strictEqual(res.statusCode, 409);
      assert.deepStrictEqual(next.mock.calls[0].arguments, [error]);
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      req.body = { email: 'test@test.com', password: 'testtest' };
      const mockUser = { id: '1', email: 'test@test.com' };
      (UserService.findUserByEmail as any).mock.mockImplementationOnce(() => Promise.resolve(mockUser));
      (bcrypt.compare as any).mock.mockImplementationOnce(() => Promise.resolve(true));

      await UserController.login(req, res, next);

      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { message: "Logged in.", jwt: 'mock_token' });
    });

    it('should fail if user not found', async () => {
      req.body = { email: 'email@notfound.com', password: 'testtest' };
      (UserService.findUserByEmail as any).mock.mockImplementationOnce(() => Promise.resolve(null));

      await UserController.login(req, res, next);

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(next.mock.callCount(), 1);
      assert.strictEqual(next.mock.calls[0].arguments[0].message, "E-Mail not registered yet.");
    });

    it('should fail if password incorrect', async () => {
      req.body = { email: 'test@test.com', password: 'wrongpassword' };
      const mockUser = { id: '1', email: 'test@test.com', password: 'hashed_password' };
      (UserService.findUserByEmail as any).mock.mockImplementationOnce(() => Promise.resolve(mockUser));
      (bcrypt.compare as any).mock.mockImplementationOnce(() => Promise.resolve(false));

      await UserController.login(req, res, next);

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(next.mock.callCount(), 1);
      assert.strictEqual(next.mock.calls[0].arguments[0].message, "Password is incorrect.");
    });
  });

  describe('getUser', () => {
    it('should get user profile', async () => {
      const mockUser = { id: 'user123', email: 'test@test.com' };
      (UserService.findUserById as any).mock.mockImplementationOnce(() => Promise.resolve(mockUser));

      await UserController.getUser(req, res, next);

      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, mockUser);
    });

    it('should fallback to 404 if user not found', async () => {
      (UserService.findUserById as any).mock.mockImplementationOnce(() => Promise.resolve(null));

      await UserController.getUser(req, res, next);

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(next.mock.calls[0].arguments[0].message, "User not found.");
      assert.strictEqual(next.mock.callCount(), 1);
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      req.body = { firstName: 'Updated' };
      const mockUser = { id: 'user123', firstName: 'Updated' };
      (UserService.updateUser as any).mock.mockImplementationOnce(() => Promise.resolve(mockUser));

      await UserController.updateUser(req, res, next);

      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, mockUser);
    });

    it('should fallback to 404 if user not found', async () => {
      req.body = { firstName: 'Updated' };
      (UserService.updateUser as any).mock.mockImplementationOnce(() => Promise.resolve(null));

      await UserController.updateUser(req, res, next);

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(next.mock.calls[0].arguments[0].message, "User not found.");
      assert.strictEqual(next.mock.callCount(), 1);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      const mockUser = { id: 'user123' };
      (UserService.deleteUser as any).mock.mockImplementationOnce(() => Promise.resolve(mockUser));

      await UserController.deleteUser(req, res, next);

      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, mockUser);
    });

    it('should fallback to 404 if user not found', async () => {
      (UserService.deleteUser as any).mock.mockImplementationOnce(() => Promise.resolve(null));

      await UserController.deleteUser(req, res, next);

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(next.mock.calls[0].arguments[0].message, "User not found.");
      assert.strictEqual(next.mock.callCount(), 1);
    });
  });
});
