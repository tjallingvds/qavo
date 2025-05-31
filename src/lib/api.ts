const API_BASE_URL = 'http://localhost:3001/api';

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

export interface GmailLabel {
  id: string;
  name: string;
  type: 'system' | 'user';
  messageCount?: number;
  unreadCount?: number;
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

// Gmail API functions
export const gmailApi = {
  async getMessages(labelIds: string[] = ['INBOX'], maxResults: number = 50, pageToken?: string): Promise<{ messages: GmailMessage[], nextPageToken?: string }> {
    const params = new URLSearchParams({
      maxResults: maxResults.toString(),
      ...(pageToken && { pageToken }),
      ...(labelIds.length > 0 && { labelIds: labelIds.join(',') })
    });

    const response = await fetch(`${API_BASE_URL}/gmail/messages?${params}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch Gmail messages');
    }
    
    // Ensure all messages have a proper body field for display
    if (data.data && data.data.messages) {
      data.data.messages = data.data.messages.map((message: GmailMessage) => {
        return {
          ...message,
          // Prefer HTML body if available
          body: message.bodyHtml || message.body || message.snippet || ''
        };
      });
    }
    
    return data.data;
  },

  async getLabels(): Promise<GmailLabel[]> {
    const response = await fetch(`${API_BASE_URL}/gmail/labels`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch Gmail labels');
    }
    
    return data.data;
  },

  async getMessage(id: string): Promise<GmailMessage> {
    const response = await fetch(`${API_BASE_URL}/gmail/messages/${id}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch Gmail message');
    }
    
    // Prefer HTML body if available
    if (data.data) {
      return {
        ...data.data,
        body: data.data.bodyHtml || data.data.body || data.data.snippet || ''
      };
    }
    
    return data.data;
  },

  async searchMessages(query: string, maxResults: number = 50): Promise<GmailMessage[]> {
    const params = new URLSearchParams({
      q: query,
      maxResults: maxResults.toString()
    });

    const response = await fetch(`${API_BASE_URL}/gmail/search?${params}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to search Gmail messages');
    }
    
    // Ensure all messages have a proper body field for display
    if (data.data) {
      return data.data.map((message: GmailMessage) => {
        return {
          ...message,
          // Prefer HTML body if available
          body: message.bodyHtml || message.body || message.snippet || ''
        };
      });
    }
    
    return data.data;
  }
};

// Slack API functions
export const slackApi = {
  async getChannels(token: string): Promise<SlackChannel[]> {
    const response = await fetch(`${API_BASE_URL}/slack/channels`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch Slack channels');
    }
    
    return data.data;
  },

  async getMessages(token: string, channelId: string, limit: number = 50, cursor?: string): Promise<SlackMessage[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(cursor && { cursor })
    });

    const response = await fetch(`${API_BASE_URL}/slack/channels/${channelId}/messages?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch Slack messages');
    }
    
    return data.data;
  },

  async sendMessage(token: string, channelId: string, text: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/slack/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ text })
    });
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to send Slack message');
    }
    
    return true;
  },

  async getChannelInfo(token: string, channelId: string): Promise<SlackChannel> {
    const response = await fetch(`${API_BASE_URL}/slack/channels/${channelId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch Slack channel info');
    }
    
    return data.data;
  }
}; 