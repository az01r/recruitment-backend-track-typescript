import type { Request, Response, NextFunction } from 'express';
import { ConflictError, ReqValidationError, ResourceNotFoundError, UnauthorizedError } from '../types/error.js';
import logger from '../utils/logger.js';

export default (error: Error, req: Request, res: Response, _next: NextFunction) => {
  const message = error.message || "Internal Server Error";

  let validationErrors;
  if (error instanceof ReqValidationError) {
    validationErrors = error.errors;
    res.status(422);
  } else if (error instanceof ResourceNotFoundError) {
    res.status(404);
  } else if (error instanceof UnauthorizedError) {
    res.status(401);
  } else if (error instanceof ConflictError) {
    res.status(409);
  } else {
    logger.error({
      err: error,
      path: req.path,
      method: req.method,
      body: req.body
    }, 'Server error');
    res.status(500);
  }

  res.json({
    status: 'error',
    message,
    ...(validationErrors && { errors: validationErrors })
  });
};