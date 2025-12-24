import { describe, it, mock, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import UserController from './user-controller.js';
import UserService from '../services/user-service.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SIGNED_UP, USER_DELETED, USER_NOT_FOUND, WRONG_PASSWORD } from '../utils/constants.js';


mock.method(UserService, 'findUser');
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
    (UserService.findUser as any).mock.resetCalls();
    (UserService.createUser as any).mock.resetCalls();
    (UserService.updateUser as any).mock.resetCalls();
    (UserService.deleteUser as any).mock.resetCalls();
    (bcrypt.compare as any).mock.resetCalls();
    (jwt.sign as any).mock.resetCalls();

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

      (UserService.findUser as any).mock.mockImplementationOnce(() => Promise.resolve(null));
      (UserService.createUser as any).mock.mockImplementationOnce(() => Promise.resolve(mockUser));

      await UserController.signup(req, res, next);

      assert.strictEqual(res.statusCode, 201);
      assert.deepStrictEqual(res.jsonData, { message: SIGNED_UP, jwt: 'mock_token' });
      assert.strictEqual((UserService.findUser as any).mock.callCount(), 1);
      assert.strictEqual((UserService.createUser as any).mock.callCount(), 1);
    });

    it('should fallback to 409 if user already exists', async () => {
      req.body = { email: 'existinguser@test.com', password: 'testtest' };
      const mockUser = { id: '1', email: 'test@test.com' };

      (UserService.findUser as any).mock.mockImplementationOnce(() => Promise.resolve(mockUser));

      await assert.rejects(
        async () => {
          await UserController.signup(req, res, next);
        },
        (error: any) => {
          assert(error instanceof Error);
          assert.strictEqual(error.message, "User already registered.");
          assert.strictEqual(res.statusCode, 409);
          return true;
        }
      );
      assert.strictEqual((UserService.createUser as any).mock.callCount(), 0);
      assert.strictEqual((UserService.findUser as any).mock.callCount(), 1);
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      req.body = { email: 'test@test.com', password: 'testtest' };
      const mockUser = { id: '1', email: 'test@test.com' };

      (UserService.findUser as any).mock.mockImplementationOnce(() => Promise.resolve(mockUser));
      (bcrypt.compare as any).mock.mockImplementationOnce(() => Promise.resolve(true));

      await UserController.login(req, res, next);

      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { message: "Logged in.", jwt: 'mock_token' });
      assert.strictEqual((UserService.findUser as any).mock.callCount(), 1);
      assert.strictEqual((bcrypt.compare as any).mock.callCount(), 1);
      assert.strictEqual((jwt.sign as any).mock.callCount(), 1);
    });

    it('should fail if user not found', async () => {
      req.body = { email: 'email@notfound.com', password: 'testtest' };

      (UserService.findUser as any).mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await UserController.login(req, res, next);
        },
        (error: any) => {
          assert(error instanceof Error);
          assert.strictEqual(error.message, "E-Mail not registered yet.");
          assert.strictEqual(res.statusCode, 404);
          return true;
        }
      );
      assert.strictEqual((UserService.findUser as any).mock.callCount(), 1);
      assert.strictEqual((bcrypt.compare as any).mock.callCount(), 0);
      assert.strictEqual((jwt.sign as any).mock.callCount(), 0);
    });

    it('should fail if password incorrect', async () => {
      req.body = { email: 'test@test.com', password: 'wrongpassword' };
      const mockUser = { id: '1', email: 'test@test.com', password: 'hashed_password' };

      (UserService.findUser as any).mock.mockImplementationOnce(() => Promise.resolve(mockUser));
      (bcrypt.compare as any).mock.mockImplementationOnce(() => Promise.resolve(false));

      await assert.rejects(
        async () => {
          await UserController.login(req, res, next);
        },
        (error: any) => {
          assert(error instanceof Error);
          assert.strictEqual(error.message, WRONG_PASSWORD);
          assert.strictEqual(res.statusCode, 401);
          return true;
        }
      );
      assert.strictEqual((UserService.findUser as any).mock.callCount(), 1);
      assert.strictEqual((bcrypt.compare as any).mock.callCount(), 1);
      assert.strictEqual((jwt.sign as any).mock.callCount(), 0);
    });
  });

  describe('getUser', () => {
    it('should get user profile', async () => {
      req.userId = 'user123';
      const mockUser = { id: 'user123', email: 'test@test.com' };

      (UserService.findUser as any).mock.mockImplementationOnce(() => Promise.resolve(mockUser));

      await UserController.getUser(req, res, next);

      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, mockUser);
      assert.strictEqual((UserService.findUser as any).mock.callCount(), 1);
    });

    it('should fallback to 404 if user not found', async () => {
      req.userId = 'notFound';
      (UserService.findUser as any).mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await UserController.getUser(req, res, next);
        },
        (error: any) => {
          assert(error instanceof Error);
          assert.strictEqual(error.message, USER_NOT_FOUND);
          assert.strictEqual(res.statusCode, 404);
          return true;
        }
      );
      assert.strictEqual((UserService.findUser as any).mock.callCount(), 1);
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
      assert.strictEqual((UserService.updateUser as any).mock.callCount(), 1);
    });

    it('should fallback to 404 if user not found', async () => {
      req.body = { firstName: 'Updated' };

      (UserService.updateUser as any).mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await UserController.updateUser(req, res, next);
        },
        (error: any) => {
          assert(error instanceof Error);
          assert.strictEqual(error.message, USER_NOT_FOUND);
          assert.strictEqual(res.statusCode, 404);
          return true;
        }
      );
      assert.strictEqual((UserService.updateUser as any).mock.callCount(), 1);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      const mockUser = { id: 'user123' };

      (UserService.deleteUser as any).mock.mockImplementationOnce(() => Promise.resolve(mockUser));

      await UserController.deleteUser(req, res, next);

      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { message: USER_DELETED });
      assert.strictEqual((UserService.deleteUser as any).mock.callCount(), 1);
    });

    it('should fallback to 404 if user not found', async () => {
      (UserService.deleteUser as any).mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await UserController.deleteUser(req, res, next);
        },
        (error: any) => {
          assert(error instanceof Error);
          assert.strictEqual(error.message, USER_NOT_FOUND);
          assert.strictEqual(res.statusCode, 404);
          return true;
        }
      );
      assert.strictEqual((UserService.deleteUser as any).mock.callCount(), 1);
    });
  });
});
