import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
// Import config to load OAuth credentials
import { logger } from './utils/logger.js';
import { rateLimiter } from './middleware/rateLimiter.js';
// Import WebSocket service early since it doesn't depend on OAuth
import { WebSocketManager } from './services/websocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function startServer() {
  // Load environment variables - fix path to look in backend root
  // When running from dist/, need to go up two levels: dist/ -> src/ -> backend/
  dotenv.config({ path: join(__dirname, '../../.env') });

  // Also try the direct path as fallback
  if (!process.env.SLACK_CLIENT_ID && !process.env.GOOGLE_CLIENT_ID) {
    dotenv.config({ path: join(__dirname, '../.env') });
  }

  // Import and use config to ensure OAuth credentials are available
  try {
    const configPath = join(__dirname, '../config.js');
    await import(configPath);
    logger.info('Configuration loaded successfully');
  } catch (error) {
    logger.warn('Could not load config.js file:', error);
  }

  // Now import services and routes after config is loaded
  const { errorHandler } = await import('./middleware/errorHandler.js');
  const { authRouter } = await import('./routes/auth.js');
  const { slackRouter } = await import('./routes/slack.js');
  const { gmailRouter } = await import('./routes/gmail.js');
  const { browserHistoryRouter } = await import('./routes/browserHistory.js');
  
  // Initialize browser history service
  const { browserHistoryService } = await import('./services/browserHistoryService.js');
  try {
    await browserHistoryService.initialize();
  } catch (error) {
    logger.warn('Could not initialize browser history service:', error);
  }

  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  // Initialize WebSocket manager
  const wsManager = new WebSocketManager(wss);

  const PORT = process.env.PORT || 3001;
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // CORS configuration
  app.use(cors({
    origin: [FRONTEND_URL, 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Compression and parsing middleware
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rate limiting
  app.use(rateLimiter);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // API routes
  app.use('/api/auth', authRouter);
  app.use('/api/slack', slackRouter);
  app.use('/api/gmail', gmailRouter);
  app.use('/api/history', browserHistoryRouter);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ 
      error: 'Not Found', 
      message: `Route ${req.originalUrl} not found` 
    });
  });

  // Error handling middleware
  app.use(errorHandler);

  // Start server
  server.listen(PORT, () => {
    logger.info(`🚀 Backend server running on port ${PORT}`);
    logger.info(`📡 WebSocket server ready for connections`);
    logger.info(`🔗 CORS enabled for: ${FRONTEND_URL}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  });

  return { app, server, wsManager };
}

// Start the server
startServer().catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export { startServer }; 