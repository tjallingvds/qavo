import React, { useState, useRef, useEffect } from 'react';
import { 
  Inbox, 
  Send, 
  Archive, 
  Trash2, 
  Star, 
  Flag, 
  Search,
  Plus,
  Edit,
  Settings,
  Filter,
  MoreHorizontal,
  ChevronDown,
  Paperclip,
  Reply,
  ReplyAll,
  Forward,
  Eye,
  EyeOff,
  Calendar,
  User,
  RefreshCw,
  SortAsc,
  ChevronRight,
  Mail,
  Dot,
  X
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface EmailMessage {
  id: string;
  sender: EmailUser;
  subject: string;
  preview: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  isFlagged: boolean;
  hasAttachment: boolean;
  folder: string;
  priority: 'high' | 'normal' | 'low';
  recipients: EmailUser[];
}

interface EmailUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface EmailFolder {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  unreadCount?: number;
}

const mockUsers: EmailUser[] = [
  { id: '1', name: 'Sarah Chen', email: 'sarah.chen@company.com' },
  { id: '2', name: 'Marcus Rodriguez', email: 'marcus.r@company.com' },
  { id: '3', name: 'Priya Patel', email: 'priya.patel@company.com' },
  { id: '4', name: 'James Wilson', email: 'james.wilson@company.com' },
  { id: '5', name: 'Emma Thompson', email: 'emma.t@company.com' },
];

const mockFolders: EmailFolder[] = [
  { id: '1', name: 'Inbox', icon: Inbox, count: 24, unreadCount: 5 },
  { id: '2', name: 'Sent', icon: Send, count: 87 },
  { id: '3', name: 'Archive', icon: Archive, count: 156 },
  { id: '4', name: 'Trash', icon: Trash2, count: 12 },
  { id: '5', name: 'Starred', icon: Star, count: 8 },
  { id: '6', name: 'Flagged', icon: Flag, count: 3, unreadCount: 1 },
];

const mockEmails: EmailMessage[] = [
  {
    id: '1',
    sender: mockUsers[0],
    subject: 'Q4 Marketing Strategy Review',
    preview: 'Hi team, I wanted to share the latest updates on our Q4 marketing strategy. We\'ve made significant progress...',
    content: `Hi team,

I wanted to share the latest updates on our Q4 marketing strategy. We've made significant progress on several fronts:

1. Brand positioning analysis is complete
2. Customer segmentation data is ready for review
3. Budget allocation proposal needs final approval

Let's schedule a meeting this week to discuss the next steps.

Best regards,
Sarah`,
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    isRead: false,
    isStarred: true,
    isFlagged: false,
    hasAttachment: true,
    folder: 'inbox',
    priority: 'high',
    recipients: [mockUsers[1], mockUsers[2]]
  },
  {
    id: '2',
    sender: mockUsers[1],
    subject: 'Design System Updates',
    preview: 'The design system has been updated with new components and guidelines. Please review the changes...',
    content: `Hello everyone,

The design system has been updated with new components and guidelines. Please review the changes at your earliest convenience.

Key updates include:
- New button variants
- Updated typography scale
- Improved color palette
- Accessibility enhancements

Documentation is available in the usual place.

Thanks,
Marcus`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isRead: true,
    isStarred: false,
    isFlagged: true,
    hasAttachment: false,
    folder: 'inbox',
    priority: 'normal',
    recipients: [mockUsers[0], mockUsers[3]]
  },
  {
    id: '3',
    sender: mockUsers[2],
    subject: 'Project Timeline Update',
    preview: 'Following up on yesterday\'s meeting, here are the updated project timelines for the upcoming sprint...',
    content: `Hi all,

Following up on yesterday's meeting, here are the updated project timelines for the upcoming sprint.

We're on track to deliver the MVP by the end of this month. The next milestone is scheduled for the first week of next month.

Please let me know if you have any concerns or questions.

Regards,
Priya`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    isRead: true,
    isStarred: false,
    isFlagged: false,
    hasAttachment: false,
    folder: 'inbox',
    priority: 'normal',
    recipients: [mockUsers[0], mockUsers[1], mockUsers[3]]
  },
];

function EmailSidebar({ 
  folders, 
  activeFolder, 
  onFolderSelect 
}: { 
  folders: EmailFolder[]; 
  activeFolder: string; 
  onFolderSelect: (folderId: string) => void;
}) {
  return (
    <div className="w-60 bg-white/40 backdrop-blur-xl border-r border-gray-100 flex flex-col h-full rounded-l-xl">
      {/* Header */}
      <div className="p-3 border-b border-gray-50 rounded-tl-xl">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-900">Mail</h2>
          <button className="p-2 hover:bg-gray-50 rounded-md transition-colors">
            <Edit className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Folders */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-0.5">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => onFolderSelect(folder.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all ${
                activeFolder === folder.id 
                  ? 'bg-gray-50 text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-25 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <folder.icon className="h-4 w-4" />
                <span>{folder.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                {folder.unreadCount && folder.unreadCount > 0 && (
                  <div className="bg-gray-900 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] h-4 flex items-center justify-center font-medium">
                    {folder.unreadCount}
                  </div>
                )}
                {folder.count && (
                  <span className="text-xs text-gray-400">{folder.count}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CompactEmailListItem({ email, onClick, isSelected }: { 
  email: EmailMessage; 
  onClick: () => void;
  isSelected?: boolean;
}) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays === 1 ? '1d' : `${diffInDays}d`;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`px-6 py-3 cursor-pointer transition-all duration-150 border-b border-gray-100 last:border-b-0 ${
        isSelected ? 'bg-gray-50 border-l-2 border-l-gray-900' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <span className={`text-sm ${!email.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
              {email.sender.name}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className={`text-sm truncate ${!email.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                {email.subject}
              </h4>
              {!email.isRead && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
          {email.hasAttachment && <Paperclip className="h-3.5 w-3.5 text-gray-400" />}
          {email.isStarred && <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />}
          <span className="text-xs text-gray-400 font-normal">{formatTime(email.timestamp)}</span>
        </div>
      </div>
    </div>
  );
}

function EmailDetail({ email, onBack }: { email: EmailMessage; onBack?: () => void }) {
  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-white rounded-r-xl">
      {/* Email Header */}
      <div className="px-6 py-5 border-b border-gray-50 rounded-tr-xl">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-medium text-gray-900 leading-relaxed">{email.subject}</h1>
              <button 
                onClick={onBack}
                className="p-1.5 hover:bg-gray-50 rounded-md transition-colors"
                title="Close email"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {email.sender.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <span className="text-gray-900">{email.sender.name}</span>
                <span className="text-gray-500">to me</span>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {formatTimestamp(email.timestamp)}
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button className="p-2 hover:bg-gray-50 rounded-md transition-colors">
              <Star className={`h-4 w-4 ${email.isStarred ? 'text-gray-900 fill-current' : 'text-gray-400'}`} />
            </button>
            <button className="p-2 hover:bg-gray-50 rounded-md transition-colors">
              <Archive className="h-4 w-4 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-50 rounded-md transition-colors">
              <Trash2 className="h-4 w-4 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-50 rounded-md transition-colors">
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Reply
          </button>
          <button className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm transition-colors">
            Forward
          </button>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-none">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-[15px]">
            {email.content}
          </div>

          {email.hasAttachment && (
            <div className="mt-8 p-4 bg-gray-25 rounded-lg border border-gray-100">
              <div className="flex items-center space-x-2 mb-3">
                <Paperclip className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">1 attachment</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700">PDF</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">Q4_Strategy_Document.pdf</p>
                    <p className="text-xs text-gray-500">2.4 MB</p>
                  </div>
                </div>
                <button className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  Download
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Email() {
  const [activeFolder, setActiveFolder] = useState('1');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const currentFolder = mockFolders.find(f => f.id === activeFolder) || mockFolders[0];
  const currentEmail = mockEmails.find(e => e.id === selectedEmail);
  
  const filteredEmails = mockEmails.filter(email => 
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCloseEmail = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedEmail(null);
      setIsClosing(false);
    }, 300);
  };

  // Show email detail if we have a selected email OR if we're in the middle of closing
  const showEmailDetail = currentEmail || isClosing;
  const emailToShow = currentEmail || (isClosing && mockEmails.find(e => e.id === selectedEmail));

  return (
    <div className="flex h-full bg-white overflow-hidden rounded-xl">
      <EmailSidebar 
        folders={mockFolders}
        activeFolder={activeFolder} 
        onFolderSelect={setActiveFolder}
      />
      
      {/* Email List - adjusts width based on whether email is selected */}
      <div className={`flex flex-col bg-white border-r border-gray-100 transition-all duration-300 ease-in-out ${
        showEmailDetail && !isClosing ? 'w-96' : 'flex-1'
      }`}>
        {/* List Header */}
        <div className="px-6 py-3 border-b border-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-semibold text-gray-900">{currentFolder.name}</h3>
              <button className="p-2 hover:bg-gray-50 rounded-md transition-colors">
                <RefreshCw className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  placeholder="Search emails..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-9 pr-3 py-2 bg-gray-50 border-0 rounded-md text-sm placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-200 transition-all ${
                    currentEmail ? 'w-44' : 'w-64'
                  }`}
                />
              </div>
              
              <div className="flex items-center space-x-1">
                <button className="p-2 hover:bg-gray-50 rounded-md transition-colors">
                  <SortAsc className="h-4 w-4 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-50 rounded-md transition-colors">
                  <Filter className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white">
            {filteredEmails.map((email) => (
              <CompactEmailListItem
                key={email.id}
                email={email}
                onClick={() => setSelectedEmail(email.id)}
                isSelected={selectedEmail === email.id}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Email Detail - slides in from right */}
      {showEmailDetail && (
        <div className={`flex-[1.2] transition-all duration-300 ease-in-out ${
          isClosing ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
        }`}>
          <EmailDetail email={emailToShow} onBack={handleCloseEmail} />
        </div>
      )}
    </div>
  );
} 