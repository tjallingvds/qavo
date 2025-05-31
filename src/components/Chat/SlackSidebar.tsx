import React, { useState } from 'react';
import { 
  Hash, 
  Lock, 
  Search, 
  Settings,
  ChevronDown,
  ChevronRight,
  Dot,
  Pin,
  RefreshCw
} from 'lucide-react';
import { SlackChannel } from '@/lib/api';

interface SlackSidebarProps {
  channels: SlackChannel[];
  activeChannel?: SlackChannel;
  onChannelSelect: (channel: SlackChannel) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

function ChannelItem({ 
  channel,
  isActive = false,
  onClick
}: {
  channel: SlackChannel;
  isActive?: boolean;
  onClick: () => void;
}) {
  const getIcon = () => {
    if (channel.isIm) return null; // DM - no icon
    if (!channel.isChannel) return <Lock className="h-3 w-3 text-gray-400" />; // Private
    return <Hash className="h-3 w-3 text-gray-400" />; // Public channel
  };

  return (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer transition-all group ${
        isActive 
          ? 'bg-gray-50 text-gray-900' 
          : 'text-gray-600 hover:bg-gray-25 hover:text-gray-900'
      }`}
    >
      <div className="flex items-center space-x-2 min-w-0 flex-1">
        {channel.isIm ? (
          <div className="relative">
            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-gray-600">
                {channel.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
          </div>
        ) : (
          getIcon()
        )}
        <div className="flex items-center space-x-1 min-w-0 flex-1">
          <span className={`text-sm truncate font-medium`}>
            {channel.name}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        {channel.memberCount && (
          <span className="text-xs text-gray-400">
            {channel.memberCount}
          </span>
        )}
      </div>
    </div>
  );
}

export function SlackSidebar({ 
  channels, 
  activeChannel, 
  onChannelSelect, 
  onRefresh,
  isLoading 
}: SlackSidebarProps) {
  const [channelsExpanded, setChannelsExpanded] = useState(true);
  const [dmExpanded, setDmExpanded] = useState(true);

  // Separate channels and DMs
  const publicChannels = channels.filter(c => c.isChannel && !c.isIm && !c.isGroup);
  const privateChannels = channels.filter(c => c.isGroup && !c.isIm);
  const directMessages = channels.filter(c => c.isIm);

  return (
    <div className="w-60 bg-white/40 backdrop-blur-xl border-r border-gray-100 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-900">Chat</h2>
          <div className="flex items-center space-x-1">
            <button 
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1.5 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
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
        {/* Public Channels */}
        {publicChannels.length > 0 && (
          <div className="px-3 py-2">
            <button 
              onClick={() => setChannelsExpanded(!channelsExpanded)}
              className="flex items-center space-x-2 w-full text-left py-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              {channelsExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              <span>CHANNELS ({publicChannels.length})</span>
            </button>
            {channelsExpanded && (
              <div className="mt-1 space-y-0.5">
                {publicChannels.map((channel) => (
                  <ChannelItem
                    key={channel.id}
                    channel={channel}
                    isActive={activeChannel?.id === channel.id}
                    onClick={() => onChannelSelect(channel)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Private Channels */}
        {privateChannels.length > 0 && (
          <div className="px-3 py-2">
            <button 
              onClick={() => setChannelsExpanded(!channelsExpanded)}
              className="flex items-center space-x-2 w-full text-left py-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              {channelsExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              <span>PRIVATE CHANNELS ({privateChannels.length})</span>
            </button>
            {channelsExpanded && (
              <div className="mt-1 space-y-0.5">
                {privateChannels.map((channel) => (
                  <ChannelItem
                    key={channel.id}
                    channel={channel}
                    isActive={activeChannel?.id === channel.id}
                    onClick={() => onChannelSelect(channel)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Direct Messages */}
        {directMessages.length > 0 && (
          <div className="px-3 py-2">
            <button 
              onClick={() => setDmExpanded(!dmExpanded)}
              className="flex items-center space-x-2 w-full text-left py-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              {dmExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              <span>DIRECT MESSAGES ({directMessages.length})</span>
            </button>
            {dmExpanded && (
              <div className="mt-1 space-y-0.5">
                {directMessages.map((channel) => (
                  <ChannelItem
                    key={channel.id}
                    channel={channel}
                    isActive={activeChannel?.id === channel.id}
                    onClick={() => onChannelSelect(channel)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 