import { WebClient } from '@slack/web-api';
import { createRequire } from 'module';
import { logger } from '../utils/logger.js';

const require = createRequire(import.meta.url);
// We don't need the App class for user OAuth, just the WebClient

export interface SlackMessage {
  id: string;
  text: string;
  user: string;
  username?: string;
  userImage?: string;
  timestamp: string;
  channel: string;
  channelName?: string;
  threadTs?: string;
  reactions?: Array<{
    name: string;
    count: number;
    users: string[];
  }>;
  files?: Array<{
    id: string;
    name: string;
    mimetype: string;
    url: string;
  }>;
}

export interface SlackChannel {
  id: string;
  name: string;
  isChannel: boolean;
  isGroup: boolean;
  isIm: boolean;
  isMember: boolean;
  topic?: string;
  purpose?: string;
  memberCount?: number;
}

export interface SlackUser {
  id: string;
  name: string;
  realName?: string;
  displayName?: string;
  email?: string;
  image?: string;
  isBot: boolean;
  isDeleted: boolean;
}

export interface SlackOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

class SlackService {
  private config: SlackOAuthConfig | null = null;
  private configured = false;

  constructor() {
    this.initializeConfig();
  }

  private initializeConfig(): void {
    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    const redirectUri = process.env.SLACK_REDIRECT_URI || 'http://localhost:3001/api/auth/slack/callback';

    if (!clientId || !clientSecret) {
      logger.warn('Slack OAuth credentials not provided - Slack service will be unavailable');
      return;
    }

    this.config = {
      clientId,
      clientSecret,
      redirectUri,
      scopes: [
        'channels:history',
        'channels:read', 
        'channels:write',
        'chat:write',
        'groups:history',
        'im:history',
        'im:read',
        'im:write',
        'links:write',
        'mpim:history',
        'mpim:read',
        'usergroups:write',
        'users:read'
      ]
    };

    this.configured = true;
    logger.info('Slack OAuth service initialized');
  }

  // Generate OAuth URL for user authentication
  public generateAuthUrl(state?: string): string {
    if (!this.config) {
      throw new Error('Slack OAuth not configured');
    }

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      scope: this.config.scopes.join(','),
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      ...(state && { state })
    });

    return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
  }

  // Exchange OAuth code for user token
  public async exchangeCodeForToken(code: string): Promise<{ accessToken: string; user: any; team: any }> {
    if (!this.config) {
      throw new Error('Slack OAuth not configured');
    }

    try {
      const client = new WebClient();
      const result = await client.oauth.v2.access({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.config.redirectUri,
      });

      if (!result.ok || !result.authed_user?.access_token) {
        throw new Error('Failed to exchange code for token');
      }

      return {
        accessToken: result.authed_user.access_token,
        user: result.authed_user,
        team: result.team
      };
    } catch (error) {
      logger.error('Failed to exchange Slack OAuth code:', error);
      throw error;
    }
  }

  // Create a client with user token
  private createClientWithToken(token: string): WebClient {
    return new WebClient(token);
  }

  public async testConnection(userToken: string): Promise<boolean> {
    try {
      if (!userToken) {
        logger.warn('No user token provided for Slack connection test');
        return false;
      }
      
      const client = this.createClientWithToken(userToken);
      const result = await client.auth.test();
      
      logger.info('Slack user connection test successful:', {
        team: result.team,
        user: result.user,
        team_id: result.team_id
      });
      return true;
    } catch (error) {
      logger.error('Slack connection test failed:', error);
      return false;
    }
  }

  public async getChannels(userToken: string): Promise<SlackChannel[]> {
    try {
      if (!userToken) {
        logger.warn('No user token provided for fetching channels');
        return [];
      }

      const client = this.createClientWithToken(userToken);
      const result = await client.conversations.list({
        types: 'public_channel,private_channel,mpim,im',
        limit: 100
      });

      if (!result.channels) {
        return [];
      }

      const channels: SlackChannel[] = result.channels.map((channel: any) => ({
        id: channel.id,
        name: channel.name || 'Direct Message',
        isChannel: channel.is_channel || false,
        isGroup: channel.is_group || false,
        isIm: channel.is_im || false,
        isMember: channel.is_member || false,
        topic: channel.topic?.value,
        purpose: channel.purpose?.value,
        memberCount: channel.num_members
      }));

      return channels;
    } catch (error) {
      logger.error('Failed to fetch Slack channels:', error);
      throw error;
    }
  }

  public async sendMessage(userToken: string, channelId: string, text: string): Promise<boolean> {
    try {
      if (!userToken) {
        logger.warn('No user token provided for sending message');
        return false;
      }

      const client = this.createClientWithToken(userToken);
      const result = await client.chat.postMessage({
        channel: channelId,
        text
      });

      return result.ok || false;
    } catch (error) {
      logger.error('Failed to send Slack message:', error);
      return false;
    }
  }

  public async getMessages(
    userToken: string,
    channelId: string, 
    limit: number = 50,
    cursor?: string
  ): Promise<SlackMessage[]> {
    try {
      if (!userToken) {
        logger.warn('No user token provided for fetching messages');
        return [];
      }

      const client = this.createClientWithToken(userToken);
      const result = await client.conversations.history({
        channel: channelId,
        limit,
        cursor
      });

      if (!result.messages) {
        return [];
      }

      // Get user info for all unique users in messages
      const userIds = [...new Set(result.messages.map((msg: any) => msg.user).filter(Boolean))] as string[];
      const users = await this.getUsersInfo(userToken, userIds);
      const userMap = new Map(users.map(user => [user.id, user]));

      // Get channel info
      const channelInfo = await this.getChannelInfo(userToken, channelId);

      const messages: SlackMessage[] = result.messages.map((msg: any) => {
        const user = userMap.get(msg.user);
        return {
          id: msg.ts,
          text: msg.text || '',
          user: msg.user,
          username: user?.displayName || user?.name || 'Unknown',
          userImage: user?.image,
          timestamp: new Date(parseFloat(msg.ts) * 1000).toISOString(),
          channel: channelId,
          channelName: channelInfo?.name,
          threadTs: msg.thread_ts,
          reactions: msg.reactions?.map((reaction: any) => ({
            name: reaction.name,
            count: reaction.count,
            users: reaction.users
          })),
          files: msg.files?.map((file: any) => ({
            id: file.id,
            name: file.name,
            mimetype: file.mimetype,
            url: file.url_private
          }))
        };
      });

      return messages.reverse(); // Show oldest first
    } catch (error) {
      logger.error('Failed to fetch Slack messages:', error);
      throw error;
    }
  }

  public async getUsersInfo(userToken: string, userIds: string[]): Promise<SlackUser[]> {
    try {
      if (!userToken) {
        logger.warn('No user token provided for fetching user info');
        return [];
      }

      const client = this.createClientWithToken(userToken);
      const users: SlackUser[] = [];
      
      // Fetch user info one by one (users.info only accepts single user)
      for (const userId of userIds) {
        try {
          const result = await client.users.info({
            user: userId
          });

          if (result.user) {
            const user = result.user as any;
            users.push({
              id: user.id,
              name: user.name,
              realName: user.real_name,
              displayName: user.profile?.display_name,
              email: user.profile?.email,
              image: user.profile?.image_72,
              isBot: user.is_bot || false,
              isDeleted: user.deleted || false
            });
          }
        } catch (error) {
          logger.error(`Failed to fetch user info for ${userId}:`, error);
        }
      }

      return users;
    } catch (error) {
      logger.error('Failed to fetch Slack user info:', error);
      return [];
    }
  }

  public async getChannelInfo(userToken: string, channelId: string): Promise<SlackChannel | null> {
    try {
      if (!userToken) {
        logger.warn('No user token provided for fetching channel info');
        return null;
      }

      const client = this.createClientWithToken(userToken);
      const result = await client.conversations.info({
        channel: channelId
      });

      if (!result.channel) {
        return null;
      }

      const channel = result.channel as any;
      return {
        id: channel.id,
        name: channel.name || 'Direct Message',
        isChannel: channel.is_channel || false,
        isGroup: channel.is_group || false,
        isIm: channel.is_im || false,
        isMember: channel.is_member || false,
        topic: channel.topic?.value,
        purpose: channel.purpose?.value,
        memberCount: channel.num_members
      };
    } catch (error) {
      logger.error('Failed to fetch Slack channel info:', error);
      return null;
    }
  }

  public isConfigured(): boolean {
    return this.configured;
  }

  public async disconnect(): Promise<boolean> {
    try {
      // Slack uses user tokens passed per request, so no server-side tokens to clear
      // This method exists for consistency with other services
      logger.info('Slack service disconnected successfully');
      return true;
    } catch (error) {
      logger.error('Failed to disconnect Slack service:', error);
      return false;
    }
  }
}

export const slackService = new SlackService(); 