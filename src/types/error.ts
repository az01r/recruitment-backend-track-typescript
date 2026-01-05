import { ValidationError } from 'express-validator';

export class ReqValidationError extends Error {
  errors?: ValidationError[];

  constructor({ message, errors }: { message: string, errors?: ValidationError[] }) {
    super(message);
    this.errors = errors;
  }
}

export class ResourceNotFoundError extends Error { }
export class UnauthorizedError extends Error { }
export class ConflictError extends Error { }