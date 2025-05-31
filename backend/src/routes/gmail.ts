import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { gmailService } from '../services/gmailService.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Get Gmail messages
router.get('/messages', asyncHandler(async (req: Request, res: Response) => {
  const { 
    labelIds = 'INBOX', 
    maxResults = '50', 
    pageToken 
  } = req.query;

  try {
    const labelArray = (labelIds as string).split(',');
    const result = await gmailService.getMessages(
      labelArray,
      parseInt(maxResults as string),
      pageToken as string
    );

    res.json({
      success: true,
      data: {
        messages: result.messages,
        count: result.messages.length,
        nextPageToken: result.nextPageToken
      }
    });
  } catch (error) {
    logger.error('Failed to fetch Gmail messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
}));

// Get Gmail threads
router.get('/threads', asyncHandler(async (req: Request, res: Response) => {
  const { 
    labelIds = 'INBOX', 
    maxResults = '50', 
    pageToken 
  } = req.query;

  try {
    const labelArray = (labelIds as string).split(',');
    const result = await gmailService.getThreads(
      labelArray,
      parseInt(maxResults as string),
      pageToken as string
    );

    res.json({
      success: true,
      data: result.threads,
      count: result.threads.length,
      nextPageToken: result.nextPageToken
    });
  } catch (error) {
    logger.error('Failed to fetch Gmail threads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch threads'
    });
  }
}));

// Get Gmail labels
router.get('/labels', asyncHandler(async (req: Request, res: Response) => {
  try {
    const labels = await gmailService.getLabels();
    
    res.json({
      success: true,
      data: labels,
      count: labels.length
    });
  } catch (error) {
    logger.error('Failed to fetch Gmail labels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch labels'
    });
  }
}));

// Get unread message count
router.get('/unread-count', asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await gmailService.getMessages(['UNREAD'], 1);
    
    // Note: This is a simplified count. For accurate counts, you'd need to use the Gmail API's 
    // search functionality with a query like "is:unread"
    res.json({
      success: true,
      data: {
        unreadCount: result.messages.length > 0 ? 'many' : 0,
        hasUnread: result.messages.length > 0
      }
    });
  } catch (error) {
    logger.error('Failed to fetch unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count'
    });
  }
}));

// Search messages
router.get('/search', asyncHandler(async (req: Request, res: Response) => {
  const { 
    query,
    maxResults = '20'
  } = req.query;

  if (!query) {
    res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
    return;
  }

  try {
    // For now, we'll use the basic message fetching
    // In a full implementation, you'd use the Gmail search API
    const result = await gmailService.getMessages(
      ['INBOX'],
      parseInt(maxResults as string)
    );

    // Filter messages based on query (simplified search)
    const searchTerm = (query as string).toLowerCase();
    const filteredMessages = result.messages.filter(message => 
      message.subject.toLowerCase().includes(searchTerm) ||
      message.body.toLowerCase().includes(searchTerm) ||
      message.from.toLowerCase().includes(searchTerm)
    );

    res.json({
      success: true,
      data: filteredMessages,
      count: filteredMessages.length,
      query: query
    });
  } catch (error) {
    logger.error('Failed to search Gmail messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search messages'
    });
  }
}));

// Test Gmail connection
router.get('/test', asyncHandler(async (req: Request, res: Response) => {
  try {
    const isConnected = await gmailService.testConnection();
    
    res.json({
      success: true,
      data: {
        connected: isConnected,
        status: isConnected ? 'connected' : 'disconnected'
      }
    });
  } catch (error) {
    logger.error('Gmail connection test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Connection test failed'
    });
  }
}));

export { router as gmailRouter }; 