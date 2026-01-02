import { after, beforeEach, describe, it, mock } from "node:test";
import assert from 'node:assert';
import { UserDAO } from "./user-dao";
import { Prisma, User } from "../generated/prisma/client";

describe('UserDAO', () => {
  let userDAO: UserDAO;
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
    userDAO = new UserDAO(prismaMock);
  });

  after(() => {
    mock.reset();
  });

  describe('createUser', () => {
    it('should create an user', async () => {
      const data: Prisma.UserCreateInput = { email: 'test@test.com', password: 'hashed_password' };
      const prismaUser: User = { id: '1', email: 'test@test.com', password: 'hashed_password', firstName: null, lastName: null, birthDate: null, createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') };

      prismaMock.user.create.mock.mockImplementationOnce(() => Promise.resolve(prismaUser));

      const result = await userDAO.createUser(data);

      const callArgs = prismaMock.user.create.mock.calls[0].arguments[0];
      assert.deepStrictEqual(callArgs, { data });
      assert.deepStrictEqual(result, prismaUser);
      assert.strictEqual(prismaMock.user.create.mock.callCount(), 1);
    });
  });

  describe('findUser', () => {
    it('should find an user', async () => {
      const where: Prisma.UserWhereUniqueInput = { id: '1' };
      const prismaUser: User = { id: '1', email: 'test@test.com', password: 'hashed_password', firstName: null, lastName: null, birthDate: null, createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') };

      prismaMock.user.findUnique.mock.mockImplementationOnce(() => Promise.resolve(prismaUser));

      const result = await userDAO.findUser(where);

      const callArgs = prismaMock.user.findUnique.mock.calls[0].arguments[0];
      assert.deepStrictEqual(callArgs, { where });
      assert.deepStrictEqual(result, prismaUser);
      assert.strictEqual(prismaMock.user.findUnique.mock.callCount(), 1);
    });

    it('should return null if user was not found', async () => {
      const where: Prisma.UserWhereUniqueInput = { id: 'notfound' };

      prismaMock.user.findUnique.mock.mockImplementationOnce(() => Promise.resolve(null));

      const result = await userDAO.findUser(where);

      assert.strictEqual(result, null);
      assert.strictEqual(prismaMock.user.findUnique.mock.callCount(), 1);
    });
  });

  describe('updateUser', () => {
    it('should update an user', async () => {
      const where: Prisma.UserWhereUniqueInput = { id: '1' };
      const data: Prisma.UserUpdateInput = { email: 'test@test.com', password: 'hashed_password', firstName: 'updated', lastName: 'updated', birthDate: new Date('2025-01-01T00:00:00.000Z') };
      const updatedUser: User = { id: '1', email: 'test@test.com', password: 'hashed_password', firstName: 'updated', lastName: 'updated', birthDate: data.birthDate as Date, createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') };

      prismaMock.user.update.mock.mockImplementationOnce(() => Promise.resolve(updatedUser));

      const result = await userDAO.updateUser(where, data);

      const callArgs = prismaMock.user.update.mock.calls[0].arguments[0];
      assert.deepStrictEqual(callArgs, { where, data });
      assert.deepStrictEqual(result, updatedUser);
      assert.strictEqual(prismaMock.user.update.mock.callCount(), 1);
    });

    it('should return null if user was not found', async () => {
      const where: Prisma.UserWhereUniqueInput = { id: 'notfound' };

      prismaMock.user.update.mock.mockImplementationOnce(() => Promise.resolve(null));

      const result = await userDAO.updateUser(where, {});

      assert.strictEqual(result, null);
      assert.strictEqual(prismaMock.user.update.mock.callCount(), 1);
    });
  });

  describe('deleteUser', () => {
    it('should delete an user', async () => {
      const where: Prisma.UserWhereUniqueInput = { id: '1' };
      const deletedUser: User = { id: '1', email: 'test@test.com', password: 'hashed_password', firstName: null, lastName: null, birthDate: null, createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z') };

      prismaMock.user.delete.mock.mockImplementationOnce(() => Promise.resolve(deletedUser));

      const result = await userDAO.deleteUser(where);

      const callArgs = prismaMock.user.delete.mock.calls[0].arguments[0];
      assert.deepStrictEqual(callArgs, { where });
      assert.deepStrictEqual(result, deletedUser);
      assert.strictEqual(prismaMock.user.delete.mock.callCount(), 1);
    });

    it('should return null if user was not found', async () => {
      const where: Prisma.UserWhereUniqueInput = { id: 'notfound' };

      prismaMock.user.delete.mock.mockImplementationOnce(() => Promise.resolve(null));

      const result = await userDAO.deleteUser(where);

      assert.strictEqual(result, null);
      assert.strictEqual(prismaMock.user.delete.mock.callCount(), 1);
    });
  });
});