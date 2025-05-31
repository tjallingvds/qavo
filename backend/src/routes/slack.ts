import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { slackService } from '../services/slackService.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Get Slack OAuth URL for user authentication
router.get('/auth-url', asyncHandler(async (req: Request, res: Response) => {
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

// Handle Slack OAuth callback
router.post('/callback', asyncHandler(async (req: Request, res: Response) => {
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

// Get OAuth callback (for handling redirects)
router.get('/callback', asyncHandler(async (req: Request, res: Response) => {
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
    
    // You might want to store the token securely here
    // For now, we'll redirect with a success message
    res.redirect(`${process.env.FRONTEND_URL}?auth_success=slack&user=${encodeURIComponent(JSON.stringify(result.user))}`);
  } catch (error) {
    logger.error('Slack callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}?auth_error=authentication_failed`);
  }
}));

// Helper function to extract user token from request
function getUserToken(req: Request): string | null {
  // Token can be in Authorization header or as a query parameter
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return req.query.token as string || null;
}

// Get all Slack channels (requires user token)
router.get('/channels', asyncHandler(async (req: Request, res: Response) => {
  try {
    const userToken = getUserToken(req);
    if (!userToken) {
      res.status(401).json({
        success: false,
        message: 'User token required'
      });
      return;
    }

    const channels = await slackService.getChannels(userToken);
    res.json({
      success: true,
      data: channels,
      count: channels.length
    });
  } catch (error) {
    logger.error('Failed to fetch Slack channels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch channels'
    });
  }
}));

// Get messages from a specific channel (requires user token)
router.get('/channels/:channelId/messages', asyncHandler(async (req: Request, res: Response) => {
  const { channelId } = req.params;
  const { limit = '50', cursor } = req.query;

  try {
    const userToken = getUserToken(req);
    if (!userToken) {
      res.status(401).json({
        success: false,
        message: 'User token required'
      });
      return;
    }

    const messages = await slackService.getMessages(
      userToken,
      channelId,
      parseInt(limit as string),
      cursor as string
    );

    res.json({
      success: true,
      data: messages,
      count: messages.length,
      channelId
    });
  } catch (error) {
    logger.error(`Failed to fetch messages for channel ${channelId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
}));

// Get channel information (requires user token)
router.get('/channels/:channelId', asyncHandler(async (req: Request, res: Response) => {
  const { channelId } = req.params;

  try {
    const userToken = getUserToken(req);
    if (!userToken) {
      res.status(401).json({
        success: false,
        message: 'User token required'
      });
      return;
    }

    const channel = await slackService.getChannelInfo(userToken, channelId);
    
    if (!channel) {
      res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
      return;
    }

    res.json({
      success: true,
      data: channel
    });
  } catch (error) {
    logger.error(`Failed to fetch channel info for ${channelId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch channel information'
    });
  }
}));

// Send message to a channel (requires user token)
router.post('/channels/:channelId/messages', asyncHandler(async (req: Request, res: Response) => {
  const { channelId } = req.params;
  const { text } = req.body;

  if (!text) {
    res.status(400).json({
      success: false,
      message: 'Message text is required'
    });
    return;
  }

  try {
    const userToken = getUserToken(req);
    if (!userToken) {
      res.status(401).json({
        success: false,
        message: 'User token required'
      });
      return;
    }

    const success = await slackService.sendMessage(userToken, channelId, text);
    
    if (success) {
      res.json({
        success: true,
        message: 'Message sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send message'
      });
    }
  } catch (error) {
    logger.error(`Failed to send message to channel ${channelId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
}));

// Get user information (requires user token)
router.get('/users', asyncHandler(async (req: Request, res: Response) => {
  const { userIds } = req.query;

  if (!userIds) {
    res.status(400).json({
      success: false,
      message: 'User IDs are required'
    });
    return;
  }

  try {
    const userToken = getUserToken(req);
    if (!userToken) {
      res.status(401).json({
        success: false,
        message: 'User token required'
      });
      return;
    }

    const userIdArray = (userIds as string).split(',');
    const users = await slackService.getUsersInfo(userToken, userIdArray);

    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    logger.error('Failed to fetch user information:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user information'
    });
  }
}));

// Test Slack connection (requires user token)
router.get('/test', asyncHandler(async (req: Request, res: Response) => {
  try {
    const userToken = getUserToken(req);
    if (!userToken) {
      res.status(401).json({
        success: false,
        message: 'User token required'
      });
      return;
    }

    const isConnected = await slackService.testConnection(userToken);
    
    res.json({
      success: true,
      data: {
        connected: isConnected,
        status: isConnected ? 'connected' : 'disconnected'
      }
    });
  } catch (error) {
    logger.error('Slack connection test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Connection test failed'
    });
  }
}));

export { router as slackRouter }; 