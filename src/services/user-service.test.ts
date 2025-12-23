import { describe, it, mock, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import { UserService } from "./user-service.js";
import { Prisma } from '../generated/prisma/client.js';

describe('UserService', () => {
  let userService: UserService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      user: {
        create: mock.fn(),
        findUnique: mock.fn(),
        update: mock.fn(),
        delete: mock.fn(),
      },
    };
    userService = new UserService(prismaMock);
  });

  after(() => {
    mock.reset();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData: Prisma.UserCreateInput = { email: 'test@test.com', password: 'testtest' };

      const createdUser = { id: '1', ...userData, createdAt: new Date(), updatedAt: new Date() };
      prismaMock.user.create.mock.mockImplementationOnce(() => Promise.resolve(createdUser));

      const result = await userService.createUser(userData);

      const callArgs = prismaMock.user.create.mock.calls[0].arguments[0];
      assert.deepStrictEqual(callArgs, { data: userData });
      assert.deepStrictEqual(result, createdUser);
      assert.strictEqual(prismaMock.user.create.mock.callCount(), 1);
    });

    describe('findUser', () => {
      it('should find a user by email', async () => {
        const where: Prisma.UserWhereUniqueInput = { email: 'test@test.com' };

        const user = { id: '1', email: 'test@test.com', password: 'testtest' };
        prismaMock.user.findUnique.mock.mockImplementationOnce(() => Promise.resolve(user));

        const result = await userService.findUser(where);

        const callArgs = prismaMock.user.findUnique.mock.calls[0].arguments[0];
        assert.deepStrictEqual(callArgs, { where });
        assert.deepStrictEqual(result, user);
        assert.strictEqual(prismaMock.user.findUnique.mock.callCount(), 1);
      });

      it('should find a user by id', async () => {
        const where: Prisma.UserWhereUniqueInput = { id: '1' };

        const user = { id: '1', email: 'test@test.com', password: 'testtest' };
        prismaMock.user.findUnique.mock.mockImplementationOnce(() => Promise.resolve(user));

        const result = await userService.findUser(where);

        const callArgs = prismaMock.user.findUnique.mock.calls[0].arguments[0];
        assert.deepStrictEqual(callArgs, { where });
        assert.deepStrictEqual(result, user);
        assert.strictEqual(prismaMock.user.findUnique.mock.callCount(), 1);
      });

      it('should return null if user was not found', async () => {
        const where: Prisma.UserWhereUniqueInput = { email: 'notfound@test.com' };

        prismaMock.user.findUnique.mock.mockImplementationOnce(() => Promise.resolve(null));

        const result = await userService.findUser(where);

        assert.strictEqual(result, null);
        assert.strictEqual(prismaMock.user.findUnique.mock.callCount(), 1);
      });
    });

    describe('updateUser', () => {
      it('should update a user', async () => {
        const where: Prisma.UserWhereUniqueInput = { id: '1' };
        const data: Prisma.UserUpdateInput = { firstName: 'Updated Name' };

        const updatedUser = { id: '1', email: 'test@test.com', ...data };
        prismaMock.user.update.mock.mockImplementationOnce(() => Promise.resolve(updatedUser));

        const result = await userService.updateUser(where, data);

        const callArgs = prismaMock.user.update.mock.calls[0].arguments[0];
        assert.deepStrictEqual(callArgs, { where, data });
        assert.deepStrictEqual(result, updatedUser);
        assert.strictEqual(prismaMock.user.update.mock.callCount(), 1);
      });

      it('should return null if user was not found', async () => {
        const where: Prisma.UserWhereUniqueInput = { id: 'notfound' };
        const data: Prisma.UserUpdateInput = { firstName: 'Updated Name' };

        prismaMock.user.update.mock.mockImplementationOnce(() => Promise.resolve(null));

        const result = await userService.updateUser(where, data);

        assert.strictEqual(result, null);
        assert.strictEqual(prismaMock.user.update.mock.callCount(), 1);
      });
    });

    describe('deleteUser', () => {
      it('should delete a user', async () => {
        const where: Prisma.UserWhereUniqueInput = { id: '1' };

        const deletedUser = { id: '1', email: 'test@test.com' };
        prismaMock.user.delete.mock.mockImplementationOnce(() => Promise.resolve(deletedUser));

        const result = await userService.deleteUser(where);

        const callArgs = prismaMock.user.delete.mock.calls[0].arguments[0];
        assert.deepStrictEqual(callArgs, { where });
        assert.deepStrictEqual(result, deletedUser);
        assert.strictEqual(prismaMock.user.delete.mock.callCount(), 1);
      });

      it('should return null if user was not found', async () => {
        const where: Prisma.UserWhereUniqueInput = { id: 'notfound' };

        prismaMock.user.delete.mock.mockImplementationOnce(() => Promise.resolve(null));

        const result = await userService.deleteUser(where);

        assert.strictEqual(result, null);
        assert.strictEqual(prismaMock.user.delete.mock.callCount(), 1);
      });
    });
  });
});
