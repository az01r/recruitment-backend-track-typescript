import { type Request, type Response, type NextFunction } from 'express';
import { validationResult } from 'express-validator';
import ReqValidationError from '../types/req-validation-error.js';

export const validateRequest = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new ReqValidationError({ message: 'Validation error', errors: errors.array(), statusCode: 422 });
    next(error);
  }
  next();
};
