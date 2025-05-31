import React from 'react';
import { 
  X, 
  Star, 
  Archive, 
  Trash2, 
  Reply, 
  Forward,
  Paperclip,
  Calendar
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GmailMessage } from '@/lib/api';

interface EmailDetailProps {
  message: GmailMessage;
  onClose: () => void;
}

export function EmailDetail({ message, onClose }: EmailDetailProps) {
  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Parse sender name and email
  const parseFromAddress = (from: string) => {
    const match = from.match(/^(.+?)\s*<(.+)>$/);
    if (match) {
      return { name: match[1].trim(), email: match[2].trim() };
    }
    return { name: from, email: from };
  };

  const sender = parseFromAddress(message.from);

  return (
    <div className="h-full w-full bg-white border-l border-gray-200 relative">
      <div className="absolute inset-0 flex flex-col">
        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0 flex-shrink-0">
                <X className="h-4 w-4 text-gray-500" />
              </Button>
              <h2 className="text-base font-medium text-gray-900 truncate">{message.subject || '(No subject)'}</h2>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-500">
                <Archive className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-500">
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-500">
                <Star className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Email Metadata */}
        <div className="px-5 py-3 border-b border-gray-200 flex-shrink-0 overflow-hidden">
          <div className="flex items-center justify-between flex-wrap">
            <div className="flex items-center space-x-3 min-w-0 overflow-hidden pr-2">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-gray-200 text-gray-600 text-xs font-medium">
                  {sender.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="min-w-0 overflow-hidden">
                <div className="flex items-center overflow-hidden">
                  <span className="font-medium text-sm text-gray-900 truncate">{sender.name}</span>
                  <span className="text-xs text-gray-500 ml-2 truncate flex-shrink-0">&#60;{sender.email}&#62;</span>
                </div>
                <div className="text-xs text-gray-500 mt-1 flex items-center truncate">
                  <Calendar className="h-3 w-3 mr-1 inline flex-shrink-0" />
                  {formatFullDate(message.timestamp)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0 mt-2 sm:mt-0">
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <Forward className="h-3 w-3 mr-1" />
                Forward
              </Button>
            </div>
          </div>
          
          {/* Labels */}
          {message.labels && message.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 overflow-hidden">
              {message.labels.filter(label => !label.startsWith('CATEGORY_')).map((label, index) => (
                <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-700 border-gray-200">
                  {label.toLowerCase()}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        {/* Email Body */}
        <div className="flex-1 overflow-auto">
          <iframe
            srcDoc={message.body}
            title="Email content"
            className="w-full h-full border-0"
            sandbox="allow-popups allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
} 