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
  Dot
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
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Mail</h2>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <RefreshCw className="h-4 w-4 text-gray-500" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Settings className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        </div>
        
        {/* Compose Button */}
        <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Compose
        </Button>
      </div>

      {/* Folders */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => onFolderSelect(folder.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                activeFolder === folder.id 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <folder.icon className="h-4 w-4 text-gray-500" />
                <span>{folder.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                {folder.unreadCount && folder.unreadCount > 0 && (
                  <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                    {folder.unreadCount}
                  </Badge>
                )}
                {folder.count && (
                  <span className="text-xs text-gray-500">{folder.count}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmailListItem({ email, isSelected, onClick }: { 
  email: EmailMessage; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
      } ${!email.isRead ? 'bg-gray-25' : ''}`}
    >
      <div className="flex items-start space-x-3">
        <Avatar className="h-8 w-8 mt-0.5">
          <AvatarImage src={email.sender.avatar} />
          <AvatarFallback className="text-xs bg-gray-200">
            {email.sender.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${!email.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                {email.sender.name}
              </span>
              {!email.isRead && <Dot className="h-3 w-3 text-blue-600" />}
            </div>
            <div className="flex items-center space-x-1">
              {email.hasAttachment && <Paperclip className="h-3 w-3 text-gray-400" />}
              {email.isStarred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
              {email.isFlagged && <Flag className="h-3 w-3 text-red-500" />}
              <span className="text-xs text-gray-500">{formatTime(email.timestamp)}</span>
            </div>
          </div>
          
          <div className="mb-1">
            <h4 className={`text-sm truncate ${!email.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
              {email.subject}
            </h4>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {email.preview}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmailDetail({ email }: { email: EmailMessage }) {
  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Email Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">{email.subject}</h1>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={email.sender.avatar} />
                  <AvatarFallback className="text-xs">
                    {email.sender.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{email.sender.name}</span>
                <span className="text-gray-500">&lt;{email.sender.email}&gt;</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatTimestamp(email.timestamp)}
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Star className={`h-4 w-4 ${email.isStarred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Flag className={`h-4 w-4 ${email.isFlagged ? 'text-red-500' : 'text-gray-400'}`} />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Archive className="h-4 w-4 text-gray-400" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Trash2 className="h-4 w-4 text-gray-400" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="text-gray-700">
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </Button>
          <Button variant="outline" size="sm" className="text-gray-700">
            <ReplyAll className="h-4 w-4 mr-2" />
            Reply All
          </Button>
          <Button variant="outline" size="sm" className="text-gray-700">
            <Forward className="h-4 w-4 mr-2" />
            Forward
          </Button>
        </div>
      </div>
      
      {/* Email Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-white">
        <div className="prose prose-gray max-w-none">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {email.content}
          </div>
        </div>
        
        {email.hasAttachment && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2">
              <Paperclip className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Attachments</span>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-xs font-semibold text-blue-700">PDF</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Q4_Strategy_Document.pdf</p>
                    <p className="text-xs text-gray-500">2.4 MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Download
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Email() {
  const [activeFolder, setActiveFolder] = useState('1');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(mockEmails[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentFolder = mockFolders.find(f => f.id === activeFolder) || mockFolders[0];
  const currentEmail = mockEmails.find(e => e.id === selectedEmail);
  
  const filteredEmails = mockEmails.filter(email => 
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <EmailSidebar 
        folders={mockFolders}
        activeFolder={activeFolder}
        onFolderSelect={setActiveFolder}
      />
      
      {/* Email List */}
      <div className="w-96 border-r border-gray-200 flex flex-col bg-white">
        {/* List Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">{currentFolder.name}</h3>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <SortAsc className="h-4 w-4 text-gray-500" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Filter className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search emails..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-gray-200 h-8 text-sm"
            />
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          {filteredEmails.map((email) => (
            <EmailListItem
              key={email.id}
              email={email}
              isSelected={selectedEmail === email.id}
              onClick={() => setSelectedEmail(email.id)}
            />
          ))}
        </div>
      </div>
      
      {/* Email Detail */}
      {currentEmail ? (
        <EmailDetail email={currentEmail} />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No email selected</h3>
            <p className="text-gray-500">Choose an email from the list to view its contents</p>
          </div>
        </div>
      )}
    </div>
  );
} 