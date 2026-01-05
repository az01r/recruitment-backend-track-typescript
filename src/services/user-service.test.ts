import { describe, it, mock, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserService from "./user-service.js";
import { Prisma, User } from '../generated/prisma/client.js';
import { CreateUserDTO, ResponseUserDTO, UpdateUserDTO } from '../types/user-dto.js';
import UserDAO from '../daos/user-dao.js';
import { ConflictError, ResourceNotFoundError, UnauthorizedError } from '../types/error.js';
import { INVALID_EMAIL_OR_PASSWORD, USER_ALREADY_REGISTERED, USER_NOT_FOUND } from '../utils/constants.js';

mock.method(bcrypt, 'hash', () => 'hashed_password');
mock.method(bcrypt, 'compare');
mock.method(jwt, 'sign', () => 'mock_token');
mock.method(UserDAO, 'createUser');
mock.method(UserDAO, 'findUser');
mock.method(UserDAO, 'updateUser');
mock.method(UserDAO, 'deleteUser');

describe('UserService', () => {
  beforeEach(() => {
    (bcrypt.compare as any).mock.resetCalls();
    (bcrypt.hash as any).mock.resetCalls();
    (jwt.sign as any).mock.resetCalls();
    (UserDAO.createUser as any).mock.resetCalls();
    (UserDAO.findUser as any).mock.resetCalls();
    (UserDAO.updateUser as any).mock.resetCalls();
    (UserDAO.deleteUser as any).mock.resetCalls();
  });

  after(() => {
    mock.reset();
  });

  describe('signup', () => {
    it('should signup a new user', async () => {
      const userDto: CreateUserDTO = { email: 'test@test.com', password: 'testtest' };
      const createdUser: User = { id: '1', email: 'test@test.com', password: 'hashed_password', firstName: null, lastName: null, birthDate: null, createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') };

      (UserDAO.findUser as any).mock.mockImplementationOnce(() => Promise.resolve(null));
      (UserDAO.createUser as any).mock.mockImplementationOnce(() => Promise.resolve(createdUser));

      const token = await UserService.signup(userDto);

      const callArgs = (UserDAO.createUser as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [{ email: userDto.email, password: 'hashed_password' }]);
      assert.deepStrictEqual(token, 'mock_token');
      assert.strictEqual((UserDAO.findUser as any).mock.callCount(), 1);
      assert.strictEqual((bcrypt.hash as any).mock.callCount(), 1);
      assert.strictEqual((UserDAO.createUser as any).mock.callCount(), 1);
      assert.strictEqual((jwt.sign as any).mock.callCount(), 1);
    });

    it('should throw error if user already exists', async () => {
      const userDto: CreateUserDTO = { email: 'test@test.com', password: 'testtest' };
      const alreadyExistingUser: User = { id: '1', email: 'test@test.com', password: 'hashed_password', firstName: null, lastName: null, birthDate: null, createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') };

      (UserDAO.findUser as any).mock.mockImplementationOnce(() => Promise.resolve(alreadyExistingUser));

      await assert.rejects(
        async () => {
          await UserService.signup(userDto);
        },
        (error: any) => {
          assert(error instanceof ConflictError);
          assert.strictEqual(error.message, USER_ALREADY_REGISTERED);
          return true;
        }
      );
      assert.strictEqual((UserDAO.findUser as any).mock.callCount(), 1);
      assert.strictEqual((bcrypt.hash as any).mock.callCount(), 0);
      assert.strictEqual((UserDAO.createUser as any).mock.callCount(), 0);
      assert.strictEqual((jwt.sign as any).mock.callCount(), 0);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const userDto: CreateUserDTO = { email: 'test@test.com', password: 'testtest' };
      const user: User = { id: '1', email: 'test@test.com', password: 'hashed_password', firstName: null, lastName: null, birthDate: null, createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') };

      (UserDAO.findUser as any).mock.mockImplementationOnce(() => Promise.resolve(user));
      (bcrypt.compare as any).mock.mockImplementationOnce(() => Promise.resolve(true));

      const token = await UserService.login(userDto);

      const callArgs = (UserDAO.findUser as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [{ email: userDto.email }]);
      assert.deepStrictEqual(token, 'mock_token');
      assert.strictEqual((UserDAO.findUser as any).mock.callCount(), 1);
      assert.strictEqual((bcrypt.compare as any).mock.callCount(), 1);
      assert.strictEqual((jwt.sign as any).mock.callCount(), 1);
    });

    it('should throw error if user is not found', async () => {
      const userDto: CreateUserDTO = { email: 'test@test.com', password: 'testtest' };

      (UserDAO.findUser as any).mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await UserService.login(userDto);
        },
        (error: any) => {
          assert(error instanceof UnauthorizedError);
          assert.strictEqual(error.message, INVALID_EMAIL_OR_PASSWORD);
          return true;
        }
      );
      assert.strictEqual((UserDAO.findUser as any).mock.callCount(), 1);
      assert.strictEqual((bcrypt.compare as any).mock.callCount(), 0);
      assert.strictEqual((jwt.sign as any).mock.callCount(), 0);
    });

    it('should throw error if password is not correct', async () => {
      const userDto: CreateUserDTO = { email: 'test@test.com', password: 'testtest' };
      const user: User = { id: '1', email: 'test@test.com', password: 'hashed_password', firstName: null, lastName: null, birthDate: null, createdAt: new Date('2025'), updatedAt: new Date('2025-01-01T00:00:00.000Z') };

      (UserDAO.findUser as any).mock.mockImplementationOnce(() => Promise.resolve(user));
      (bcrypt.compare as any).mock.mockImplementationOnce(() => Promise.resolve(false));

      await assert.rejects(
        async () => {
          await UserService.login(userDto);
        },
        (error: any) => {
          assert(error instanceof UnauthorizedError);
          assert.strictEqual(error.message, INVALID_EMAIL_OR_PASSWORD);
          return true;
        }
      );
      assert.strictEqual((UserDAO.findUser as any).mock.callCount(), 1);
      assert.strictEqual((bcrypt.compare as any).mock.callCount(), 1);
      assert.strictEqual((jwt.sign as any).mock.callCount(), 0);
    });
  });

  describe('getUser', () => {
    it('should return an user', async () => {
      const userId = '1';
      const userDto: ResponseUserDTO = { id: userId, email: 'test@test.com', firstName: null, lastName: null, birthDate: null, createdAt: new Date('2025-01-01T00:00:00.000Z').toISOString(), updatedAt: new Date('2025-01-01T00:00:00.000Z').toISOString() };
      const prismaUser: User = { id: userId, email: 'test@test.com', password: 'hashed_password', firstName: null, lastName: null, birthDate: null, createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') };

      (UserDAO.findUser as any).mock.mockImplementationOnce(() => Promise.resolve(prismaUser));

      const result = await UserService.getUser(userId);

      const callArgs = (UserDAO.findUser as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [{ id: userId }]);
      assert.deepStrictEqual(result, userDto);
      assert.strictEqual((UserDAO.findUser as any).mock.callCount(), 1);
    });

    it('should throw error if user was not found', async () => {
      const userId = '1';

      (UserDAO.findUser as any).mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await UserService.getUser(userId);
        },
        (error: any) => {
          assert(error instanceof ResourceNotFoundError);
          assert.strictEqual(error.message, USER_NOT_FOUND);
          return true;
        }
      );
      assert.strictEqual((UserDAO.findUser as any).mock.callCount(), 1);
    });
  });

  describe('updateUser', () => {
    it('should update an user', async () => {
      const userId = '1';
      const userDto: UpdateUserDTO = { id: userId, email: 'test@test.com', password: 'testtest', firstName: 'updated', lastName: 'updated', birthDate: '2025-12-31T00:00:00.000Z' };
      const prismaUser: User = { id: userId, email: userDto.email!, password: 'hashed_password', firstName: userDto.firstName!, lastName: userDto.lastName!, birthDate: new Date(userDto.birthDate!), createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') };
      const data: Prisma.UserUpdateInput = { email: userDto.email, password: 'hashed_password', firstName: userDto.firstName, lastName: userDto.lastName, birthDate: userDto.birthDate ? new Date(userDto.birthDate) : undefined };
      const where: Prisma.UserWhereUniqueInput = { id: userDto.id };
      const responseUserDto: ResponseUserDTO = {
        id: prismaUser.id,
        email: prismaUser.email,
        firstName: prismaUser.firstName,
        lastName: prismaUser.lastName,
        birthDate: prismaUser.birthDate ? prismaUser.birthDate.toISOString() : null,
        createdAt: prismaUser.createdAt.toISOString(),
        updatedAt: prismaUser.updatedAt.toISOString()
      };

      (UserDAO.updateUser as any).mock.mockImplementationOnce(() => Promise.resolve(prismaUser));

      const result = await UserService.updateUser(userDto);

      const callArgs = (UserDAO.updateUser as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [where, data]);
      assert.deepStrictEqual(result, responseUserDto);
      assert.strictEqual((UserDAO.updateUser as any).mock.callCount(), 1);
    });

    it('should throw error if user was not found', async () => {
      const userId = '1';
      const userDto: UpdateUserDTO = { id: userId, email: 'test@test.com', password: 'testtest', firstName: 'updated', lastName: 'updated', birthDate: '2025-12-31T00:00:00.000Z' };

      (UserDAO.updateUser as any).mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await UserService.updateUser(userDto);
        },
        (error: any) => {
          assert(error instanceof ResourceNotFoundError);
          assert.strictEqual(error.message, USER_NOT_FOUND);
          return true;
        }
      );
      assert.strictEqual((UserDAO.updateUser as any).mock.callCount(), 1);
    });
  });

  describe('deleteUser', () => {
    it('should delete an user', async () => {
      const userId = '1';
      const where: Prisma.UserWhereUniqueInput = { id: userId };
      const prismaUser: User = { id: userId, email: 'test@test.com', password: 'hashed_password', firstName: null, lastName: null, birthDate: null, createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') };

      (UserDAO.deleteUser as any).mock.mockImplementationOnce(() => Promise.resolve(prismaUser));

      await UserService.deleteUser(userId);

      const callArgs = (UserDAO.deleteUser as any).mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs, [where]);
      assert.strictEqual((UserDAO.deleteUser as any).mock.callCount(), 1);
    });

    it('should throw error if user was not found', async () => {
      const userId = '1';

      (UserDAO.deleteUser as any).mock.mockImplementationOnce(() => Promise.resolve(null));

      await assert.rejects(
        async () => {
          await UserService.deleteUser(userId);
        },
        (error: any) => {
          assert(error instanceof ResourceNotFoundError);
          assert.strictEqual(error.message, USER_NOT_FOUND);
          return true;
        }
      );
      assert.strictEqual((UserDAO.deleteUser as any).mock.callCount(), 1);
    });
  });
});
