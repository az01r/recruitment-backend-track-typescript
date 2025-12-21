import { describe, it, mock, beforeEach } from 'node:test';
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

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = { email: 'test@test.com', password: 'testtest' };
      const createdUser = { id: '1', ...userData, createdAt: new Date(), updatedAt: new Date() };
      prismaMock.user.create.mock.mockImplementationOnce(() => Promise.resolve(createdUser));

      const result = await userService.createUser(userData);

      const callArgs = prismaMock.user.create.mock.calls[0].arguments[0];
      assert.deepStrictEqual(callArgs, { data: userData });
      assert.deepStrictEqual(result, createdUser);
      assert.strictEqual(prismaMock.user.create.mock.callCount(), 1);
    });

    describe('findUserByEmail', () => {
      it('should find a user by email', async () => {
        const email = 'test@test.com';
        const user = { id: '1', email, password: 'testtest' };
        prismaMock.user.findUnique.mock.mockImplementationOnce(() => Promise.resolve(user));

        const result = await userService.findUserByEmail(email);

        const callArgs = prismaMock.user.findUnique.mock.calls[0].arguments[0];
        assert.deepStrictEqual(callArgs, { where: { email } });
        assert.deepStrictEqual(result, user);
        assert.strictEqual(prismaMock.user.findUnique.mock.callCount(), 1);
      });

      it('should return null if user was not found', async () => {
        prismaMock.user.findUnique.mock.mockImplementationOnce(() => Promise.resolve(null));
        const result = await userService.findUserByEmail('notfound@test.com');
        assert.strictEqual(result, null);
        assert.strictEqual(prismaMock.user.findUnique.mock.callCount(), 1);
      });
    });

    describe('findUserById', () => {
      it('should find a user by id', async () => {
        const id = '1';
        const user = { id, email: 'test@test.com' };
        prismaMock.user.findUnique.mock.mockImplementationOnce(() => Promise.resolve(user));

        const result = await userService.findUserById(id);

        const callArgs = prismaMock.user.findUnique.mock.calls[0].arguments[0];
        assert.deepStrictEqual(callArgs, { where: { id } });
        assert.deepStrictEqual(result, user);
        assert.strictEqual(prismaMock.user.findUnique.mock.callCount(), 1);
      });

      it('should return null if user was not found', async () => {
        prismaMock.user.findUnique.mock.mockImplementationOnce(() => Promise.resolve(null));
        const result = await userService.findUserById('notfound');
        assert.strictEqual(result, null);
        assert.strictEqual(prismaMock.user.findUnique.mock.callCount(), 1);
      });
    });

    describe('updateUser', () => {
      it('should update a user', async () => {
        const id = '1';
        const updateData: Prisma.UserUpdateInput = { firstName: 'Updated Name' };
        const updatedUser = { id, email: 'test@test.com', ...updateData };
        prismaMock.user.update.mock.mockImplementationOnce(() => Promise.resolve(updatedUser));

        const result = await userService.updateUser(id, updateData);

        assert.deepStrictEqual(result, updatedUser);
        assert.strictEqual(prismaMock.user.update.mock.callCount(), 1);
        const callArgs = prismaMock.user.update.mock.calls[0].arguments[0];
        assert.deepStrictEqual(callArgs, { where: { id }, data: updateData });
      });

      it('should return null if user was not found', async () => {
        prismaMock.user.update.mock.mockImplementationOnce(() => Promise.resolve(null));
        const result = await userService.updateUser('notfound', { firstName: 'Updated Name' });
        assert.strictEqual(result, null);
        assert.strictEqual(prismaMock.user.update.mock.callCount(), 1);
      });
    });

    describe('deleteUser', () => {
      it('should delete a user', async () => {
        const id = '1';
        const deletedUser = { id, email: 'test@test.com' };
        prismaMock.user.delete.mock.mockImplementationOnce(() => Promise.resolve(deletedUser));

        const result = await userService.deleteUser(id);

        assert.deepStrictEqual(result, deletedUser);
        assert.strictEqual(prismaMock.user.delete.mock.callCount(), 1);
        const callArgs = prismaMock.user.delete.mock.calls[0].arguments[0];
        assert.deepStrictEqual(callArgs, { where: { id } });
      });

      it('should return null if user was not found', async () => {
        prismaMock.user.delete.mock.mockImplementationOnce(() => Promise.resolve(null));
        const result = await userService.deleteUser('notfound');
        assert.strictEqual(result, null);
        assert.strictEqual(prismaMock.user.delete.mock.callCount(), 1);
      });
    });
  });
});
