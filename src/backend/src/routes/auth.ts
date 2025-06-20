import express from 'express';
import AuthController from '../controllers/AuthController'; // Assuming controller exists
import { validateLogin } from '../middleware/validators/authValidators'; // Assuming validators exist

const router = express.Router();

// POST /api/auth/login
router.post('/login', validateLogin, AuthController.login);

// You might need other routes like /register, /refresh-token, /logout, /me
// Add them here if necessary based on AuthController capabilities

export default router;
