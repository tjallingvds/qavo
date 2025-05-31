import React from 'react';
import { 
  Inbox, 
  Send, 
  Archive, 
  Trash2, 
  Star, 
  Flag,
  Edit,
  RefreshCw,
  Settings
} from 'lucide-react';
import { GmailLabel } from '@/lib/api';

interface EmailSidebarProps {
  labels: GmailLabel[];
  activeLabel: string;
  onLabelSelect: (labelId: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const getIcon = (labelName: string, labelId: string) => {
  const name = labelName.toLowerCase();
  
  if (name.includes('inbox')) return Inbox;
  if (name.includes('sent')) return Send;
  if (name.includes('archive')) return Archive;
  if (name.includes('trash')) return Trash2;
  if (name.includes('starred') || name.includes('star')) return Star;
  if (name.includes('flagged') || name.includes('flag')) return Flag;
  
  // Default mapping based on label ID
  if (labelId === 'INBOX') return Inbox;
  if (labelId === 'SENT') return Send;
  if (labelId === 'TRASH') return Trash2;
  if (labelId === 'STARRED') return Star;
  
  return Inbox;
};

const formatLabelName = (labelName: string, labelId: string) => {
  // Handle Gmail system labels
  const systemLabels: { [key: string]: string } = {
    'INBOX': 'Inbox',
    'SENT': 'Sent',
    'TRASH': 'Trash',
    'SPAM': 'Spam',
    'STARRED': 'Starred',
    'DRAFT': 'Drafts',
    'IMPORTANT': 'Important'
  };

  if (systemLabels[labelId]) {
    return systemLabels[labelId];
  }
  
  // Handle category labels
  if (labelName.startsWith('CATEGORY_')) {
    return labelName.replace('CATEGORY_', '').toLowerCase();
  }
  
  // Remove Gmail prefixes
  if (labelName.startsWith('[Gmail]/')) {
    return labelName.replace('[Gmail]/', '');
  }
  
  // Capitalize first letter for other labels
  return labelName.charAt(0).toUpperCase() + labelName.slice(1).toLowerCase();
};

// Filter primary labels that should be shown at the top
const getPrimaryLabels = (labels: GmailLabel[]) => {
  const primaryIds = ['INBOX', 'SENT', 'STARRED', 'TRASH', 'DRAFT', 'SPAM'];
  const primary = labels.filter(label => primaryIds.includes(label.id));
  
  // Sort by specific order
  return primary.sort((a, b) => {
    const order = { 'INBOX': 1, 'SENT': 2, 'STARRED': 3, 'TRASH': 4, 'DRAFT': 5, 'SPAM': 6 };
    return (order[a.id] || 99) - (order[b.id] || 99);
  });
};

export function EmailSidebar({ 
  labels, 
  activeLabel, 
  onLabelSelect,
  onRefresh,
  isLoading
}: EmailSidebarProps) {
  const primaryLabels = getPrimaryLabels(labels);
  
  return (
    <div className="h-full w-full bg-white border-r border-gray-100 relative">
      <div className="absolute inset-0 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-medium text-gray-900 truncate">Mail</h2>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <button 
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <Settings className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Labels */}
        <div className="flex-1 overflow-y-auto py-2">
          {primaryLabels.map((label) => {
            const IconComponent = getIcon(label.name, label.id);
            const displayName = formatLabelName(label.name, label.id);
            
            return (
              <button
                key={label.id}
                onClick={() => onLabelSelect(label.id)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                  activeLabel === label.id 
                    ? 'text-gray-900 bg-gray-100 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <IconComponent className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="truncate">{displayName}</span>
                </div>
                {label.unreadCount && label.unreadCount > 0 && (
                  <span className="text-xs text-gray-500 font-medium ml-1 flex-shrink-0">
                    {label.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
} 