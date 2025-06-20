import { Request, Response, NextFunction } from 'express';
import { UserPayload } from '../controllers/ScriptController';

/**
 * Dummy JWT authentication middleware.
 */
export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  // Inject a fake admin user with all required fields for UserPayload
  req.user = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
  };
  next();
}

/**
 * Middleware to require admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
}
