import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Smile, 
  Paperclip, 
  Hash, 
  Lock, 
  Users, 
  Search,
  Plus,
  Settings,
  Phone,
  Video,
  MoreHorizontal,
  ChevronDown
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  user: User;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'image';
  reactions?: Reaction[];
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
}

interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'dm';
  unreadCount?: number;
  members?: number;
}

interface Reaction {
  emoji: string;
  users: string[];
  count: number;
}

const mockUsers: User[] = [
  { id: '1', name: 'Alice Johnson', status: 'online' },
  { id: '2', name: 'Bob Smith', status: 'away' },
  { id: '3', name: 'Carol Davis', status: 'online' },
  { id: '4', name: 'David Wilson', status: 'busy' },
  { id: '5', name: 'Emma Brown', status: 'offline' },
];

const mockChannels: Channel[] = [
  { id: '1', name: 'general', type: 'public', unreadCount: 3, members: 12 },
  { id: '2', name: 'development', type: 'public', unreadCount: 0, members: 8 },
  { id: '3', name: 'design', type: 'public', unreadCount: 1, members: 5 },
  { id: '4', name: 'project-alpha', type: 'private', unreadCount: 0, members: 4 },
  { id: '5', name: 'random', type: 'public', unreadCount: 0, members: 15 },
];

const mockMessages: Message[] = [
  {
    id: '1',
    user: mockUsers[0],
    content: 'Hey everyone! Just wanted to share the latest design updates for the new feature.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    type: 'text',
    reactions: [{ emoji: '👍', users: ['2', '3'], count: 2 }]
  },
  {
    id: '2',
    user: mockUsers[1],
    content: 'Looks great! I especially like the new color scheme. When are we planning to ship this?',
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    type: 'text',
  },
  {
    id: '3',
    user: mockUsers[2],
    content: 'The mockups are in Figma if anyone wants to take a look. I\'ll send the link shortly.',
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    type: 'text',
    reactions: [{ emoji: '🎨', users: ['1'], count: 1 }]
  },
  {
    id: '4',
    user: mockUsers[3],
    content: 'Perfect timing! I was just about to ask for those. Thanks Carol! 🙌',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    type: 'text',
  },
];

function ChatSidebar({ 
  channels, 
  activeChannel, 
  onChannelSelect 
}: { 
  channels: Channel[]; 
  activeChannel: string; 
  onChannelSelect: (channelId: string) => void;
}) {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Workspace</h2>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Settings className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search channels, messages..." 
            className="pl-9 bg-white border-gray-200 h-8 text-sm"
          />
        </div>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Channels</span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
              <Plus className="h-3 w-3 text-gray-500" />
            </Button>
          </div>
          
          <div className="space-y-1">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => onChannelSelect(channel.id)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors ${
                  activeChannel === channel.id 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {channel.type === 'private' ? (
                    <Lock className="h-3 w-3 text-gray-400" />
                  ) : (
                    <Hash className="h-3 w-3 text-gray-400" />
                  )}
                  <span>{channel.name}</span>
                </div>
                {channel.unreadCount && channel.unreadCount > 0 && (
                  <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                    {channel.unreadCount}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Direct Messages */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Direct Messages</span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
              <Plus className="h-3 w-3 text-gray-500" />
            </Button>
          </div>
          
          <div className="space-y-1">
            {mockUsers.slice(0, 4).map((user) => (
              <button
                key={user.id}
                className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="relative">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs bg-gray-200">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white ${
                    user.status === 'online' ? 'bg-green-400' :
                    user.status === 'away' ? 'bg-yellow-400' :
                    user.status === 'busy' ? 'bg-red-400' : 'bg-gray-400'
                  }`} />
                </div>
                <span className="truncate">{user.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageItem({ message }: { message: Message }) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="group hover:bg-gray-50 px-4 py-2 transition-colors">
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8 mt-0.5">
          <AvatarFallback className="text-sm bg-gray-200">
            {message.user.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline space-x-2 mb-1">
            <span className="font-medium text-gray-900 text-sm">
              {message.user.name}
            </span>
            <span className="text-xs text-gray-500">
              {formatTime(message.timestamp)}
            </span>
          </div>
          
          <div className="text-sm text-gray-800 leading-relaxed">
            {message.content}
          </div>
          
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex space-x-1 mt-2">
              {message.reactions.map((reaction, index) => (
                <button
                  key={index}
                  className="flex items-center space-x-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs transition-colors"
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-gray-600">{reaction.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreHorizontal className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChatHeader({ channel }: { channel: Channel }) {
  return (
    <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          {channel.type === 'private' ? (
            <Lock className="h-4 w-4 text-gray-500" />
          ) : (
            <Hash className="h-4 w-4 text-gray-500" />
          )}
          <h1 className="font-semibold text-gray-900">{channel.name}</h1>
        </div>
        
        {channel.members && (
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Users className="h-3 w-3" />
            <span>{channel.members}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Phone className="h-4 w-4 text-gray-500" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Video className="h-4 w-4 text-gray-500" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Settings className="h-4 w-4 text-gray-500" />
        </Button>
      </div>
    </div>
  );
}

function MessageInput({ onSendMessage }: { onSendMessage: (message: string) => void }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="p-4 border-t border-gray-200">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full px-3 py-3 pr-20 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm max-h-32"
              rows={3}
            />
            
            {/* Message input actions */}
            <div className="absolute right-2 top-3 flex items-center space-x-1">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
              >
                <Paperclip className="h-4 w-4 text-gray-400" />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
              >
                <Smile className="h-4 w-4 text-gray-400" />
              </Button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={!message.trim()}
            className="h-6 w-6 p-0 rounded-lg self-end mb-3"
            size="sm"
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function Chat() {
  const [activeChannel, setActiveChannel] = useState('1');
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChannel = mockChannels.find(c => c.id === activeChannel) || mockChannels[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      user: mockUsers[0], // Current user
      content,
      timestamp: new Date(),
      type: 'text',
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="flex h-full overflow-hidden">
      <ChatSidebar 
        channels={mockChannels}
        activeChannel={activeChannel}
        onChannelSelect={setActiveChannel}
      />
      
      <div className="flex-1 flex flex-col">
        <ChatHeader channel={currentChannel} />
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="py-4">
            {messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
} 