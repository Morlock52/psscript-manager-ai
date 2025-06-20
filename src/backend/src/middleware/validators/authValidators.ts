import { Request, Response, NextFunction } from 'express';

/**
 * Dummy login validator middleware.
 */
export function validateLogin(req: Request, res: Response, next: NextFunction): void {
  next();
}
