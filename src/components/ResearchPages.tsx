import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Home,
  Plus,
  X,
  Search,
  Settings,
  Users,
  Star,
  MoreHorizontal,
  ChevronDown,
  Brain,
  Sparkles,
  ExternalLink,
  StickyNote,
  MessageSquare,
  Calendar,
  Clock,
  Activity,
  FileText,
  Lightbulb,
  Target,
  Share2,
  Download,
  Edit3,
  Eye,
  Pin,
  Globe,
  Lock,
  Bookmark,
  History,
  Maximize2,
  Minimize2,
  RotateCcw,
  Shield,
  Zap,
  Filter,
  UserPlus,
  ChevronRight,
  Archive,
  Trash2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  currentPage?: string;
  lastActive: Date;
}

interface ResearchTab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isActive: boolean;
  isLoading: boolean;
  noteCount: number;
  collaborators: WorkspaceMember[];
  aiSummary?: string;
  canClose: boolean;
}

interface WorkspaceNote {
  id: string;
  content: string;
  author: WorkspaceMember;
  timestamp: Date;
  pageUrl?: string;
  tags: string[];
  isSticky: boolean;
}

interface AIInsight {
  id: string;
  type: 'summary' | 'suggestion' | 'alert' | 'discovery' | 'synthesis';
  content: string;
  confidence: number;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  relatedUrls?: string[];
}

interface Workspace {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: 'research' | 'planning' | 'client-review' | 'exploration' | 'custom';
  members: WorkspaceMember[];
  createdAt: Date;
  lastActivity: Date;
  isPinned: boolean;
  health: 'active' | 'idle' | 'messy' | 'archived';
}

const mockMembers: WorkspaceMember[] = [
  { 
    id: '1', 
    name: 'Sarah Chen', 
    email: 'sarah@team.com', 
    status: 'online', 
    currentPage: 'AI Research Hub',
    lastActive: new Date() 
  },
  { 
    id: '2', 
    name: 'Marcus Rodriguez', 
    email: 'marcus@team.com', 
    status: 'away', 
    currentPage: 'arXiv Papers',
    lastActive: new Date(Date.now() - 1000 * 60 * 30) 
  },
  { 
    id: '3', 
    name: 'Priya Patel', 
    email: 'priya@team.com', 
    status: 'online', 
    currentPage: 'Competitor Analysis',
    lastActive: new Date(Date.now() - 1000 * 60 * 15) 
  },
];

const mockWorkspace: Workspace = {
  id: '1',
  name: 'AI Product Research',
  emoji: '🧠',
  description: 'Deep dive into AI/ML product landscape and competitive analysis',
  category: 'research',
  members: mockMembers,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  lastActivity: new Date(Date.now() - 1000 * 60 * 30),
  isPinned: true,
  health: 'active'
};

const mockTabs: ResearchTab[] = [
  {
    id: 'hub',
    title: `${mockWorkspace.emoji} ${mockWorkspace.name}`,
    url: 'workspace://hub',
    isActive: true,
    isLoading: false,
    noteCount: 0,
    collaborators: mockMembers,
    canClose: false
  },
  {
    id: 'tab1',
    title: 'arXiv - AI/ML Papers',
    url: 'https://arxiv.org/list/cs.AI/recent',
    favicon: '📄',
    isActive: false,
    isLoading: false,
    noteCount: 15,
    collaborators: [mockMembers[0], mockMembers[1]],
    aiSummary: 'Recent breakthrough papers on transformer architectures and multimodal AI systems.',
    canClose: true
  },
  {
    id: 'tab2',
    title: 'OpenAI Research',
    url: 'https://openai.com/research',
    favicon: '🤖',
    isActive: false,
    isLoading: false,
    noteCount: 8,
    collaborators: [mockMembers[2]],
    aiSummary: 'Latest developments in GPT models and safety research.',
    canClose: true
  },
  {
    id: 'tab3',
    title: 'Anthropic Claude Research',
    url: 'https://anthropic.com/research',
    favicon: '🧠',
    isActive: false,
    isLoading: true,
    noteCount: 3,
    collaborators: [mockMembers[0]],
    aiSummary: 'Constitutional AI and safety-focused research approaches.',
    canClose: true
  }
];

const mockNotes: WorkspaceNote[] = [
  {
    id: 'n1',
    content: 'Key insight: Transformer attention mechanisms show 87% improvement in context understanding when combined with retrieval-augmented generation.',
    author: mockMembers[0],
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    pageUrl: 'https://arxiv.org/list/cs.AI/recent',
    tags: ['transformers', 'rag', 'performance'],
    isSticky: true
  },
  {
    id: 'n2',
    content: 'OpenAI\'s latest safety research suggests constitutional training reduces harmful outputs by 64% while maintaining capability.',
    author: mockMembers[1],
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    pageUrl: 'https://openai.com/research',
    tags: ['safety', 'alignment', 'training'],
    isSticky: false
  },
  {
    id: 'n3',
    content: 'Market analysis shows enterprise AI adoption accelerating 3x faster than predicted in Q3 forecasts.',
    author: mockMembers[2],
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    tags: ['market', 'enterprise', 'adoption'],
    isSticky: true
  }
];

const mockAIInsights: AIInsight[] = [
  {
    id: 'ai1',
    type: 'synthesis',
    content: 'Cross-referencing your research shows convergence on constitutional AI approaches across 3 major labs - suggest creating synthesis document.',
    confidence: 0.92,
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    priority: 'high',
    relatedUrls: ['https://openai.com/research', 'https://anthropic.com/research']
  },
  {
    id: 'ai2',
    type: 'discovery',
    content: 'Found 2 new papers citing your bookmarked transformer research - potential breakthrough in efficiency.',
    confidence: 0.88,
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    priority: 'high',
    relatedUrls: ['https://arxiv.org/list/cs.AI/recent']
  },
  {
    id: 'ai3',
    type: 'suggestion',
    content: 'Based on your note patterns, consider organizing findings into themes: Safety, Performance, Enterprise Adoption.',
    confidence: 0.75,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    priority: 'medium'
  }
];

function BrowserControls({ activeTab, onRefresh, onNavigate }: {
  activeTab: ResearchTab;
  onRefresh: () => void;
  onNavigate: (direction: 'back' | 'forward') => void;
}) {
  return (
    <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onNavigate('back')}>
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onNavigate('forward')}>
          <ArrowRight className="h-4 w-4 text-gray-500" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onRefresh}>
          <RefreshCw className={`h-4 w-4 text-gray-500 ${activeTab.isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      <Separator orientation="vertical" className="h-5" />
      
      <div className="flex-1 flex items-center space-x-2">
        {activeTab.url !== 'workspace://hub' && (
          <>
            <div className="flex items-center space-x-1 text-green-600">
              <Shield className="h-3 w-3" />
              <Lock className="h-3 w-3" />
            </div>
            <div className="flex-1 bg-white border border-gray-200 rounded px-3 py-1 text-sm text-gray-700">
              {activeTab.url}
            </div>
          </>
        )}
        {activeTab.url === 'workspace://hub' && (
          <div className="flex items-center space-x-2 text-blue-600">
            <Home className="h-4 w-4" />
            <span className="text-sm font-medium">Workspace Hub</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <Bookmark className="h-4 w-4 text-gray-500" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <Settings className="h-4 w-4 text-gray-500" />
        </Button>
      </div>
    </div>
  );
}

function TabBar({ tabs, activeTabId, onTabSelect, onTabClose, onNewTab }: {
  tabs: ResearchTab[];
  activeTabId: string;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
}) {
  return (
    <div className="flex items-center bg-gray-100 border-b border-gray-200">
      <div className="flex-1 flex items-center overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => onTabSelect(tab.id)}
            className={`flex items-center space-x-2 px-3 py-2 min-w-0 max-w-64 cursor-pointer border-r border-gray-200 transition-colors group ${
              tab.isActive 
                ? 'bg-white text-gray-900' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              {tab.isLoading ? (
                <RefreshCw className="h-3 w-3 animate-spin flex-shrink-0" />
              ) : (
                <span className="text-sm flex-shrink-0">
                  {tab.url === 'workspace://hub' ? tab.title.split(' ')[0] : tab.favicon || '🌐'}
                </span>
              )}
              <span className="text-sm truncate">
                {tab.url === 'workspace://hub' 
                  ? tab.title.split(' ').slice(1).join(' ')
                  : tab.title
                }
              </span>
              {tab.noteCount > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-xs">
                  {tab.noteCount}
                </Badge>
              )}
            </div>
            
            {tab.canClose && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0 m-1"
        onClick={onNewTab}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

function WorkspaceHub({ workspace, notes, aiInsights, members }: {
  workspace: Workspace;
  notes: WorkspaceNote[];
  aiInsights: AIInsight[];
  members: WorkspaceMember[];
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

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'synthesis': return <Lightbulb className="h-4 w-4 text-purple-600" />;
      case 'discovery': return <Sparkles className="h-4 w-4 text-blue-600" />;
      case 'suggestion': return <Target className="h-4 w-4 text-green-600" />;
      case 'alert': return <Zap className="h-4 w-4 text-orange-600" />;
      default: return <Brain className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">{workspace.emoji}</div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{workspace.name}</h1>
                <p className="text-gray-600">{workspace.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Active Members */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Active now:</span>
            <div className="flex items-center space-x-3">
              {members.filter(m => m.status === 'online').map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <div className="relative">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="text-xs bg-gray-200">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 bg-green-400 rounded-full border border-white" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">{member.name}</span>
                    {member.currentPage && (
                      <div className="text-xs text-gray-500">on {member.currentPage}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Insights */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">AI Insights</h3>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View All
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {aiInsights.slice(0, 3).map((insight) => (
                    <div key={insight.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 mt-0.5">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="secondary" className="text-xs capitalize">
                            {insight.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {Math.round(insight.confidence * 100)}% confidence
                          </span>
                        </div>
                        <p className="text-sm text-gray-800">{insight.content}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTime(insight.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Recent Notes */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <StickyNote className="h-5 w-5 text-yellow-600" />
                    <h3 className="font-semibold text-gray-900">Recent Notes</h3>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    New Note
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className={`p-3 rounded-lg border ${
                      note.isSticky ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={note.author.avatar} />
                            <AvatarFallback className="text-xs">
                              {note.author.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-gray-900">{note.author.name}</span>
                          {note.isSticky && <Pin className="h-3 w-3 text-yellow-600" />}
                        </div>
                        <span className="text-xs text-gray-500">{formatTime(note.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-800 mb-2">{note.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          {note.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        {note.pageUrl && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <ExternalLink className="h-3 w-3" />
                            <span>Research Page</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  New Research Page
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Summary
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Archive className="h-4 w-4 mr-2" />
                  Export Research
                </Button>
              </div>
            </div>
            
            {/* Workspace Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Workspace Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Research Pages</span>
                  <span className="text-sm font-medium text-gray-900">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Notes</span>
                  <span className="text-sm font-medium text-gray-900">{notes.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI Insights</span>
                  <span className="text-sm font-medium text-gray-900">{aiInsights.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Members</span>
                  <span className="text-sm font-medium text-gray-900">
                    {members.filter(m => m.status === 'online').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WebPageView({ tab }: { tab: ResearchTab }) {
  return (
    <div className="h-full bg-white flex items-center justify-center">
      <div className="text-center">
        <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{tab.title}</h3>
        <p className="text-gray-500 mb-4">Web content would load here</p>
        <div className="text-sm text-gray-400">{tab.url}</div>
        {tab.aiSummary && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 max-w-md">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">AI Summary</span>
            </div>
            <p className="text-sm text-blue-700">{tab.aiSummary}</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface ResearchPagesProps {
  workspaceId: string;
  onBack: () => void;
}

export default function ResearchPages({ workspaceId, onBack }: ResearchPagesProps) {
  const [tabs, setTabs] = useState<ResearchTab[]>(mockTabs);
  const [activeTabId, setActiveTabId] = useState('hub');
  
  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];

  const handleTabSelect = (tabId: string) => {
    setTabs(prev => prev.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    })));
    setActiveTabId(tabId);
  };

  const handleTabClose = (tabId: string) => {
    const tabToClose = tabs.find(tab => tab.id === tabId);
    if (!tabToClose?.canClose) return;
    
    setTabs(prev => {
      const filtered = prev.filter(tab => tab.id !== tabId);
      // If closing active tab, switch to hub
      if (tabId === activeTabId) {
        setActiveTabId('hub');
        return filtered.map(tab => ({
          ...tab,
          isActive: tab.id === 'hub'
        }));
      }
      return filtered;
    });
  };

  const handleNewTab = () => {
    const newTab: ResearchTab = {
      id: `tab-${Date.now()}`,
      title: 'New Research Page',
      url: 'about:blank',
      favicon: '🌐',
      isActive: false,
      isLoading: false,
      noteCount: 0,
      collaborators: [],
      canClose: true
    };
    
    setTabs(prev => [...prev, newTab]);
    handleTabSelect(newTab.id);
  };

  const handleRefresh = () => {
    if (activeTab.url !== 'workspace://hub') {
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, isLoading: true }
          : tab
      ));
      
      // Simulate loading
      setTimeout(() => {
        setTabs(prev => prev.map(tab => 
          tab.id === activeTabId 
            ? { ...tab, isLoading: false }
            : tab
        ));
      }, 1000);
    }
  };

  const handleNavigate = (direction: 'back' | 'forward') => {
    // Browser navigation logic would go here
    console.log(`Navigate ${direction}`);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Window Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workspaces
          </Button>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Minimize2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Maximize2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {/* Tab Bar */}
      <TabBar 
        tabs={tabs}
        activeTabId={activeTabId}
        onTabSelect={handleTabSelect}
        onTabClose={handleTabClose}
        onNewTab={handleNewTab}
      />
      
      {/* Browser Controls */}
      <BrowserControls 
        activeTab={activeTab}
        onRefresh={handleRefresh}
        onNavigate={handleNavigate}
      />
      
      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab.url === 'workspace://hub' ? (
          <WorkspaceHub 
            workspace={mockWorkspace}
            notes={mockNotes}
            aiInsights={mockAIInsights}
            members={mockMembers}
          />
        ) : (
          <WebPageView tab={activeTab} />
        )}
      </div>
    </div>
  );
} 