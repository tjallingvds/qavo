import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Plus,
  X,
  Globe,
  Home,
  Brain,
  Users,
  StickyNote,
  Star,
  Flag,
  Share2,
  Search,
  Sparkles,
  Target,
  Activity,
  Clock,
  FileText,
  MessageSquare,
  Lightbulb,
  Layers,
  BookOpen,
  ExternalLink,
  Eye,
  Settings,
  Archive,
  UserPlus,
  ChevronDown,
  Pin,
  TrendingUp,
  Workflow,
  Zap,
  MoreHorizontal
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ResearchTab {
  id: string;
  title: string;
  url: string;
  isLoading: boolean;
  type: 'hub' | 'research';
  noteCount?: number;
  tags?: string[];
  collaborators?: WorkspaceMember[];
  aiSummary?: string;
  isStarred?: boolean;
  isFlagged?: boolean;
}

interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  currentPage?: string;
}

interface AIInsight {
  id: string;
  type: 'summary' | 'suggestion' | 'alert' | 'discovery';
  content: string;
  confidence: number;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
}

interface WorkspaceData {
  id: string;
  name: string;
  emoji: string;
  description: string;
  members: WorkspaceMember[];
  aiInsights: AIInsight[];
  totalNotes: number;
  weeklyActivity: number;
}

interface WebsiteColors {
  primary: string;
  text: string;
  background: string;
  accent: string;
  isDark: boolean;
}

export interface ResearchPagesRef {
  handleNavigation: (url: string) => void;
  addNewResearchPage: () => void;
  reload: () => void;
  goHome: () => void;
}

interface WebviewElement extends HTMLElement {
  src: string;
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
  executeJavaScript: (script: string) => Promise<any>;
  addEventListener: (event: string, handler: (event: any) => void) => void;
  removeEventListener: (event: string, handler: (event: any) => void) => void;
  _cleanup?: () => void;
}

// Mock workspace data
const mockWorkspace: WorkspaceData = {
  id: '1',
  name: 'AI Product Research',
  emoji: '🧠',
  description: 'Deep dive into AI/ML product landscape and competitive analysis',
  members: [
    { 
      id: '1', 
      name: 'Sarah Chen', 
      email: 'sarah@team.com', 
      status: 'online', 
      currentPage: 'AI Research Findings' 
    },
    { 
      id: '2', 
      name: 'Marcus Rodriguez', 
      email: 'marcus@team.com', 
      status: 'away', 
      currentPage: 'Competitor Analysis' 
    },
    { 
      id: '3', 
      name: 'Priya Patel', 
      email: 'priya@team.com', 
      status: 'online', 
      currentPage: 'User Research' 
    },
  ],
  aiInsights: [
    {
      id: 'i1',
      type: 'discovery',
      content: 'Found 3 new breakthrough papers on multimodal AI that could impact product direction',
      confidence: 0.92,
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      priority: 'high'
    },
    {
      id: 'i2',
      type: 'suggestion',
      content: 'Consider organizing findings into a synthesis document - detected overlapping themes',
      confidence: 0.85,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      priority: 'medium'
    }
  ],
  totalNotes: 38,
  weeklyActivity: 89
};

// Sortable Tab Component
interface SortableTabProps {
  tab: ResearchTab;
  isActive: boolean;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  canClose: boolean;
  websiteColors: WebsiteColors;
}

function SortableTab({ tab, isActive, onTabClick, onTabClose, canClose, websiteColors }: SortableTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: tab.id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    marginRight: '-1px',
  };

  const getTabIcon = () => {
    if (tab.type === 'hub') {
      return <Home className="w-4 h-4 mr-2 flex-shrink-0 relative z-10" />;
    }
    return <Globe className="w-4 h-4 mr-2 flex-shrink-0 relative z-10" />;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative flex items-center px-4 py-2 cursor-pointer w-48 transition-all duration-300 group ${
        isActive 
          ? 'bg-transparent' 
          : 'bg-gray-100 hover:bg-gray-200'
      } ${isDragging ? 'opacity-50 z-50' : ''}`}
      onClick={() => onTabClick(tab.id)}
    >
      {React.cloneElement(getTabIcon(), {
        style: { 
          color: isActive 
            ? (websiteColors.isDark ? '#ffffff' : websiteColors.text)
            : '#6b7280'
        }
      })}
      
      <div className="flex-1 min-w-0 relative z-10">
        <span 
          className="truncate text-sm font-medium block"
          style={{ 
            color: isActive 
              ? (websiteColors.isDark ? '#ffffff' : websiteColors.text)
              : '#6b7280'
          }}
        >
          {tab.title}
        </span>
        
        {/* Research tab indicators */}
        {tab.type === 'research' && (
          <div className="flex items-center space-x-1 mt-0.5">
            {tab.noteCount != null && tab.noteCount > 0 && (
              <span className="text-xs text-gray-500 flex items-center">
                <StickyNote className="w-2.5 h-2.5 mr-1" />
                {tab.noteCount}
              </span>
            )}
            {tab.isStarred && <Star className="w-2.5 h-2.5 text-yellow-500 fill-current" />}
            {tab.isFlagged && <Flag className="w-2.5 h-2.5 text-red-500" />}
          </div>
        )}
      </div>
      
      {canClose && tab.type === 'research' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTabClose(tab.id);
          }}
          className={`ml-2 p-1 rounded-full transition-colors relative z-10 flex-shrink-0 ${
            !isActive ? 'hover:bg-gray-300' : ''
          }`}
          style={{
            color: isActive 
              ? (websiteColors.isDark ? '#ffffff' : websiteColors.text)
              : '#6b7280',
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => {
            if (isActive) {
              e.currentTarget.style.backgroundColor = websiteColors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (isActive) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <X className="w-3 h-3" />
        </button>
      )}
      
      {/* Adaptive background for active tab */}
      {isActive && (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: websiteColors.background,
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              zIndex: 0,
            }}
          />
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 2,
            }}
          />
        </>
      )}
    </div>
  );
}

// Workspace Hub Component
function WorkspaceHub({ workspace, onCreateResearchPage }: { 
  workspace: WorkspaceData; 
  onCreateResearchPage: () => void;
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
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getPriorityInsight = () => {
    return workspace.aiInsights.find(insight => insight.priority === 'high') || workspace.aiInsights[0];
  };

  // Mock deadline - in real app this would come from workspace data
  const deadline = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days from now
  const formatDeadline = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Mock task data
  const tasksAtHand = [
    {
      id: '1',
      title: 'Compare OpenAI vs Anthropic pricing tiers',
      priority: 'high',
      status: 'in-progress',
      assignee: 'Sarah Chen',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      progressOutput: {
        type: 'document',
        title: 'Pricing Comparison Draft',
        url: '#pricing-comparison-draft',
        icon: '📝'
      }
    },
    {
      id: '2',
      title: 'Extract key technical specifications from competitor docs',
      priority: 'medium',
      status: 'pending',
      assignee: 'Marcus Rodriguez',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
    },
    {
      id: '3',
      title: 'Synthesize user feedback on pricing preferences',
      priority: 'medium',
      status: 'completed',
      assignee: 'Priya Patel',
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      completedOutput: {
        type: 'document',
        title: 'User Pricing Preferences Analysis',
        url: '#user-pricing-analysis',
        icon: '📄'
      }
    },
    {
      id: '4',
      title: 'Identify gaps in current market analysis',
      priority: 'low',
      status: 'pending',
      assignee: 'Sarah Chen',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
    },
  ];

  const relevantDocuments = [
    {
      id: '1',
      title: 'AI Market Analysis Q4 2024',
      type: 'document',
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 2),
      author: 'Sarah Chen',
      url: '#',
    },
    {
      id: '2',
      title: 'Competitor Technical Specs',
      type: 'spreadsheet',
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 6),
      author: 'Marcus Rodriguez',
      url: '#',
    },
    {
      id: '3',
      title: 'User Research Synthesis',
      type: 'presentation',
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24),
      author: 'Priya Patel',
      url: '#',
    },
  ];

  const keyFindings = [
    {
      id: '1',
      content: 'OpenAI pricing model shows 40% higher efficiency than competitors',
      source: 'Competitor Analysis Page',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: '2',
      content: 'Users prefer subscription-based pricing over pay-per-use by 3:1 ratio',
      source: 'User Interview Notes',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
  ];

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'pending': return 'text-gray-600 bg-gray-50 border-gray-100';
      case 'overdue': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-100';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'document': return '📄';
      case 'spreadsheet': return '📊';
      case 'presentation': return '📈';
      default: return '📎';
    }
  };

  return (
    <div className="flex h-full bg-white overflow-hidden">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-50 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-xl">{workspace.emoji}</div>
              <div>
                <h1 className="text-lg font-medium text-gray-900">{workspace.name}</h1>
                <p className="text-sm text-gray-600 mt-1">{workspace.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm transition-colors">
                <UserPlus className="h-4 w-4 mr-2 inline" />
                Invite
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subtasks */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-100 rounded-lg overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs">📋</span>
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm">Subtasks</h3>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button className="p-1.5 hover:bg-gray-50 rounded-md transition-colors" title="Add Task">
                        <Plus className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-50 rounded-md transition-colors" title="Add Note">
                        <StickyNote className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-50 rounded-md transition-colors" title="Set Reminder">
                        <Clock className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {tasksAtHand.map((task, index) => (
                    <div key={task.id} className="p-4 hover:bg-gray-25/50 transition-colors group">
                      <div className="flex items-start gap-3">
                        {/* Task Status Indicator */}
                        <div className="flex-shrink-0 mt-0.5">
                          {task.status === 'completed' ? (
                            <div className="w-4 h-4 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            </div>
                          ) : task.status === 'in-progress' ? (
                            <div className="w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-gray-100 border-2 border-gray-300"></div>
                          )}
                        </div>
                        
                        {/* Task Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className={`text-sm font-medium ${
                                task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                              }`}>
                                {task.title}
                              </h4>
                              <div className="flex items-center gap-3 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {task.assignee}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Due {formatTime(task.dueDate)}
                                </span>
                                {/* Completed Output Indicator */}
                                {task.status === 'completed' && task.completedOutput && (
                                  <button
                                    onClick={() => {
                                      // In a real app, this would navigate to the document
                                      console.log('Opening output:', task.completedOutput);
                                    }}
                                    className="flex items-center gap-1 text-xs text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-2 py-0.5 rounded-full border border-green-200 transition-colors"
                                    title={`View output: ${task.completedOutput.title}`}
                                  >
                                    <span>{task.completedOutput.icon}</span>
                                    <span>View Result</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </button>
                                )}
                                {/* In-Progress Output Indicator */}
                                {task.status === 'in-progress' && task.progressOutput && (
                                  <button
                                    onClick={() => {
                                      // In a real app, this would navigate to the draft/progress document
                                      console.log('Opening progress:', task.progressOutput);
                                    }}
                                    className="flex items-center gap-1 text-xs text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200 transition-colors"
                                    title={`View progress: ${task.progressOutput.title}`}
                                  >
                                    <span>{task.progressOutput.icon}</span>
                                    <span>View Progress</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {task.status !== 'completed' && (
                                <button 
                                  className="p-1.5 hover:bg-gray-100 rounded-md transition-colors" 
                                  title="Complete with AI"
                                >
                                  <Brain className="h-4 w-4 text-gray-600" />
                                </button>
                              )}
                              <button 
                                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors" 
                                title="More options"
                              >
                                <MoreHorizontal className="h-4 w-4 text-gray-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Findings */}
              <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-50">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-xs">💡</span>
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm">Key Findings</h3>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {keyFindings.map((finding) => (
                    <div key={finding.id} className="p-3 bg-gray-50 rounded-md border border-gray-100">
                      <p className="text-xs text-gray-600 leading-relaxed mb-2">{finding.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>From {finding.source}</span>
                        <span>{formatTime(finding.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Team Members */}
              <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-50">
                  <h3 className="font-medium text-gray-900 text-sm">Team Members</h3>
                </div>
                <div className="p-4 space-y-3">
                  {workspace.members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white ${
                          member.status === 'online' ? 'bg-green-400' :
                          member.status === 'away' ? 'bg-yellow-400' :
                          member.status === 'busy' ? 'bg-red-400' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-900">{member.name}</div>
                        <div className="text-xs text-gray-500">{member.currentPage}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Relevant Documents */}
              <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-50">
                  <h3 className="font-medium text-gray-900 text-sm">Relevant Documents</h3>
                </div>
                <div className="p-4 space-y-3">
                  {relevantDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-start space-x-3 p-2 hover:bg-gray-25 rounded-md transition-colors cursor-pointer">
                      <div className="text-sm">{getDocumentIcon(doc.type)}</div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-800 line-clamp-1">{doc.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          <span>by {doc.author}</span>
                          <span className="mx-1">•</span>
                          <span>{formatTime(doc.lastModified)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ResearchPages = forwardRef<ResearchPagesRef, { workspaceId?: string }>((props, ref) => {
  const [tabs, setTabs] = useState<ResearchTab[]>([
    { 
      id: 'hub', 
      title: `${mockWorkspace.emoji} ${mockWorkspace.name}`, 
      url: '', 
      isLoading: false, 
      type: 'hub' 
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('hub');
  const [addressBarValue, setAddressBarValue] = useState('');
  const [websiteColors, setWebsiteColors] = useState<WebsiteColors>({
    primary: '#ffffff',
    text: '#000000',
    background: '#ffffff',
    accent: '#3b82f6',
    isDark: false
  });
  
  const webviewRefs = useRef<{ [key: string]: WebviewElement }>({});
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const isColorDark = (hex: string): boolean => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness < 128;
  };

  const extractWebsiteColors = async (webview: WebviewElement): Promise<WebsiteColors> => {
    try {
      const colorData = await webview.executeJavaScript(`
        (function() {
          const computedStyle = window.getComputedStyle(document.body);
          const bgColor = computedStyle.backgroundColor;
          const textColor = computedStyle.color;
          
          function rgbToHex(rgb) {
            const match = rgb.match(/rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)/);
            if (!match) return '#ffffff';
            return '#' + 
              parseInt(match[1]).toString(16).padStart(2, '0') +
              parseInt(match[2]).toString(16).padStart(2, '0') +
              parseInt(match[3]).toString(16).padStart(2, '0');
          }
          
          function getMainColors() {
            const colors = [];
            const elements = document.querySelectorAll('*');
            for (let i = 0; i < Math.min(elements.length, 50); i++) {
              const style = window.getComputedStyle(elements[i]);
              const bg = style.backgroundColor;
              if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                colors.push(bg);
              }
            }
            return colors;
          }
          
          const primaryColor = getMainColors()[0] || bgColor;
          
          return {
            background: rgbToHex(bgColor),
            text: rgbToHex(textColor),
            primary: rgbToHex(primaryColor),
            accent: rgbToHex(primaryColor) || '#3b82f6'
          };
        })();
      `);

      const isDark = isColorDark(colorData.background);
      
      return {
        primary: colorData.primary,
        text: colorData.text,
        background: colorData.background,
        accent: colorData.accent,
        isDark: isDark
      };
    } catch (error) {
      console.error('Error extracting colors:', error);
      return {
        primary: '#ffffff',
        text: '#000000',
        background: '#ffffff',
        accent: '#3b82f6',
        isDark: false
      };
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTabs((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  useEffect(() => {
    const extractColorsForActiveTab = async () => {
      const activeTab = tabs.find(tab => tab.id === activeTabId);
      if (activeTab && activeTab.type === 'research') {
        const webview = webviewRefs.current[activeTabId];
        if (webview) {
          try {
            const colors = await extractWebsiteColors(webview);
            setWebsiteColors(colors);
          } catch (error) {
            console.error('Failed to extract colors:', error);
          }
        }
      } else {
        // Reset to default colors for hub
        setWebsiteColors({
          primary: '#ffffff',
          text: '#000000',
          background: '#ffffff',
          accent: '#3b82f6',
          isDark: false
        });
      }
    };

    extractColorsForActiveTab();
  }, [activeTabId, tabs]);

  const setupWebviewListeners = (tabId: string, webview: WebviewElement) => {
    const handleWebviewLoad = async () => {
      if (tabId === activeTabId) {
        try {
          const colors = await extractWebsiteColors(webview);
          setWebsiteColors(colors);
        } catch (error) {
          console.error('Error extracting colors on load:', error);
        }
      }
    };

    const handleWebviewTitleUpdate = (event: any) => {
      setTabs(prev => prev.map(tab => 
        tab.id === tabId 
          ? { ...tab, title: event.title, isLoading: false }
          : tab
      ));
    };

    const handleWebviewNavigate = async (event: any) => {
      setAddressBarValue(event.url);
      setTabs(prev => prev.map(tab => 
        tab.id === tabId 
          ? { ...tab, url: event.url, isLoading: true }
          : tab
      ));
    };

    webview.addEventListener('dom-ready', handleWebviewLoad);
    webview.addEventListener('page-title-updated', handleWebviewTitleUpdate);
    webview.addEventListener('will-navigate', handleWebviewNavigate);

    return () => {
      webview.removeEventListener('dom-ready', handleWebviewLoad);
      webview.removeEventListener('page-title-updated', handleWebviewTitleUpdate);
      webview.removeEventListener('will-navigate', handleWebviewNavigate);
    };
  };

  const handleNavigation = (url: string) => {
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    if (activeTab && activeTab.type === 'research') {
      const webview = webviewRefs.current[activeTabId];
      if (webview) {
        webview.src = url;
        setAddressBarValue(url);
        setTabs(prev => prev.map(tab => 
          tab.id === activeTabId 
            ? { ...tab, url, isLoading: true }
            : tab
        ));
      }
    }
  };

  const handleAddressBarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleNavigation(addressBarValue);
  };

  const goBack = () => {
    const webview = webviewRefs.current[activeTabId];
    if (webview) webview.goBack();
  };

  const goForward = () => {
    const webview = webviewRefs.current[activeTabId];
    if (webview) webview.goForward();
  };

  const reload = () => {
    const webview = webviewRefs.current[activeTabId];
    if (webview) webview.reload();
  };

  const goHome = () => {
    setActiveTabId('hub');
  };

  const addNewResearchPage = () => {
    const newTabId = `research-${Date.now()}`;
    const newTab: ResearchTab = {
      id: newTabId,
      title: 'New Research Page',
      url: 'https://www.google.com',
      isLoading: false,
      type: 'research',
      noteCount: 0,
      tags: [],
      collaborators: [],
      isStarred: false,
      isFlagged: false
    };
    
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTabId);
    setAddressBarValue('https://www.google.com');
  };

  const closeTab = (tabId: string) => {
    if (tabId === 'hub') return; // Can't close hub
    
    const webview = webviewRefs.current[tabId];
    if (webview && webview._cleanup) {
      webview._cleanup();
    }
    delete webviewRefs.current[tabId];
    
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    if (activeTabId === tabId) {
      setActiveTabId('hub');
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    handleNavigation,
    addNewResearchPage,
    reload,
    goHome,
  }));

  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const showNavigationControls = activeTab?.type === 'research';

  return (
    <div className="flex flex-col h-full overflow-hidden transition-all duration-300 rounded-xl">
      {/* Tab Bar */}
      <div className="flex relative transition-all duration-300 bg-gray-100 rounded-t-xl">
        <div className="flex flex-1 overflow-hidden relative">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToHorizontalAxis]}
          >
            <SortableContext
              items={tabs.map(tab => tab.id)}
              strategy={horizontalListSortingStrategy}
            >
              {tabs.map((tab) => (
                <SortableTab
                  key={tab.id}
                  tab={tab}
                  isActive={tab.id === activeTabId}
                  onTabClick={(tabId) => setActiveTabId(tabId)}
                  onTabClose={(tabId) => closeTab(tabId)}
                  canClose={tabs.length > 1}
                  websiteColors={websiteColors}
                />
              ))}
            </SortableContext>
          </DndContext>
          
          {/* New research page button */}
          <button
            onClick={addNewResearchPage}
            className="flex items-center justify-center w-8 h-8 ml-2 mt-1 rounded-full transition-colors flex-shrink-0 hover:bg-gray-200"
            title="New Research Page"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Navigation Bar - only show for research tabs */}
      {showNavigationControls && (
        <div 
          className="flex items-center p-3 space-x-2"
          style={{
            backgroundColor: websiteColors.background,
            borderBottom: 'none',
          }}
        >
          <div className="flex items-center space-x-1">
            <button
              onClick={goBack}
              className="p-2 rounded-lg transition-colors"
              style={{
                color: websiteColors.isDark ? '#ffffff' : websiteColors.text,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = websiteColors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goForward}
              className="p-2 rounded-lg transition-colors"
              style={{
                color: websiteColors.isDark ? '#ffffff' : websiteColors.text,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = websiteColors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Forward"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={reload}
              className="p-2 rounded-lg transition-colors"
              style={{
                color: websiteColors.isDark ? '#ffffff' : websiteColors.text,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = websiteColors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Reload"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={goHome}
              className="p-2 rounded-lg transition-colors"
              style={{
                color: websiteColors.isDark ? '#ffffff' : websiteColors.text,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = websiteColors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Workspace Hub"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>

          {/* Address Bar */}
          <form onSubmit={handleAddressBarSubmit} className="flex-1 group">
            <div className="relative w-full">
              <input
                type="text"
                value={addressBarValue}
                onChange={(e) => setAddressBarValue(e.target.value)}
                className="w-full px-4 py-2 bg-transparent border-0 rounded-full focus:outline-none text-sm transition-all duration-200 relative z-10"
                style={{
                  color: websiteColors.isDark ? '#ffffff' : websiteColors.text,
                  backgroundColor: 'transparent',
                }}
                placeholder="Search Google or type a URL"
              />
              <div 
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-200 pointer-events-none"
                style={{
                  backgroundColor: websiteColors.isDark 
                    ? 'rgba(255, 255, 255, 0.15)' 
                    : 'rgba(0, 0, 0, 0.08)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: websiteColors.isDark 
                    ? '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.1)' 
                    : '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(0, 0, 0, 0.05)',
                }}
              />
              <div 
                className="absolute inset-0 rounded-full opacity-0 focus-within:opacity-100 transition-all duration-200 pointer-events-none"
                style={{
                  boxShadow: `0 0 0 2px ${websiteColors.accent}40`,
                }}
              />
            </div>
          </form>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden rounded-b-xl">
        {/* Workspace Hub */}
        {activeTabId === 'hub' && (
          <WorkspaceHub 
            workspace={mockWorkspace} 
            onCreateResearchPage={addNewResearchPage}
          />
        )}
        
        {/* Research Page Webviews */}
        {tabs.filter(tab => tab.type === 'research').map((tab) => (
          <webview
            key={tab.id}
            ref={(el) => {
              if (el) {
                const webviewEl = el as WebviewElement;
                webviewRefs.current[tab.id] = webviewEl;
                const cleanup = setupWebviewListeners(tab.id, webviewEl);
                webviewEl._cleanup = cleanup;
              } else {
                const webview = webviewRefs.current[tab.id];
                if (webview && webview._cleanup) {
                  webview._cleanup();
                }
                delete webviewRefs.current[tab.id];
              }
            }}
            src={tab.url}
            className="absolute inset-0 w-full h-full rounded-b-xl"
            style={{
              visibility: tab.id === activeTabId ? 'visible' : 'hidden',
              zIndex: tab.id === activeTabId ? 1 : 0
            }}
          />
        ))}
      </div>
    </div>
  );
});

ResearchPages.displayName = 'ResearchPages';

export default ResearchPages; 