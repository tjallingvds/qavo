import React, { useState, useRef, useEffect } from 'react';
import { 
  Star, 
  Paperclip, 
  AlertCircle
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { GmailMessage } from '@/lib/api';

interface EmailListProps {
  messages: GmailMessage[];
  selectedMessage?: GmailMessage;
  onMessageSelect: (message: GmailMessage) => void;
  isLoading: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

interface EmailListItemProps {
  email: GmailMessage;
  onClick: () => void;
  isSelected?: boolean;
}

function EmailListItem({ email, onClick, isSelected }: EmailListItemProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffHours < 24 * 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Parse sender name and email
  const parseFromAddress = (from: string) => {
    const match = from.match(/^(.+?)\s*<(.+)>$/);
    if (match) {
      return { name: match[1].trim(), email: match[2].trim() };
    }
    return { name: from, email: from };
  };

  const sender = parseFromAddress(email.from);

  return (
    <div 
      onClick={onClick}
      className={`group px-5 py-3 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 overflow-hidden ${
        isSelected ? 'bg-gray-50' : ''
      }`}
    >
      <div className="flex items-center justify-between w-full overflow-hidden">
        {/* Sender */}
        <div className="flex items-center space-x-3 w-1/4 min-w-0 overflow-hidden">
          <span className={`font-medium text-sm truncate ${!email.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
            {sender.name}
          </span>
        </div>
        
        {/* Subject & Preview */}
        <div className="flex-1 min-w-0 px-2 overflow-hidden">
          <div className="flex items-center overflow-hidden">
            <p className={`text-sm truncate ${!email.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
              {email.subject}
            </p>
          </div>
        </div>
        
        {/* Time & Actions */}
        <div className="flex items-center space-x-3 w-20 justify-end text-right flex-shrink-0">
          <span className="text-xs text-gray-500">
            {formatTime(email.timestamp)}
          </span>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {email.hasAttachments && <Paperclip className="h-3.5 w-3.5 text-gray-400" />}
            <button className="p-0.5 hover:text-yellow-500 transition-colors">
              <Star className="h-3.5 w-3.5 text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmailList({ messages, selectedMessage, onMessageSelect, isLoading, onLoadMore, hasMore }: EmailListProps) {
  const [showLoadMore, setShowLoadMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Set up scroll listener to detect when user is near bottom
  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Show load more when within 100px of bottom
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowLoadMore(isNearBottom);
    };
    
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
    }
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [messages.length]);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading emails...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No emails found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      <div className="absolute inset-0 flex flex-col">
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
          {messages.map((email) => (
            <EmailListItem 
              key={email.id} 
              email={email} 
              onClick={() => onMessageSelect(email)}
              isSelected={selectedMessage?.id === email.id}
            />
          ))}
          
          {/* Load More Section (only shown when near bottom) */}
          {showLoadMore && (hasMore || isLoading) && messages.length > 0 && (
            <div className="p-4 text-center border-t border-gray-100">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                  <span className="text-xs text-gray-500">Loading more emails...</span>
                </div>
              ) : hasMore && onLoadMore ? (
                <button
                  onClick={onLoadMore}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Load more
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 