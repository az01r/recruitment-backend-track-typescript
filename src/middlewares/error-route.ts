import type { Request, Response, NextFunction } from 'express';
import { ConflictError, ReqValidationError, ResourceNotFoundError, UnauthorizedError } from '../types/error.js';
import logger from '../utils/logger.js';
import { VALIDATION_ERROR } from '../utils/constants.js';

// export default (error: Error, req: Request, res: Response, _next: NextFunction) => {
//   res.statusCode < 400 && res.status(500);
//   const message = error.message || "Internal Server Error";

//   let validationErrors;
//   if (error instanceof ReqValidationError) {
//     validationErrors = error.errors
//     error.statusCode && res.status(error.statusCode);

//     logger.warn({
//       err: error,
//       validationErrors,
//       path: req.path,
//       method: req.method
//     }, VALIDATION_ERROR);
//   } else {
//     logger.error({
//       err: error,
//       path: req.path,
//       method: req.method,
//       body: req.body
//     }, 'Server error');
//   }

//   res.json({
//     status: 'error',
//     message,
//     ...(validationErrors && { errors: validationErrors })
//   });
// };

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