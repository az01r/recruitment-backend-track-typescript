import type { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

/**
 * Middleware to log all HTTP requests and responses.
 * Logs incoming requests and completion with duration and status code.
 */
export default function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  // Log incoming request
  logger.info({
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip
  }, 'Incoming request');

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

    logger[logLevel]({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration
    }, 'Request completed');
  });

  next();
}
