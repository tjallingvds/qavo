import express from 'express';
import { browserHistoryService } from '../services/browserHistoryService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * Store a browser history entry
 * POST /api/history
 */
router.post('/', async (req, res) => {
  try {
    const { url, title, timestamp, userId } = req.body;
    
    if (!url || !title || !timestamp || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'URL, title, timestamp, and userId are required' 
      });
    }
    
    const historyEntry = await browserHistoryService.storeHistoryEntry({
      url,
      title,
      timestamp,
      userId
    });
    
    return res.status(201).json(historyEntry);
  } catch (error: any) {
    // Don't treat search engine skips as errors
    if (error.message === 'Search engine URL skipped') {
      return res.status(200).json({ 
        skipped: true, 
        message: 'Search engine URL skipped' 
      });
    }
    
    logger.error('Error storing browser history:', error);
    return res.status(500).json({ 
      error: 'Failed to store browser history', 
      message: error.message 
    });
  }
});

/**
 * Query browser history
 * POST /api/history/query
 */
router.post('/query', async (req, res) => {
  try {
    const query = req.body;
    
    if (!query.userId) {
      return res.status(400).json({ 
        error: 'Missing userId', 
        message: 'userId is required for querying history' 
      });
    }
    
    const results = await browserHistoryService.queryHistory(query);
    return res.status(200).json(results);
  } catch (error: any) {
    logger.error('Error querying browser history:', error);
    return res.status(500).json({ 
      error: 'Failed to query browser history', 
      message: error.message 
    });
  }
});

/**
 * Get history statistics
 * GET /api/history/stats/:userId
 */
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'Missing userId', 
        message: 'userId is required for getting statistics' 
      });
    }
    
    const stats = await browserHistoryService.getHistoryStats(userId);
    return res.status(200).json(stats);
  } catch (error: any) {
    logger.error('Error getting browser history stats:', error);
    return res.status(500).json({ 
      error: 'Failed to get browser history statistics', 
      message: error.message 
    });
  }
});

/**
 * Delete history entries
 * DELETE /api/history/:userId
 * Query params: ids (comma-separated list of entry IDs to delete, optional)
 */
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { ids } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'Missing userId', 
        message: 'userId is required for deleting history' 
      });
    }
    
    let entryIds: string[] | undefined;
    
    if (ids && typeof ids === 'string') {
      entryIds = ids.split(',');
    }
    
    const count = await browserHistoryService.deleteHistoryEntries(userId, entryIds);
    
    return res.status(200).json({ 
      success: true, 
      message: `Deleted ${count} history entries`, 
      count 
    });
  } catch (error: any) {
    logger.error('Error deleting browser history:', error);
    return res.status(500).json({ 
      error: 'Failed to delete browser history', 
      message: error.message 
    });
  }
});

/**
 * Bulk store browser history entries
 * POST /api/history/bulk
 */
router.post('/bulk', async (req, res) => {
  try {
    const { entries } = req.body;
    
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid entries', 
        message: 'Entries must be a non-empty array' 
      });
    }
    
    const results = {
      total: entries.length,
      successful: 0,
      skipped: 0,
      failed: 0
    };
    
    for (const entry of entries) {
      try {
        if (!entry.url || !entry.title || !entry.timestamp || !entry.userId) {
          results.failed++;
          continue;
        }
        
        await browserHistoryService.storeHistoryEntry({
          url: entry.url,
          title: entry.title,
          timestamp: entry.timestamp,
          userId: entry.userId
        });
        
        results.successful++;
      } catch (error: any) {
        if (error.message === 'Search engine URL skipped') {
          results.skipped++;
        } else {
          results.failed++;
        }
      }
    }
    
    return res.status(200).json(results);
  } catch (error: any) {
    logger.error('Error bulk storing browser history:', error);
    return res.status(500).json({ 
      error: 'Failed to bulk store browser history', 
      message: error.message 
    });
  }
});

export const browserHistoryRouter = router; 