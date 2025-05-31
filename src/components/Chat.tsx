import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Video, 
  Info,
  Smile,
  Paperclip,
  Send
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { slackApi, SlackChannel, SlackMessage } from '@/lib/api';
import { SlackSidebar } from './Chat/SlackSidebar';
import { SlackAuthPrompt } from './Chat/SlackAuthPrompt';

function ChatHeader({ activeChannel }: { activeChannel?: SlackChannel }) {
  if (!activeChannel) return null;

  return (
    <div className="px-6 py-4 border-b border-gray-50 bg-white/70 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              #{activeChannel.name}
            </h1>
            <p className="text-sm text-gray-500">
              {activeChannel.memberCount ? `${activeChannel.memberCount} members` : 'Direct Message'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-50 rounded-md transition-colors">
            <Phone className="h-4 w-4 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-50 rounded-md transition-colors">
            <Video className="h-4 w-4 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-50 rounded-md transition-colors">
            <Info className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageItem({ message }: { message: SlackMessage }) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="px-6 py-3 hover:bg-gray-25/50 transition-colors group">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {(message.username || 'U').split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {message.username || 'Unknown User'}
            </span>
            <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
              {formatTime(message.timestamp)}
            </span>
          </div>
          
          <div className="text-[15px] text-gray-800 leading-relaxed">
            {message.text || 'No message content'}
          </div>
          
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex items-center space-x-1 mt-2">
              {message.reactions.map((reaction, index) => (
                <button 
                  key={index}
                  className="flex items-center space-x-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded-full text-xs transition-colors"
                >
                  <span>{reaction.name}</span>
                  <span className="text-gray-600">{reaction.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageInput({ 
  onSendMessage, 
  isLoading,
  activeChannel 
}: { 
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  activeChannel?: SlackChannel;
}) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  if (!activeChannel) return null;

  return (
    <div className="px-6 py-4 border-t border-gray-50 bg-white">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1">
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Message #${activeChannel.name}`}
              className="w-full px-4 py-3 pr-12 bg-gray-50 border-0 rounded-lg text-sm placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-200 transition-all resize-none"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              <button type="button" className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
                <Paperclip className="h-4 w-4 text-gray-400" />
              </button>
              <button type="button" className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
                <Smile className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
        
        <button 
          type="submit"
          disabled={!message.trim() || isLoading}
          className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

export default function Chat() {
  const { authState, authenticateSlack, testSlackConnection } = useAuth();
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [messages, setMessages] = useState<SlackMessage[]>([]);
  const [activeChannel, setActiveChannel] = useState<SlackChannel>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [error, setError] = useState<string>();

  // Test connection and load data when authenticated
  useEffect(() => {
    if (authState.slack.isAuthenticated && authState.slack.token) {
      testConnection();
      loadChannels();
    }
  }, [authState.slack.isAuthenticated, authState.slack.token]);

  // Load messages when channel changes
  useEffect(() => {
    if (activeChannel && authState.slack.token) {
      loadMessages();
    }
  }, [activeChannel, authState.slack.token]);

  const testConnection = async () => {
    if (!authState.slack.token) return;
    
    try {
      await testSlackConnection(authState.slack.token);
    } catch (error) {
      console.error('Slack connection test failed:', error);
      setError('Failed to test Slack connection');
    }
  };

  const loadChannels = async () => {
    if (!authState.slack.token) return;
    
    setIsLoadingChannels(true);
    setError(undefined);
    try {
      const fetchedChannels = await slackApi.getChannels(authState.slack.token);
      setChannels(fetchedChannels);
      // Auto-select first channel
      if (fetchedChannels.length > 0 && !activeChannel) {
        setActiveChannel(fetchedChannels[0]);
      }
    } catch (error) {
      console.error('Failed to load channels:', error);
      setError('Failed to load Slack channels');
    } finally {
      setIsLoadingChannels(false);
    }
  };

  const loadMessages = async () => {
    if (!activeChannel || !authState.slack.token) return;
    
    setIsLoading(true);
    setError(undefined);
    try {
      const fetchedMessages = await slackApi.getMessages(authState.slack.token, activeChannel.id, 50);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!activeChannel || !authState.slack.token) return;
    
    setIsLoading(true);
    try {
      await slackApi.sendMessage(authState.slack.token, activeChannel.id, message);
      // Refresh messages after sending
      await loadMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadChannels();
    if (activeChannel) {
      loadMessages();
    }
  };

  // Show auth prompt if not authenticated
  if (!authState.slack.isAuthenticated) {
    return (
      <SlackAuthPrompt 
        onAuthenticate={authenticateSlack}
        error={authState.slack.error}
      />
    );
  }

  return (
    <div className="flex h-full bg-white overflow-hidden">
      <SlackSidebar 
        channels={channels}
        activeChannel={activeChannel}
        onChannelSelect={setActiveChannel}
        onRefresh={handleRefresh}
        isLoading={isLoadingChannels}
      />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatHeader activeChannel={activeChannel} />
        
        {error && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-gray-500">No messages yet</p>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageItem key={message.id} message={message} />
                ))
              )}
            </>
          )}
        </div>
        
        <MessageInput 
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          activeChannel={activeChannel}
        />
      </div>
    </div>
  );
} 