import { describe, it, mock, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import UserController from './user-controller.js';
import UserService from '../services/user-service.js';
import { LOGGED_IN, SIGNED_UP, USER_DELETED } from '../utils/constants.js';
import { CreateUserDTO, LoginUserDTO, ResponseUserDTO, UpdateUserDTO } from '../types/user-dto.js';

mock.method(UserService, 'signup');
mock.method(UserService, 'login');
mock.method(UserService, 'getUser');
mock.method(UserService, 'updateUser');
mock.method(UserService, 'deleteUser');

describe('UserController', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    (UserService.signup as any).mock.resetCalls();
    (UserService.login as any).mock.resetCalls();
    (UserService.getUser as any).mock.resetCalls();
    (UserService.updateUser as any).mock.resetCalls();
    (UserService.deleteUser as any).mock.resetCalls();

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

  describe('signup', () => {
    it('should signup a new user', async () => {
      req.body = { email: 'test@test.com', password: 'testtest' };
      const mockToken = 'mock_token';
      const userDto: CreateUserDTO = { email: req.body.email, password: req.body.password };

      (UserService.signup as any).mock.mockImplementationOnce(() => Promise.resolve(mockToken));

      await UserController.signup(req, res, next);

      const callArgs = (UserService.signup as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [userDto]);
      assert.strictEqual(res.statusCode, 201);
      assert.deepStrictEqual(res.jsonData, { message: SIGNED_UP, jwt: mockToken });
      assert.strictEqual((UserService.signup as any).mock.callCount(), 1);
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      req.body = { email: 'test@test.com', password: 'testtest' };
      const mockToken = 'mock_token';
      const userDto: LoginUserDTO = { email: req.body.email, password: req.body.password };

      (UserService.login as any).mock.mockImplementationOnce(() => Promise.resolve(mockToken));

      await UserController.login(req, res, next);

      const callArgs = (UserService.login as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [userDto]);
      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { message: LOGGED_IN, jwt: mockToken });
      assert.strictEqual((UserService.login as any).mock.callCount(), 1);
    });
  });

  describe('getUser', () => {
    it('should get logged in user profile', async () => {
      const responseUserDto: ResponseUserDTO = { id: 'user123', email: 'test@test.com', firstName: 'First Name', lastName: 'Last Name', birthDate: '2025-01-01T00:00:00.000Z', createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' };

      (UserService.getUser as any).mock.mockImplementationOnce(() => Promise.resolve(responseUserDto));

      await UserController.getUser(req, res, next);

      const callArgs = (UserService.getUser as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [req.userId!]);
      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { user: responseUserDto });
      assert.strictEqual((UserService.getUser as any).mock.callCount(), 1);
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      req.body = { email: 'updated@test.com', password: 'updated', firstName: 'updated', lastName: 'updated', birthDate: '2025-12-31T00:00:00.000Z' };

      const userDto: UpdateUserDTO = { id: req.userId, email: req.body.email, password: req.body.password, firstName: req.body.firstName, lastName: req.body.lastName, birthDate: req.body.birthDate };
      const responseUserDto: ResponseUserDTO = { id: userDto.id, email: userDto.email!, firstName: userDto.firstName!, lastName: userDto.lastName!, birthDate: userDto.birthDate!, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' };

      (UserService.updateUser as any).mock.mockImplementationOnce(() => Promise.resolve(responseUserDto));

      await UserController.updateUser(req, res, next);

      const callArgs = (UserService.updateUser as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [userDto]);
      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { user: responseUserDto });
      assert.strictEqual((UserService.updateUser as any).mock.callCount(), 1);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      (UserService.deleteUser as any).mock.mockImplementationOnce(() => Promise.resolve(null));

      await UserController.deleteUser(req, res, next);

      const callArgs = (UserService.deleteUser as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [req.userId!]);
      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonData, { message: USER_DELETED });
      assert.strictEqual((UserService.deleteUser as any).mock.callCount(), 1);
    });
  });
});
