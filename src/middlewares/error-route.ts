import type { Request, Response, NextFunction } from 'express';

export default (error: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.statusCode < 400 && res.status(500);
  const message = error.message || "An error occured";
  res.json({ message });
};
