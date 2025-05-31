import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { logger } from '../utils/logger.js';
import * as fs from 'fs';
import * as path from 'path';

export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  body: string;
  bodyHtml?: string;
  timestamp: string;
  isRead: boolean;
  hasAttachments: boolean;
  labels: string[];
  snippet: string;
  attachments?: Array<{
    id: string;
    filename: string;
    mimeType: string;
    size: number;
  }>;
}

export interface GmailThread {
  id: string;
  subject: string;
  participants: string[];
  messageCount: number;
  lastMessage: string;
  timestamp: string;
  isRead: boolean;
  labels: string[];
  snippet: string;
}

export interface GmailLabel {
  id: string;
  name: string;
  type: 'system' | 'user';
  messageCount?: number;
  unreadCount?: number;
}

class GmailService {
  private oauth2Client: OAuth2Client;
  private gmail: any;
  private isAuthenticated = false;
  private tokenFilePath: string;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      logger.warn('Gmail OAuth credentials not provided - Gmail service will be unavailable');
      return;
    }

    this.oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
    this.tokenFilePath = path.join(process.cwd(), 'gmail-tokens.json');
    
    // Set up automatic token refresh and saving
    this.oauth2Client.on('tokens', (tokens) => {
      if (tokens.refresh_token) {
        // Only save if we have a refresh token (first time auth)
        const currentTokens = this.oauth2Client.credentials;
        const updatedTokens = { ...currentTokens, ...tokens };
        this.saveTokens(updatedTokens);
        logger.info('Gmail tokens automatically refreshed and saved');
      } else {
        // Update with the new access token
        const currentTokens = this.oauth2Client.credentials;
        const updatedTokens = { ...currentTokens, ...tokens };
        this.saveTokens(updatedTokens);
        logger.info('Gmail access token refreshed');
      }
    });
    
    // Try to load saved tokens
    this.loadSavedTokens();
    
    // Set refresh token if available from environment (fallback)
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    if (refreshToken && !this.isAuthenticated) {
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken
      });
      this.initializeGmail();
    }
  }

  private loadSavedTokens(): void {
    try {
      if (fs.existsSync(this.tokenFilePath)) {
        const tokenData = fs.readFileSync(this.tokenFilePath, 'utf8');
        const tokens = JSON.parse(tokenData);
        
        if (tokens && (tokens.access_token || tokens.refresh_token)) {
          this.oauth2Client.setCredentials(tokens);
          this.initializeGmail();
          logger.info('Gmail tokens loaded from file');
        }
      }
    } catch (error) {
      logger.error('Failed to load saved Gmail tokens:', error);
    }
  }

  private saveTokens(tokens: any): void {
    try {
      fs.writeFileSync(this.tokenFilePath, JSON.stringify(tokens, null, 2));
      logger.info('Gmail tokens saved to file');
    } catch (error) {
      logger.error('Failed to save Gmail tokens:', error);
    }
  }

  private initializeGmail(): void {
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    this.isAuthenticated = true;
  }

  public generateAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  public async authenticate(code: string): Promise<boolean> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      
      // Save tokens persistently
      this.saveTokens(tokens);
      
      logger.info('Gmail authentication successful', {
        hasRefreshToken: !!tokens.refresh_token,
        expiryDate: tokens.expiry_date
      });

      this.initializeGmail();
      return true;
    } catch (error) {
      logger.error('Gmail authentication failed:', error);
      return false;
    }
  }

  public async testConnection(): Promise<boolean> {
    try {
      if (!this.isAuthenticated) {
        logger.warn('Gmail not authenticated for connection test');
        return false;
      }

      // Ensure we have valid tokens before testing
      try {
        await this.oauth2Client.getAccessToken();
      } catch (error) {
        logger.error('Failed to get access token during connection test:', error);
        this.isAuthenticated = false;
        return false;
      }

      const result = await this.gmail.users.getProfile({
        userId: 'me'
      });

      logger.info('Gmail connection test successful:', {
        email: result.data.emailAddress,
        messagesTotal: result.data.messagesTotal,
        threadsTotal: result.data.threadsTotal
      });

      return true;
    } catch (error) {
      logger.error('Gmail connection test failed:', error);
      
      // If the error is related to authentication, mark as not authenticated
      if (error.code === 401 || error.message?.includes('invalid_grant')) {
        this.isAuthenticated = false;
        logger.warn('Gmail authentication expired, marked as not authenticated');
      }
      
      return false;
    }
  }

  public async getMessages(
    labelIds: string[] = ['INBOX'],
    maxResults: number = 50,
    pageToken?: string
  ): Promise<{ messages: GmailMessage[], nextPageToken?: string }> {
    try {
      if (!this.isAuthenticated) {
        throw new Error('Gmail not authenticated');
      }

      // Get message list
      const listResult = await this.gmail.users.messages.list({
        userId: 'me',
        labelIds,
        maxResults,
        pageToken
      });

      if (!listResult.data.messages) {
        return { messages: [] };
      }

      // Get detailed message data
      const messages: GmailMessage[] = [];
      const messagePromises = listResult.data.messages.map(async (msg: any) => {
        try {
          const messageResult = await this.gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'full'
          });

          return this.parseGmailMessage(messageResult.data);
        } catch (error) {
          logger.error(`Failed to fetch message ${msg.id}:`, error);
          return null;
        }
      });

      const messageResults = await Promise.all(messagePromises);
      messages.push(...messageResults.filter(Boolean));

      return {
        messages: messages.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
        nextPageToken: listResult.data.nextPageToken
      };
    } catch (error) {
      logger.error('Failed to fetch Gmail messages:', error);
      throw error;
    }
  }

  public async getThreads(
    labelIds: string[] = ['INBOX'],
    maxResults: number = 50,
    pageToken?: string
  ): Promise<{ threads: GmailThread[], nextPageToken?: string }> {
    try {
      if (!this.isAuthenticated) {
        throw new Error('Gmail not authenticated');
      }

      const listResult = await this.gmail.users.threads.list({
        userId: 'me',
        labelIds,
        maxResults,
        pageToken
      });

      if (!listResult.data.threads) {
        return { threads: [] };
      }

      const threads: GmailThread[] = [];
      const threadPromises = listResult.data.threads.map(async (thread: any) => {
        try {
          const threadResult = await this.gmail.users.threads.get({
            userId: 'me',
            id: thread.id,
            format: 'metadata'
          });

          return this.parseGmailThread(threadResult.data);
        } catch (error) {
          logger.error(`Failed to fetch thread ${thread.id}:`, error);
          return null;
        }
      });

      const threadResults = await Promise.all(threadPromises);
      threads.push(...threadResults.filter(Boolean));

      return {
        threads: threads.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
        nextPageToken: listResult.data.nextPageToken
      };
    } catch (error) {
      logger.error('Failed to fetch Gmail threads:', error);
      throw error;
    }
  }

  public async getLabels(): Promise<GmailLabel[]> {
    try {
      if (!this.isAuthenticated) {
        throw new Error('Gmail not authenticated');
      }

      const result = await this.gmail.users.labels.list({
        userId: 'me'
      });

      if (!result.data.labels) {
        return [];
      }

      return result.data.labels.map((label: any) => ({
        id: label.id,
        name: label.name,
        type: label.type === 'system' ? 'system' : 'user',
        messageCount: label.messagesTotal,
        unreadCount: label.messagesUnread
      }));
    } catch (error) {
      logger.error('Failed to fetch Gmail labels:', error);
      throw error;
    }
  }

  private parseGmailMessage(messageData: any): GmailMessage {
    const headers = messageData.payload.headers;
    const getHeader = (name: string) => 
      headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    // Parse body
    let body = '';
    let bodyHtml = '';
    
    if (messageData.payload.body?.data) {
      body = Buffer.from(messageData.payload.body.data, 'base64').toString();
    } else if (messageData.payload.parts) {
      const textPart = messageData.payload.parts.find((part: any) => 
        part.mimeType === 'text/plain'
      );
      const htmlPart = messageData.payload.parts.find((part: any) => 
        part.mimeType === 'text/html'
      );
      
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString();
      }
      if (htmlPart?.body?.data) {
        bodyHtml = Buffer.from(htmlPart.body.data, 'base64').toString();
      }
    }

    // Parse attachments
    const attachments = messageData.payload.parts?.filter((part: any) => 
      part.filename && part.body?.attachmentId
    ).map((part: any) => ({
      id: part.body.attachmentId,
      filename: part.filename,
      mimeType: part.mimeType,
      size: part.body.size
    })) || [];

    return {
      id: messageData.id,
      threadId: messageData.threadId,
      subject: getHeader('Subject'),
      from: getHeader('From'),
      to: getHeader('To').split(',').map((email: string) => email.trim()),
      cc: getHeader('Cc') ? getHeader('Cc').split(',').map((email: string) => email.trim()) : undefined,
      bcc: getHeader('Bcc') ? getHeader('Bcc').split(',').map((email: string) => email.trim()) : undefined,
      body: body,
      bodyHtml: bodyHtml,
      timestamp: new Date(parseInt(messageData.internalDate)).toISOString(),
      isRead: !messageData.labelIds?.includes('UNREAD'),
      hasAttachments: attachments.length > 0,
      labels: messageData.labelIds || [],
      snippet: messageData.snippet || '',
      attachments: attachments.length > 0 ? attachments : undefined
    };
  }

  private parseGmailThread(threadData: any): GmailThread {
    const messages = threadData.messages || [];
    const lastMessage = messages[messages.length - 1];
    const firstMessage = messages[0];
    
    const getHeader = (message: any, name: string) => 
      message.payload.headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    // Get all participants
    const participants = new Set<string>();
    messages.forEach((msg: any) => {
      const from = getHeader(msg, 'From');
      const to = getHeader(msg, 'To');
      const cc = getHeader(msg, 'Cc');
      
      if (from) participants.add(from);
      if (to) to.split(',').forEach((email: string) => participants.add(email.trim()));
      if (cc) cc.split(',').forEach((email: string) => participants.add(email.trim()));
    });

    return {
      id: threadData.id,
      subject: getHeader(firstMessage, 'Subject'),
      participants: Array.from(participants),
      messageCount: messages.length,
      lastMessage: lastMessage.snippet || '',
      timestamp: new Date(parseInt(lastMessage.internalDate)).toISOString(),
      isRead: !lastMessage.labelIds?.includes('UNREAD'),
      labels: lastMessage.labelIds || [],
      snippet: lastMessage.snippet || ''
    };
  }

  public isConnected(): boolean {
    return this.isAuthenticated;
  }

  public async disconnect(): Promise<boolean> {
    try {
      // Clear the tokens file
      if (fs.existsSync(this.tokenFilePath)) {
        fs.unlinkSync(this.tokenFilePath);
        logger.info('Gmail tokens file deleted');
      }

      // Reset authentication state
      this.isAuthenticated = false;
      this.oauth2Client.setCredentials({});
      
      logger.info('Gmail service disconnected successfully');
      return true;
    } catch (error) {
      logger.error('Failed to disconnect Gmail service:', error);
      return false;
    }
  }
}

export const gmailService = new GmailService(); 