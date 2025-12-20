import { ValidationError } from 'express-validator';

export default class ReqValidationError extends Error {
  errors?: ValidationError[];

  constructor(message: string, errors?: ValidationError[]) {
    super(message);
    this.errors = errors;
  }
}