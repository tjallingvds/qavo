import React, { useState, useEffect } from 'react';
import { Search, Filter, SortAsc, LogOut, X, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { gmailApi, GmailMessage, GmailLabel } from '@/lib/api';
import { EmailSidebar } from './Email/EmailSidebar';
import { EmailList } from './Email/EmailList';
import { EmailDetail } from './Email/EmailDetail';
import { AuthPrompt } from './Email/AuthPrompt';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

function EmailHeader({ 
  searchQuery, 
  onSearchChange,
  activeLabel,
  onDisconnect
}: { 
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeLabel?: GmailLabel;
  onDisconnect: () => void;
}) {
  const labelName = activeLabel?.name?.replace('CATEGORY_', '') || 'Inbox';
  const displayName = labelName.charAt(0).toUpperCase() + labelName.slice(1).toLowerCase();
  
  return (
    <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0 overflow-hidden">
      <div className="flex items-center flex-shrink-0">
        <h1 className="text-lg font-medium text-gray-900 truncate">
          {displayName}
        </h1>
      </div>
      
      <div className="flex items-center space-x-2 w-full max-w-md ml-8 mr-4 min-w-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search emails..." 
            className="pl-9 py-1.5 h-8 text-sm bg-gray-50 border-gray-200 rounded-md w-full"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 flex-shrink-0">
        <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors">
          <Filter className="h-4 w-4" />
        </button>
        <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors">
          <SortAsc className="h-4 w-4" />
        </button>
        <button 
          onClick={onDisconnect}
          className="p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded transition-colors"
          title="Disconnect Gmail"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function updateMailBody(message: GmailMessage): GmailMessage {
  // Make sure the email body is properly formatted HTML
  if (message.body) {
    // If it's plain text or missing structure, wrap it in proper HTML
    if (!message.body.includes('<html') && !message.body.includes('<body')) {
      let body = message.body;
      
      // Handle plain text by preserving line breaks
      if (!body.includes('<div') && !body.includes('<p')) {
        body = body.replace(/\n/g, '<br>');
        body = `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${body}</div>`;
      }
      
      // Wrap with HTML structure if needed
      if (!body.includes('<html')) {
        body = `
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                a { color: #2563eb; }
                p, div { margin-bottom: 1em; }
              </style>
            </head>
            <body>${body}</body>
          </html>
        `;
      }
      
      return { ...message, body };
    }
  } else if (message.snippet) {
    // If there's no body but we have a snippet, use that
    const body = `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${message.snippet}</div>`;
    return { ...message, body };
  }
  
  return message;
}

export default function Email() {
  const { authState, authenticateGmail, testGmailConnection, logout } = useAuth();
  const [labels, setLabels] = useState<GmailLabel[]>([]);
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessage>();
  const [activeLabel, setActiveLabel] = useState<string>('INBOX');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLabels, setIsLoadingLabels] = useState(false);
  const [error, setError] = useState<string>();
  const [nextPageToken, setNextPageToken] = useState<string>();
  const [hasMore, setHasMore] = useState(true);

  // Test connection on mount if already authenticated
  useEffect(() => {
    if (authState.gmail.isAuthenticated) {
      testConnection();
    }
  }, [authState.gmail.isAuthenticated]);

  // Load labels when authenticated
  useEffect(() => {
    if (authState.gmail.isAuthenticated) {
      loadLabels();
    }
  }, [authState.gmail.isAuthenticated]);

  // Load messages when label or search changes
  useEffect(() => {
    if (authState.gmail.isAuthenticated) {
      // Reset pagination when changing label/search
      setMessages([]);
      setNextPageToken(undefined);
      setHasMore(true);
      
      if (searchQuery.trim()) {
        searchMessages();
      } else {
        loadMessages();
      }
    }
  }, [authState.gmail.isAuthenticated, activeLabel, searchQuery]);

  const testConnection = async () => {
    try {
      const isConnected = await testGmailConnection();
      if (!isConnected) {
        setError('Gmail connection failed. Please reconnect.');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setError('Failed to test Gmail connection');
    }
  };

  const loadLabels = async () => {
    setIsLoadingLabels(true);
    setError(undefined);
    try {
      const fetchedLabels = await gmailApi.getLabels();
      setLabels(Array.isArray(fetchedLabels) ? fetchedLabels : []);
    } catch (error) {
      console.error('Failed to load labels:', error);
      setError('Failed to load email folders');
      setLabels([]); // Ensure labels is always an array
    } finally {
      setIsLoadingLabels(false);
    }
  };

  const loadMessages = async (pageToken?: string) => {
    setIsLoading(true);
    setError(undefined);
    try {
      const result = await gmailApi.getMessages([activeLabel], 50, pageToken);
      
      if (result && result.messages) {
        if (pageToken) {
          // Append to existing messages for pagination
          setMessages(prev => [...(prev || []), ...result.messages]);
        } else {
          // New search, replace messages
          setMessages(result.messages);
        }
        setNextPageToken(result.nextPageToken);
        setHasMore(!!result.nextPageToken);
      } else {
        // Handle empty or malformed response
        if (!pageToken) {
          setMessages([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError('Failed to load emails');
      if (!pageToken) {
        setMessages([]); // Ensure messages is always an array
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreMessages = () => {
    if (nextPageToken && !isLoading && hasMore) {
      loadMessages(nextPageToken);
    }
  };

  const searchMessages = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(undefined);
    try {
      const searchResults = await gmailApi.searchMessages(searchQuery, 50);
      setMessages(Array.isArray(searchResults) ? searchResults : []);
      setHasMore(false); // Search doesn't support pagination yet
    } catch (error) {
      console.error('Failed to search messages:', error);
      setError('Failed to search emails');
      setMessages([]); // Ensure messages is always an array
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setMessages([]);
    setNextPageToken(undefined);
    setHasMore(true);
    
    if (searchQuery.trim()) {
      searchMessages();
    } else {
      loadMessages();
    }
    loadLabels();
  };

  const handleLabelSelect = (labelId: string) => {
    setActiveLabel(labelId);
    setSelectedMessage(undefined);
    setSearchQuery('');
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setSelectedMessage(undefined);
  };

  const handleMessageSelect = (message: GmailMessage) => {
    // Ensure the email body is properly formatted HTML
    setSelectedMessage(updateMailBody(message));
  };

  const handleCloseEmailDetail = () => {
    setSelectedMessage(undefined);
  };

  const handleDisconnect = async () => {
    try {
      // Call backend logout endpoint to clear tokens
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/logout/gmail`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Backend logout failed:', error);
    } finally {
      // Always clear frontend state
      logout('gmail');
      // Reset component state
      setMessages([]);
      setLabels([]);
      setSelectedMessage(undefined);
      setError(undefined);
    }
  };

  // Show auth prompt if not authenticated
  if (!authState.gmail.isAuthenticated) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <AuthPrompt 
          onAuthenticate={authenticateGmail}
          error={authState.gmail.error}
        />
      </div>
    );
  }

  // Ensure we have valid data before rendering
  const safeMessages = Array.isArray(messages) ? messages : [];
  const safeLabels = Array.isArray(labels) ? labels : [];
  const activeLabObj = safeLabels.find(l => l.id === activeLabel);

  return (
    <div className="relative h-full w-full overflow-hidden bg-white border border-gray-200 rounded-md" style={{ height: '100%', maxHeight: '100vh' }}>
      <div className="absolute inset-0 flex">
        {/* Fixed-width Sidebar */}
        <div className="w-48 flex-shrink-0">
          <EmailSidebar 
            labels={safeLabels}
            activeLabel={activeLabel}
            onLabelSelect={handleLabelSelect}
            onRefresh={handleRefresh}
            isLoading={isLoadingLabels}
          />
        </div>
        
        {/* Resizable Email Content Area */}
        <div className="flex-1 min-w-0">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Main Email Area */}
            <ResizablePanel defaultSize={selectedMessage ? 50 : 100} minSize={30}>
              <div className="flex flex-col h-full min-w-0">
                <EmailHeader 
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                  activeLabel={activeLabObj}
                  onDisconnect={handleDisconnect}
                />
                
                {error && (
                  <div className="px-5 py-2 bg-red-50 border-b border-red-200 flex-shrink-0">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                
                <EmailList 
                  messages={safeMessages}
                  selectedMessage={selectedMessage}
                  onMessageSelect={handleMessageSelect}
                  isLoading={isLoading}
                  onLoadMore={hasMore ? loadMoreMessages : undefined}
                  hasMore={hasMore}
                />
              </div>
            </ResizablePanel>
            
            {/* Email Detail Side Panel */}
            {selectedMessage && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50} minSize={30}>
                  <EmailDetail 
                    message={selectedMessage}
                    onClose={handleCloseEmailDetail}
                  />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
} 