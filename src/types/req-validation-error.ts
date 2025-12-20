import { ValidationError } from 'express-validator';

export default class ReqValidationError extends Error {
  errors?: ValidationError[];
  statusCode?: number;

  constructor({ message, errors, statusCode }: { message: string, errors?: ValidationError[], statusCode?: number }) {
    super(message);
    this.errors = errors;
    this.statusCode = statusCode;
  }
}