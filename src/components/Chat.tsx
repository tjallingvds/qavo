import React, { useState, useRef, useEffect } from 'react';
import { 
  Hash, 
  Lock, 
  Users, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Phone, 
  Video, 
  Info,
  Smile,
  Paperclip,
  Send,
  ChevronDown,
  ChevronRight,
  Dot,
  Pin,
  Settings
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
  role?: string;
}

interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'dm';
  unreadCount?: number;
  members?: number;
  isPinned?: boolean;
  isArchived?: boolean;
  lastActivity?: Date;
}

interface Reaction {
  emoji: string;
  users: string[];
  count: number;
}

const mockUsers: User[] = [
  { id: '1', name: 'Alice Johnson', avatar: '/avatars/alice.jpg', status: 'online', role: 'Designer' },
  { id: '2', name: 'Bob Smith', avatar: '/avatars/bob.jpg', status: 'online', role: 'Developer' },
  { id: '3', name: 'Carol Davis', avatar: '/avatars/carol.jpg', status: 'away', role: 'Product Manager' },
  { id: '4', name: 'David Wilson', avatar: '/avatars/david.jpg', status: 'online', role: 'Engineer' },
  { id: '5', name: 'Emma Thompson', avatar: '/avatars/emma.jpg', status: 'busy', role: 'UX Researcher' },
];

const mockChannels: Channel[] = [
  { id: '1', name: 'general', type: 'public', unreadCount: 3, members: 12, isPinned: true, lastActivity: new Date(Date.now() - 1000 * 60 * 15) },
  { id: '2', name: 'development', type: 'public', unreadCount: 0, members: 8, isPinned: false, lastActivity: new Date(Date.now() - 1000 * 60 * 30) },
  { id: '3', name: 'design', type: 'public', unreadCount: 1, members: 5, isPinned: true, lastActivity: new Date(Date.now() - 1000 * 60 * 45) },
  { id: '4', name: 'project-alpha', type: 'private', unreadCount: 0, members: 4, isPinned: false, lastActivity: new Date(Date.now() - 1000 * 60 * 60) },
  { id: '5', name: 'random', type: 'public', unreadCount: 0, members: 15, isPinned: false, lastActivity: new Date(Date.now() - 1000 * 60 * 120) },
];

const mockMessages: Message[] = [
  {
    id: '1',
    user: { id: '1', name: 'Alice Johnson', status: 'online', role: 'Designer' },
    content: 'Hey everyone! Just wanted to share the latest design updates for the new feature. I\'ve incorporated all the feedback from last week\'s review.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    type: 'text',
    reactions: [
      { emoji: '👍', count: 2, users: ['2', '3'] }
    ]
  },
  {
    id: '2',
    user: { id: '2', name: 'Bob Smith', status: 'online', role: 'Developer' },
    content: 'Looks fantastic! I especially like the new color scheme and improved navigation flow. When are we planning to ship this to production?',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    type: 'text',
  },
  {
    id: '3',
    user: { id: '3', name: 'Carol Davis', status: 'away', role: 'Product Manager' },
    content: 'The mockups are in Figma if anyone wants to take a detailed look. I\'ll send the link shortly along with the interactive prototype.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    type: 'text',
    reactions: [
      { emoji: '👀', count: 1, users: ['4'] }
    ]
  },
  {
    id: '4',
    user: { id: '4', name: 'David Wilson', status: 'online', role: 'Engineer' },
    content: 'Perfect timing! I was just about to ask for those. Thanks Carol! 🙏 This will help with the implementation planning.',
    timestamp: new Date(Date.now() - 1000 * 60 * 1),
    type: 'text',
    reactions: [
      { emoji: '🙏', count: 1, users: ['3'] }
    ]
  },
];

function ChatSidebar() {
  const [pinnedExpanded, setPinnedExpanded] = useState(true);
  const [channelsExpanded, setChannelsExpanded] = useState(true);
  const [dmExpanded, setDmExpanded] = useState(true);

  return (
    <div className="w-60 bg-white/40 backdrop-blur-xl border-r border-gray-100 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-900">Chat</h2>
          <div className="flex items-center space-x-1">
            <button className="p-1.5 hover:bg-gray-50 rounded-md transition-colors">
              <Search className="h-3.5 w-3.5 text-gray-400" />
            </button>
            <button className="p-1.5 hover:bg-gray-50 rounded-md transition-colors">
              <Settings className="h-3.5 w-3.5 text-gray-400" />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            placeholder="Search conversations..." 
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border-0 rounded-md text-sm placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-200 transition-all"
          />
        </div>
      </div>

      {/* Channel Lists */}
      <div className="flex-1 overflow-y-auto">
        {/* Pinned Section */}
        <div className="p-3">
          <button 
            onClick={() => setPinnedExpanded(!pinnedExpanded)}
            className="flex items-center justify-between w-full p-2 hover:bg-gray-25 rounded-md transition-colors"
          >
            <div className="flex items-center space-x-2">
              {pinnedExpanded ? 
                <ChevronDown className="h-3 w-3 text-gray-400" /> : 
                <ChevronRight className="h-3 w-3 text-gray-400" />
              }
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Pinned</span>
            </div>
            <span className="text-xs text-gray-400">2</span>
          </button>
          
          {pinnedExpanded && (
            <div className="mt-1 space-y-0.5">
              <ChannelItem 
                type="channel"
                name="general" 
                isActive={true}
                hasUnread={true}
                unreadCount={3}
                isPinned={true}
                lastActivity="17m"
              />
              <ChannelItem 
                type="channel"
                name="design" 
                hasUnread={true}
                unreadCount={1}
                isPinned={true}
                lastActivity="47m"
              />
            </div>
          )}
        </div>

        {/* Channels Section */}
        <div className="p-3">
          <button 
            onClick={() => setChannelsExpanded(!channelsExpanded)}
            className="flex items-center justify-between w-full p-2 hover:bg-gray-25 rounded-md transition-colors"
          >
            <div className="flex items-center space-x-2">
              {channelsExpanded ? 
                <ChevronDown className="h-3 w-3 text-gray-400" /> : 
                <ChevronRight className="h-3 w-3 text-gray-400" />
              }
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Channels</span>
            </div>
            <span className="text-xs text-gray-400">3</span>
          </button>
          
          {channelsExpanded && (
            <div className="mt-1 space-y-0.5">
              <ChannelItem 
                type="channel"
                name="development" 
                lastActivity="32m"
              />
              <ChannelItem 
                type="private"
                name="project-alpha" 
                lastActivity="1h"
              />
              <ChannelItem 
                type="channel"
                name="random" 
                lastActivity="2h"
              />
            </div>
          )}
        </div>

        {/* Direct Messages Section */}
        <div className="p-3">
          <button 
            onClick={() => setDmExpanded(!dmExpanded)}
            className="flex items-center justify-between w-full p-2 hover:bg-gray-25 rounded-md transition-colors"
          >
            <div className="flex items-center space-x-2">
              {dmExpanded ? 
                <ChevronDown className="h-3 w-3 text-gray-400" /> : 
                <ChevronRight className="h-3 w-3 text-gray-400" />
              }
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Direct Messages</span>
            </div>
            <span className="text-xs text-gray-400">4</span>
          </button>
          
          {dmExpanded && (
            <div className="mt-1 space-y-0.5">
              <ChannelItem 
                type="dm"
                name="Alice Johnson" 
                hasUnread={true}
                unreadCount={2}
                lastActivity="27m"
                avatar="/avatars/alice.jpg"
                isOnline={true}
              />
              <ChannelItem 
                type="dm"
                name="Bob Smith" 
                hasUnread={true}
                unreadCount={5}
                lastActivity="1h"
                avatar="/avatars/bob.jpg"
                isOnline={true}
              />
              <ChannelItem 
                type="dm"
                name="Carol Davis" 
                lastActivity="11m"
                avatar="/avatars/carol.jpg"
                isOnline={false}
              />
              <ChannelItem 
                type="dm"
                name="David Wilson" 
                hasUnread={true}
                unreadCount={2}
                lastActivity="1h"
                avatar="/avatars/david.jpg"
                isOnline={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Button */}
      <div className="p-3 border-t border-gray-50">
        <button className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
          New conversation
        </button>
      </div>
    </div>
  );
}

function ChannelItem({ 
  type, 
  name, 
  isActive = false, 
  hasUnread = false, 
  unreadCount = 0, 
  lastActivity,
  isPinned = false,
  avatar,
  isOnline = false
}: {
  type: 'channel' | 'private' | 'dm';
  name: string;
  isActive?: boolean;
  hasUnread?: boolean;
  unreadCount?: number;
  lastActivity?: string;
  isPinned?: boolean;
  avatar?: string;
  isOnline?: boolean;
}) {
  const getIcon = () => {
    if (type === 'private') return <Lock className="h-3 w-3 text-gray-400" />;
    if (type === 'dm') return null;
    return <Hash className="h-3 w-3 text-gray-400" />;
  };

  return (
    <div 
      className={`flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer transition-all group ${
        isActive 
          ? 'bg-gray-50 text-gray-900' 
          : 'text-gray-600 hover:bg-gray-25 hover:text-gray-900'
      }`}
    >
      <div className="flex items-center space-x-2 min-w-0 flex-1">
        {type === 'dm' ? (
          <div className="relative">
            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-gray-600">
                {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            {isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
            )}
          </div>
        ) : (
          getIcon()
        )}
        <div className="flex items-center space-x-1 min-w-0 flex-1">
          <span className={`text-sm truncate ${!hasUnread ? '' : 'font-medium'}`}>
            {name}
          </span>
          {isPinned && <Pin className="h-3 w-3 text-gray-400 flex-shrink-0" />}
        </div>
      </div>
      
      <div className="flex items-center space-x-2 flex-shrink-0">
        {hasUnread && unreadCount > 0 && (
          <div className="bg-gray-900 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] h-4 flex items-center justify-center font-medium">
            {unreadCount}
          </div>
        )}
        {lastActivity && (
          <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
            {lastActivity}
          </span>
        )}
        {hasUnread && !unreadCount && (
          <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
        )}
      </div>
    </div>
  );
}

function ChatHeader() {
  return (
    <div className="px-6 py-4 border-b border-gray-50 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Hash className="h-4 w-4 text-gray-500" />
            <h1 className="text-lg font-medium text-gray-900">general</h1>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>12</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button className="p-2 hover:bg-gray-50 rounded-md transition-colors">
            <Phone className="h-4 w-4 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-50 rounded-md transition-colors">
            <Video className="h-4 w-4 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-50 rounded-md transition-colors">
            <Info className="h-4 w-4 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-50 rounded-md transition-colors">
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </button>
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
    <div className="px-6 py-3 hover:bg-gray-25/50 transition-colors group">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {message.user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-900">{message.user.name}</span>
            <span className="text-xs text-gray-500">{message.user.role}</span>
            <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
              {formatTime(message.timestamp)}
            </span>
          </div>
          
          <div className="text-[15px] text-gray-800 leading-relaxed">
            {message.content}
          </div>
          
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex items-center space-x-1 mt-2">
              {message.reactions.map((reaction, index) => (
                <button 
                  key={index}
                  className="flex items-center space-x-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded-full text-xs transition-colors"
                >
                  <span>{reaction.emoji}</span>
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

function MessageInput() {
  const [message, setMessage] = useState('');

  return (
    <div className="px-6 py-4 border-t border-gray-50 bg-white">
      <div className="flex items-end space-x-3">
        <div className="flex-1">
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-3 pr-12 bg-gray-50 border-0 rounded-lg text-sm placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-200 transition-all resize-none"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
                <Paperclip className="h-4 w-4 text-gray-400" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
                <Smile className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
        
        <button 
          disabled={!message.trim()}
          className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function Chat() {
  return (
    <div className="flex h-full bg-white overflow-hidden">
      <ChatSidebar />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatHeader />
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {mockMessages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
        </div>
        
        <MessageInput />
      </div>
    </div>
  );
} 