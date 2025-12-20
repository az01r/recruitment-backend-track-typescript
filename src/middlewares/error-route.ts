import type { Request, Response, NextFunction } from 'express';
import ReqValidationError from '../types/req-validation-error.js';

export default (error: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.statusCode < 400 && res.status(500);
  const message = error.message || "Internal Server Error";
  const validationErrors = error instanceof ReqValidationError && error.errors;

  res.json({
    status: 'error',
    message,
    ...(validationErrors && { errors: validationErrors })
  });
};
