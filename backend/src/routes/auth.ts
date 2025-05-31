import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { gmailService } from '../services/gmailService.js';
import { slackService } from '../services/slackService.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Gmail OAuth routes
router.get('/gmail/url', asyncHandler(async (req: Request, res: Response) => {
  try {
    const authUrl = gmailService.generateAuthUrl();
    res.json({
      success: true,
      data: { authUrl }
    });
  } catch (error) {
    logger.error('Failed to generate Gmail auth URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate authentication URL'
    });
  }
}));

router.get('/gmail/callback', asyncHandler(async (req: Request, res: Response) => {
  const { code, error } = req.query;

  if (error) {
    logger.error('Gmail OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}?auth_error=${error}`);
    return;
  }

  if (!code) {
    res.redirect(`${process.env.FRONTEND_URL}?auth_error=no_code`);
    return;
  }

  try {
    const success = await gmailService.authenticate(code as string);
    
    if (success) {
      res.redirect(`${process.env.FRONTEND_URL}?auth_success=gmail`);
    } else {
      res.redirect(`${process.env.FRONTEND_URL}?auth_error=authentication_failed`);
    }
  } catch (error) {
    logger.error('Gmail OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}?auth_error=authentication_failed`);
  }
}));

// Slack OAuth routes
router.get('/slack/url', asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!slackService.isConfigured()) {
      res.status(503).json({
        success: false,
        message: 'Slack OAuth not configured'
      });
      return;
    }

    const state = req.query.state as string;
    const authUrl = slackService.generateAuthUrl(state);
    
    res.json({
      success: true,
      data: { authUrl }
    });
  } catch (error) {
    logger.error('Failed to generate Slack auth URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate authentication URL'
    });
  }
}));

router.get('/slack/callback', asyncHandler(async (req: Request, res: Response) => {
  const { code, error, state } = req.query;

  if (error) {
    logger.error('Slack OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}?auth_error=${error}`);
    return;
  }

  if (!code) {
    res.redirect(`${process.env.FRONTEND_URL}?auth_error=no_code`);
    return;
  }

  try {
    const result = await slackService.exchangeCodeForToken(code as string);
    
    // Store tokens securely (you might want to implement proper token storage)
    logger.info('Slack authentication successful for user:', result.user.id);
    
    res.redirect(`${process.env.FRONTEND_URL}?auth_success=slack&user=${encodeURIComponent(JSON.stringify(result.user))}`);
  } catch (error) {
    logger.error('Slack OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}?auth_error=authentication_failed`);
  }
}));

router.post('/slack/callback', asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.body;

  if (!code) {
    res.status(400).json({
      success: false,
      message: 'Authorization code is required'
    });
    return;
  }

  try {
    const result = await slackService.exchangeCodeForToken(code);
    
    res.json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user,
        team: result.team
      }
    });
  } catch (error) {
    logger.error('Slack OAuth callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
}));

// Test connections
router.get('/test/gmail', asyncHandler(async (req: Request, res: Response) => {
  try {
    const isConnected = await gmailService.testConnection();
    
    res.json({
      success: true,
      data: {
        configured: true, // Gmail service is always configured if it exists
        connected: isConnected,
        service: 'gmail'
      }
    });
  } catch (error) {
    logger.error('Gmail connection test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Gmail connection test failed'
    });
  }
}));

router.get('/test/slack', asyncHandler(async (req: Request, res: Response) => {
  try {
    const userToken = req.headers.authorization?.replace('Bearer ', '') || req.query.token as string;
    
    if (!userToken) {
      res.status(401).json({
        success: false,
        message: 'User token required for Slack connection test'
      });
      return;
    }

    const isConfigured = slackService.isConfigured();
    const isConnected = isConfigured ? await slackService.testConnection(userToken) : false;
    
    res.json({
      success: true,
      data: {
        configured: isConfigured,
        connected: isConnected,
        service: 'slack'
      }
    });
  } catch (error) {
    logger.error('Slack connection test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Slack connection test failed'
    });
  }
}));

// General service status
router.get('/status', asyncHandler(async (req: Request, res: Response) => {
  try {
    const status = {
      gmail: {
        configured: true, // Gmail service is always configured if it exists
        connected: false
      },
      slack: {
        configured: slackService.isConfigured(),
        connected: false
      }
    };

    // Test Gmail connection if configured
    try {
      status.gmail.connected = await gmailService.testConnection();
    } catch (error) {
      logger.warn('Gmail connection test failed during status check:', error);
    }

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Failed to get auth status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get authentication status'
    });
  }
}));

// Logout endpoints
router.post('/logout/gmail', asyncHandler(async (req: Request, res: Response) => {
  try {
    const success = await gmailService.disconnect();
    
    if (success) {
      logger.info('Gmail disconnected successfully');
      res.json({
        success: true,
        message: 'Gmail disconnected successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to disconnect Gmail'
      });
    }
  } catch (error) {
    logger.error('Gmail logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect Gmail'
    });
  }
}));

router.post('/logout/slack', asyncHandler(async (req: Request, res: Response) => {
  try {
    const success = await slackService.disconnect();
    
    if (success) {
      logger.info('Slack disconnected successfully');
      res.json({
        success: true,
        message: 'Slack disconnected successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to disconnect Slack'
      });
    }
  } catch (error) {
    logger.error('Slack logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect Slack'
    });
  }
}));

export { router as authRouter }; 