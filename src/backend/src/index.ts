/**
 * @ts-nocheck - Required for flexible middleware integration and error handling
 * Application entry point
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import logger from './utils/logger';
import authRoutes from './routes/auth'; // Re-enabled auth routes
import scriptRoutes from './routes/scripts';
import userRoutes from './routes/users';
import categoryRoutes from './routes/categories';
import tagRoutes from './routes/tags';
import analyticsRoutes from './routes/analytics';
import healthRoutes from './routes/health';
import chatRoutes from './routes/chat';
import aiAgentRoutes from './routes/ai-agent';
import aiRoutes from './routes/ai';
import aiagentRoutes from './routes/aiagent';
import { errorHandler } from './middleware/errorHandler';
import { setupSwagger } from './utils/swagger';
import cacheService from './utils/redis-client';
import path from 'path';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// --- CORS Middleware: Allow frontend dev server ---
app.use(cors({
  origin: 'http://localhost:3002', // Change if your frontend runs elsewhere
  credentials: true
}));

app.use(express.static(path.join(process.cwd(), 'src', 'backend', 'src', 'public')));
const port = process.env.PORT || 4001;
const isProduction = process.env.NODE_ENV === 'production';

// Log startup details
console.log(`Starting server: PORT=${port}, ENV=${process.env.NODE_ENV || 'development'}, DOCKER=${process.env.DOCKER_ENV || 'false'}`);

// Security middleware with more permissive settings for file uploads
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  // Remove 'contentSecurityPolicy: false' to enable default CSP
  // crossOriginEmbedderPolicy: false // Keep this if needed, otherwise remove or set to true/require-corp
}));

// Enable CORS - configure specifically for the frontend origin and allow credentials
app.use(cors({
  origin: 'http://localhost:3002', // Allow specific frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  credentials: true, // Allow credentials (cookies, authorization headers)
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Request logging in non-test environments
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { 
    stream: { 
      write: (message) => logger.info(message.trim()) 
    }
  }));
}

// Compression middleware to reduce response size
app.use(compression());

// Rate limiting to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// Apply rate limiting to authentication endpoints
app.use('/api/auth', apiLimiter);

// Body parsing middleware with increased limits for script content
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Setup Swagger API documentation
setupSwagger(app);

// API routes
app.use('/api/auth', authRoutes); // Re-enabled auth routes
app.use('/api/scripts', scriptRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai-agent', aiAgentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/aiagent', aiagentRoutes);

// Create proxy routes for the frontend to use
// This ensures the frontend can directly call /scripts/please instead of /api/ai-agent/please
app.use('/scripts/please', (req, res) => {
  req.url = '/api/ai-agent/please';
  (app as any)._router.handle(req, res);
});

app.use('/scripts/analyze/assistant', (req, res) => {
  req.url = '/api/ai-agent/analyze/assistant';
  (app as any)._router.handle(req, res);
});

app.use('/scripts/generate', (req, res) => {
  req.url = '/api/ai-agent/generate';
  (app as any)._router.handle(req, res);
});

app.use('/scripts/explain', (req, res) => {
  req.url = '/api/ai-agent/explain';
  (app as any)._router.handle(req, res);
});

app.use('/scripts/examples', (req, res) => {
  req.url = '/api/ai-agent/examples';
  (app as any)._router.handle(req, res);
});

// Root route with API information
app.get('/api', (req, res) => {
  res.json({
    message: 'PowerShell Script Management API',
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    documentation: '/api-docs',
    status: 'healthy'
  });
});

// Serve the index.html file at the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler - must be before the error handler
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource at ${req.originalUrl} was not found`
  });
});

// Error handling middleware
app.use(errorHandler);

// Category initialization
try {
  const CategoryController = require('./controllers/CategoryController').default;
  CategoryController.initializeDefaultCategories();
  logger.info('Default categories initialized');
} catch (error) {
  logger.error('Error initializing default categories:', error);
}

// Set server timeouts
const server = app.listen(port);
server.timeout = 60000; // 60 seconds

// Handle server errors
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${port} is already in use. Exiting.`);
  } else {
    logger.error('Server error:', error);
  }
  process.exit(1);
});

// Graceful shutdown logic
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully...`);
  
  // Close HTTP server (stop accepting new connections)
  server.close(async () => {
    logger.info('HTTP server closed');
    
    logger.info('Shutdown completed');
    process.exit(0);
  });
  
  // Force close if graceful shutdown fails
  setTimeout(() => {
    logger.error('Shutdown took too long, forcing exit');
    process.exit(1);
  }, 30000); // 30 seconds timeout
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  // Don't exit immediately in production to allow for graceful handling
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection:', reason);
  // Log but don't crash in production
});

// Start server
app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Server running on http://localhost:${port} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Export cache for other modules
export const cache = cacheService;
