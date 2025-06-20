import { Request, Response } from 'express';
import User from '../models/User';

/**
 * Controller for authentication endpoints.
 */
class AuthController {
  /**
   * Handle user login.
   *
   * Args:
   *   req (Request): Express request object.
   *   res (Response): Express response object.
   *
   * Returns:
   *   void: Sends a JSON response.
   */
  static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }
    try {
      // Find user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        res.status(401).json({ message: 'Invalid email or password.' });
        return;
      }
      // Compare password
      const bcrypt = require('bcrypt');
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        res.status(401).json({ message: 'Invalid email or password.' });
        return;
      }
      // Generate dummy token (replace with JWT in production)
      const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64');
      res.json({ token, user: { id: user.id, email: user.email, username: user.username, role: user.role } });
    } catch (err) {
      res.status(500).json({ message: 'Internal server error.', error: err.message });
    }
  }
}

export default AuthController;
