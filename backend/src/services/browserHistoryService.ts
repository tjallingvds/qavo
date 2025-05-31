import { ChromaClient, Collection, OpenAIEmbeddingFunction } from 'chromadb';
import { OpenAI } from 'openai';
import puppeteer from 'puppeteer';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';
import { HistoryEntry, HistoryQuery, HistoryStats, TopicSummary } from '../types/browserHistory.js';

/**
 * Service to manage browser history with vector storage
 */
export class BrowserHistoryService {
  private chromaClient: ChromaClient;
  private historyCollection: Collection | null = null;
  private openai: OpenAI;
  private embeddingFunction: OpenAIEmbeddingFunction;
  private initialized = false;
  private searchEngineRegex = /google\.com\/search|bing\.com\/search|search\.yahoo\.com|duckduckgo\.com\/\?q=|baidu\.com\/s\?|yandex\.ru\/search/;

  constructor() {
    this.chromaClient = new ChromaClient({
      path: process.env.CHROMA_URL || 'http://localhost:8000'
    });
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.embeddingFunction = new OpenAIEmbeddingFunction({
      openai_api_key: process.env.OPENAI_API_KEY || '',
      model_name: 'text-embedding-3-small'
    });
  }

  /**
   * Initialize the browser history service
   */
  async initialize(): Promise<void> {
    try {
      // Create or get the history collection
      this.historyCollection = await this.chromaClient.getOrCreateCollection({
        name: 'browser_history',
        embeddingFunction: this.embeddingFunction,
        metadata: { 
          description: 'User browser history with embeddings for AI retrieval'
        }
      });
      
      this.initialized = true;
      logger.info('Browser history vector database initialized');
    } catch (error) {
      logger.error('Failed to initialize browser history service:', error);
      throw error;
    }
  }

  /**
   * Check if URL is from a search engine
   */
  private isSearchEngineUrl(url: string): boolean {
    return this.searchEngineRegex.test(url);
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return domain;
    } catch (error) {
      logger.error('Failed to extract domain from URL:', error);
      return 'unknown-domain';
    }
  }

  /**
   * Extract path from URL
   */
  private extractPath(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname + urlObj.search;
    } catch (error) {
      logger.error('Failed to extract path from URL:', error);
      return '';
    }
  }

  /**
   * Determine the topic of a webpage
   */
  private async determineTopic(title: string, content: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a webpage classifier. Assign a single topic category to the webpage based on its title and content. Respond with ONLY the single topic word or short phrase (2-3 words max). Choose from common categories like Technology, Finance, News, Entertainment, Science, Health, Sports, Education, Shopping, Social Media, Travel, Food, etc.'
          },
          {
            role: 'user',
            content: `Title: ${title}\n\nContent excerpt: ${content.substring(0, 1000)}`
          }
        ],
        max_tokens: 10
      });
      
      return response.choices[0].message.content?.trim() || 'Uncategorized';
    } catch (error) {
      logger.error('Failed to determine webpage topic:', error);
      return 'Uncategorized';
    }
  }

  /**
   * Extract content from a webpage
   */
  private async extractWebpageContent(url: string): Promise<string> {
    try {
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      
      // Extract main content using Puppeteer
      const content = await page.evaluate(() => {
        // Remove script tags, style tags, and invisible elements
        const scripts = document.querySelectorAll('script, style, noscript, [style*="display:none"], [style*="display: none"]');
        scripts.forEach(s => s.remove());
        
        // Get text content from main content areas
        const mainElements = document.querySelectorAll('main, article, #content, .content, .main');
        if (mainElements.length > 0) {
          return Array.from(mainElements)
            .map(el => el.textContent)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
        
        // Fallback to body content
        return document.body.textContent?.replace(/\s+/g, ' ').trim() || '';
      });
      
      await browser.close();
      return content;
    } catch (error) {
      logger.error('Failed to extract webpage content:', error);
      return '';
    }
  }

  /**
   * Store a browser history entry
   */
  async storeHistoryEntry(entry: Pick<HistoryEntry, 'url' | 'title' | 'timestamp' | 'userId'>): Promise<HistoryEntry> {
    if (!this.initialized || !this.historyCollection) {
      await this.initialize();
    }
    
    try {
      // Skip search engine URLs
      if (this.isSearchEngineUrl(entry.url)) {
        logger.info(`Skipping search engine URL: ${entry.url}`);
        throw new Error('Search engine URL skipped');
      }
      
      // Generate ID
      const id = uuidv4();
      
      // Extract webpage content
      const content = await this.extractWebpageContent(entry.url);
      
      // Determine topic
      const topic = await this.determineTopic(entry.title, content);
      
      // Extract domain and path
      const domain = this.extractDomain(entry.url);
      const path = this.extractPath(entry.url);
      
      // Create full entry
      const historyEntry: HistoryEntry = {
        id,
        url: entry.url,
        title: entry.title,
        timestamp: entry.timestamp,
        content,
        topic,
        userId: entry.userId,
        metadata: {
          domain,
          path
        }
      };
      
      // Store in ChromaDB
      await this.historyCollection.add({
        ids: [id],
        metadatas: [{
          url: entry.url,
          title: entry.title,
          timestamp: entry.timestamp,
          topic,
          userId: entry.userId,
          domain,
          path
        }],
        documents: [content],
      });
      
      logger.info(`Stored browser history entry: ${entry.title}`);
      return historyEntry;
    } catch (error) {
      logger.error('Failed to store browser history entry:', error);
      throw error;
    }
  }

  /**
   * Query browser history
   */
  async queryHistory(query: HistoryQuery): Promise<HistoryEntry[]> {
    if (!this.initialized || !this.historyCollection) {
      await this.initialize();
    }
    
    try {
      // Build query filters
      const filters: Record<string, any> = {
        userId: query.userId
      };
      
      // Add time range filter if provided
      if (query.timeRange) {
        if (query.timeRange.start) {
          filters.timestamp = { $gte: query.timeRange.start };
        }
        if (query.timeRange.end) {
          if (!filters.timestamp) filters.timestamp = {};
          filters.timestamp.$lte = query.timeRange.end;
        }
      }
      
      // Add topic filter if provided
      if (query.topics && query.topics.length > 0) {
        filters.topic = { $in: query.topics };
      }
      
      // Perform similarity search if provided
      if (query.similarity) {
        const results = await this.historyCollection.query({
          queryTexts: [query.similarity.text],
          filter: filters,
          nResults: query.limit || 100
        });
        
        // Map results to history entries
        return (results.metadatas[0] || []).map((metadata: any, index: number) => ({
          id: results.ids[0][index],
          url: metadata.url,
          title: metadata.title,
          timestamp: metadata.timestamp,
          content: results.documents[0][index],
          topic: metadata.topic,
          userId: metadata.userId,
          metadata: {
            domain: metadata.domain,
            path: metadata.path
          }
        }));
      } else {
        // Perform regular filtered search
        const results = await this.historyCollection.get({
          filter: filters,
          limit: query.limit
        });
        
        // Map results to history entries
        return (results.metadatas || []).map((metadata: any, index: number) => ({
          id: results.ids[index],
          url: metadata.url,
          title: metadata.title,
          timestamp: metadata.timestamp,
          content: results.documents[index],
          topic: metadata.topic,
          userId: metadata.userId,
          metadata: {
            domain: metadata.domain,
            path: metadata.path
          }
        }));
      }
    } catch (error) {
      logger.error('Failed to query browser history:', error);
      throw error;
    }
  }

  /**
   * Get history statistics
   */
  async getHistoryStats(userId: string): Promise<HistoryStats> {
    if (!this.initialized || !this.historyCollection) {
      await this.initialize();
    }
    
    try {
      // Get all entries for the user
      const results = await this.historyCollection.get({
        filter: { userId },
        include: ['metadatas']
      });
      
      const metadatas = results.metadatas || [];
      
      // Initialize stats
      const stats: HistoryStats = {
        totalEntries: metadatas.length,
        domains: {},
        topics: [],
        timeRanges: {
          today: 0,
          yesterday: 0,
          lastWeek: 0,
          lastMonth: 0,
          older: 0
        }
      };
      
      // Track topics with their first and last visit
      const topicsMap: Record<string, { count: number, firstVisit: number, lastVisit: number }> = {};
      
      // Current time values
      const now = Date.now();
      const todayStart = new Date().setHours(0, 0, 0, 0);
      const yesterdayStart = todayStart - 86400000;
      const lastWeekStart = todayStart - 7 * 86400000;
      const lastMonthStart = todayStart - 30 * 86400000;
      
      // Process each entry
      metadatas.forEach((metadata: any) => {
        // Count domains
        const domain = metadata.domain;
        stats.domains[domain] = (stats.domains[domain] || 0) + 1;
        
        // Track topics
        const topic = metadata.topic;
        if (!topicsMap[topic]) {
          topicsMap[topic] = {
            count: 0,
            firstVisit: metadata.timestamp,
            lastVisit: metadata.timestamp
          };
        }
        
        topicsMap[topic].count++;
        topicsMap[topic].firstVisit = Math.min(topicsMap[topic].firstVisit, metadata.timestamp);
        topicsMap[topic].lastVisit = Math.max(topicsMap[topic].lastVisit, metadata.timestamp);
        
        // Count time ranges
        const timestamp = metadata.timestamp;
        if (timestamp >= todayStart) {
          stats.timeRanges.today++;
        } else if (timestamp >= yesterdayStart) {
          stats.timeRanges.yesterday++;
        } else if (timestamp >= lastWeekStart) {
          stats.timeRanges.lastWeek++;
        } else if (timestamp >= lastMonthStart) {
          stats.timeRanges.lastMonth++;
        } else {
          stats.timeRanges.older++;
        }
      });
      
      // Convert topics map to array
      stats.topics = Object.entries(topicsMap).map(([topic, data]) => ({
        topic,
        count: data.count,
        firstVisit: data.firstVisit,
        lastVisit: data.lastVisit
      }));
      
      // Sort topics by count (descending)
      stats.topics.sort((a, b) => b.count - a.count);
      
      return stats;
    } catch (error) {
      logger.error('Failed to get history statistics:', error);
      throw error;
    }
  }

  /**
   * Delete history entries
   */
  async deleteHistoryEntries(userId: string, entryIds?: string[]): Promise<number> {
    if (!this.initialized || !this.historyCollection) {
      await this.initialize();
    }
    
    try {
      if (entryIds && entryIds.length > 0) {
        // Delete specific entries
        await this.historyCollection.delete({
          ids: entryIds,
          filter: { userId }
        });
        
        return entryIds.length;
      } else {
        // Delete all entries for the user
        const count = await this.historyCollection.count({
          filter: { userId }
        });
        
        await this.historyCollection.delete({
          filter: { userId }
        });
        
        return count;
      }
    } catch (error) {
      logger.error('Failed to delete history entries:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const browserHistoryService = new BrowserHistoryService(); 