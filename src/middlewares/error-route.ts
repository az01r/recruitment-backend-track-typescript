import type { Request, Response, NextFunction } from 'express';
import ReqValidationError from '../types/req-validation-error.js';
import logger from '../utils/logger.js';

export default (error: Error, req: Request, res: Response, _next: NextFunction) => {
  res.statusCode < 400 && res.status(500);
  const message = error.message || "Internal Server Error";

  let validationErrors;
  if (error instanceof ReqValidationError) {
    validationErrors = error.errors
    error.statusCode && res.status(error.statusCode);

    logger.warn({
      err: error,
      validationErrors,
      path: req.path,
      method: req.method
    }, 'Validation error');
  } else {
    logger.error({
      err: error,
      path: req.path,
      method: req.method,
      body: req.body
    }, 'Server error');
  }

  res.json({
    status: 'error',
    message,
    ...(validationErrors && { errors: validationErrors })
  });
};
