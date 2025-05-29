import React, { useState, useRef, useEffect } from 'react';
import { 
  Folder,
  Plus,
  Search,
  Settings,
  Users,
  Calendar,
  Clock,
  Star,
  MoreHorizontal,
  ChevronRight,
  Building2,
  UserPlus,
  Filter,
  Grid3x3,
  List,
  Eye,
  Edit3,
  Trash2,
  Copy,
  Share2,
  Lock,
  Globe,
  Crown,
  User,
  Activity,
  FileText,
  MessageSquare,
  Video,
  Image as ImageIcon,
  Download,
  Brain,
  Zap,
  Target,
  Layers,
  ExternalLink,
  BookOpen,
  Lightbulb,
  TrendingUp,
  Timer,
  Sparkles,
  ChevronDown,
  Pin,
  History,
  Focus,
  StickyNote,
  ArrowRight,
  Cpu,
  Workflow
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

interface ResearchPage {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  noteCount: number;
  aiSummary: string;
  lastVisited: Date;
  isActive: boolean;
  tags: string[];
  collaborators: WorkspaceMember[];
}

interface AIInsight {
  id: string;
  type: 'summary' | 'suggestion' | 'alert' | 'discovery';
  content: string;
  confidence: number;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
}

interface Workspace {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: 'research' | 'planning' | 'client-review' | 'exploration' | 'custom';
  members: WorkspaceMember[];
  researchPages: ResearchPage[];
  aiInsights: AIInsight[];
  createdAt: Date;
  lastActivity: Date;
  isPinned: boolean;
  health: 'active' | 'idle' | 'messy' | 'archived';
  totalTabs: number;
  totalNotes: number;
  weeklyActivity: number;
}

const mockMembers: WorkspaceMember[] = [
  { 
    id: '1', 
    name: 'Sarah Chen', 
    email: 'sarah@team.com', 
    status: 'online', 
    currentPage: 'AI Research Findings',
    lastActive: new Date() 
  },
  { 
    id: '2', 
    name: 'Marcus Rodriguez', 
    email: 'marcus@team.com', 
    status: 'away', 
    currentPage: 'Competitor Analysis',
    lastActive: new Date(Date.now() - 1000 * 60 * 30) 
  },
  { 
    id: '3', 
    name: 'Priya Patel', 
    email: 'priya@team.com', 
    status: 'online', 
    currentPage: 'User Research',
    lastActive: new Date(Date.now() - 1000 * 60 * 15) 
  },
];

const mockWorkspaces: Workspace[] = [
  {
    id: '1',
    name: 'AI Product Research',
    emoji: '🧠',
    description: 'Deep dive into AI/ML product landscape and competitive analysis',
    category: 'research',
    members: mockMembers.slice(0, 3),
    researchPages: [
      {
        id: 'p1',
        title: 'AI Research Findings',
        url: 'https://papers.arxiv.org/ai-trends',
        favicon: '📄',
        noteCount: 23,
        aiSummary: 'Key insights about transformer architectures and their applications in product development.',
        lastVisited: new Date(Date.now() - 1000 * 60 * 30),
        isActive: true,
        tags: ['ai', 'research', 'transformers'],
        collaborators: [mockMembers[0], mockMembers[2]]
      },
      {
        id: 'p2',
        title: 'Competitor Analysis',
        url: 'https://openai.com/research',
        favicon: '🔍',
        noteCount: 15,
        aiSummary: 'Comprehensive analysis of OpenAI, Anthropic, and Google AI product strategies.',
        lastVisited: new Date(Date.now() - 1000 * 60 * 60 * 2),
        isActive: false,
        tags: ['competitors', 'analysis', 'strategy'],
        collaborators: [mockMembers[1]]
      }
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    lastActivity: new Date(Date.now() - 1000 * 60 * 30),
    isPinned: true,
    health: 'active',
    totalTabs: 47,
    totalNotes: 38,
    weeklyActivity: 89
  },
  {
    id: '2',
    name: 'Q4 Strategy Planning',
    emoji: '📊',
    description: 'Collaborative planning for Q4 product roadmap and market positioning',
    category: 'planning',
    members: mockMembers.slice(0, 2),
    researchPages: [
      {
        id: 'p3',
        title: 'Market Analysis Dashboard',
        url: 'https://analytics.internal.com/q4-data',
        favicon: '📈',
        noteCount: 12,
        aiSummary: 'Q4 market trends show 34% growth in AI adoption across enterprise segment.',
        lastVisited: new Date(Date.now() - 1000 * 60 * 60),
        isActive: false,
        tags: ['strategy', 'market', 'q4'],
        collaborators: [mockMembers[0], mockMembers[1]]
      }
    ],
    aiInsights: [
      {
        id: 'i3',
        type: 'summary',
        content: 'Key takeaway: Focus on enterprise AI tools shows highest ROI potential for Q4',
        confidence: 0.88,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        priority: 'high'
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    lastActivity: new Date(Date.now() - 1000 * 60 * 60),
    isPinned: false,
    health: 'active',
    totalTabs: 23,
    totalNotes: 19,
    weeklyActivity: 67
  },
  {
    id: '3',
    name: 'User Research Synthesis',
    emoji: '👥',
    description: 'Consolidating user interviews and behavioral data into actionable insights',
    category: 'research',
    members: [mockMembers[2]],
    researchPages: [
      {
        id: 'p4',
        title: 'User Interview Notes',
        url: 'https://notion.so/user-interviews-q3',
        favicon: '📝',
        noteCount: 31,
        aiSummary: 'Users consistently mention need for better collaboration tools in research workflows.',
        lastVisited: new Date(Date.now() - 1000 * 60 * 60 * 4),
        isActive: false,
        tags: ['users', 'interviews', 'insights'],
        collaborators: [mockMembers[2]]
      }
    ],
    aiInsights: [
      {
        id: 'i4',
        type: 'alert',
        content: 'This workspace has been idle for 4 hours - consider reviewing or archiving',
        confidence: 0.75,
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        priority: 'low'
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 4),
    isPinned: false,
    health: 'idle',
    totalTabs: 8,
    totalNotes: 31,
    weeklyActivity: 23
  }
];

function WorkspacesSidebar({ 
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange
}: { 
  viewMode: 'grid' | 'timeline' | 'focus';
  onViewModeChange: (mode: 'grid' | 'timeline' | 'focus') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}) {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Workspaces</h2>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Settings className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
        
        {/* New Workspace Button */}
        <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Workspace
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search workspaces..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-white border-gray-200 h-8 text-sm"
          />
        </div>
      </div>

      {/* View Modes */}
      <div className="p-3 border-b border-gray-200">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">View</div>
        <div className="space-y-1">
          <button 
            onClick={() => onViewModeChange('grid')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
              viewMode === 'grid' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Grid3x3 className="h-4 w-4" />
            <span>Grid</span>
          </button>
          
          <button 
            onClick={() => onViewModeChange('timeline')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
              viewMode === 'timeline' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Timeline</span>
          </button>
          
          <button 
            onClick={() => onViewModeChange('focus')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
              viewMode === 'focus' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Target className="h-4 w-4" />
            <span>Focus</span>
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Filter</div>
          
          <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200">
            <div className="flex items-center space-x-3">
              <Pin className="h-4 w-4 text-gray-500" />
              <span>Pinned</span>
            </div>
            <span className="text-xs text-gray-500">1</span>
          </button>
          
          <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200">
            <div className="flex items-center space-x-3">
              <Activity className="h-4 w-4 text-gray-500" />
              <span>Active</span>
            </div>
            <span className="text-xs text-gray-500">2</span>
          </button>
          
          <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200">
            <div className="flex items-center space-x-3">
              <Brain className="h-4 w-4 text-gray-500" />
              <span>AI Insights</span>
            </div>
            <span className="text-xs text-gray-500">5</span>
          </button>
          
          <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200">
            <div className="flex items-center space-x-3">
              <Users className="h-4 w-4 text-gray-500" />
              <span>Collaborative</span>
            </div>
            <span className="text-xs text-gray-500">2</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkspaceCard({ workspace, onClick }: { workspace: Workspace; onClick: () => void }) {
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

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'idle': return 'text-yellow-600 bg-yellow-50';
      case 'messy': return 'text-orange-600 bg-orange-50';
      case 'archived': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityInsight = () => {
    return workspace.aiInsights.find(insight => insight.priority === 'high') || workspace.aiInsights[0];
  };

  const mostActiveResearchPage = workspace.researchPages.find(page => page.isActive) || workspace.researchPages[0];

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-blue-200 group relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{workspace.emoji}</div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                {workspace.name}
              </h3>
              {workspace.isPinned && <Pin className="h-3 w-3 text-yellow-500" />}
            </div>
            <p className="text-sm text-gray-600 line-clamp-1">{workspace.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge className={`text-xs ${getHealthColor(workspace.health)}`}>
            {workspace.health}
          </Badge>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </Button>
        </div>
      </div>

      {/* AI Insight */}
      {getPriorityInsight() && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start space-x-2">
            <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800 font-medium mb-1">AI Insight</p>
              <p className="text-sm text-blue-700">{getPriorityInsight()?.content}</p>
            </div>
          </div>
        </div>
      )}

      {/* Most Active Research Page */}
      {mostActiveResearchPage && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <ExternalLink className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">Latest Research Page</span>
              {mostActiveResearchPage.isActive && (
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-800 line-clamp-1">
              {mostActiveResearchPage.title}
            </h4>
            <p className="text-xs text-gray-600 line-clamp-2">
              {mostActiveResearchPage.aiSummary}
            </p>
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <StickyNote className="h-3 w-3" />
                <span>{mostActiveResearchPage.noteCount} notes</span>
              </span>
              <span>{formatTime(mostActiveResearchPage.lastVisited)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{workspace.researchPages.length}</div>
          <div className="text-xs text-gray-500">Pages</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{workspace.totalNotes}</div>
          <div className="text-xs text-gray-500">Notes</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{workspace.weeklyActivity}%</div>
          <div className="text-xs text-gray-500">Activity</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {workspace.members.slice(0, 3).map((member) => (
              <div key={member.id} className="relative">
                <Avatar className="h-6 w-6 border-2 border-white">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-xs bg-gray-200">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white ${
                  member.status === 'online' ? 'bg-green-400' :
                  member.status === 'away' ? 'bg-yellow-400' :
                  member.status === 'busy' ? 'bg-red-400' : 'bg-gray-400'
                }`} />
              </div>
            ))}
            {workspace.members.length > 3 && (
              <div className="h-6 w-6 bg-gray-100 border-2 border-white rounded-full flex items-center justify-center">
                <span className="text-xs text-gray-600">+{workspace.members.length - 3}</span>
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500">Updated {formatTime(workspace.lastActivity)}</span>
        </div>
        
        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
      </div>

      {/* Quick Actions Overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-white border-t border-gray-100 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <Eye className="h-3 w-3 mr-1" />
              Peek
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              New Page
            </Button>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <Share2 className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <Brain className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Workspaces() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'focus'>('grid');
  
  const filteredWorkspaces = mockWorkspaces.filter(workspace => {
    const matchesSearch = workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workspace.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (viewMode === 'focus') {
      return matchesSearch && (workspace.isPinned || workspace.health === 'active');
    }
    
    return matchesSearch;
  });

  const sortedWorkspaces = [...filteredWorkspaces].sort((a, b) => {
    if (viewMode === 'timeline') {
      return b.lastActivity.getTime() - a.lastActivity.getTime();
    }
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.lastActivity.getTime() - a.lastActivity.getTime();
  });

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <WorkspacesSidebar 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Research Workspaces</h1>
              <p className="text-gray-600 mt-1">
                AI-augmented environments for deep work and collaboration
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Cpu className="h-4 w-4" />
                <span>5 AI insights waiting</span>
              </div>
              <Button variant="outline" size="sm">
                <Workflow className="h-4 w-4 mr-2" />
                Templates
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Workspace
              </Button>
            </div>
          </div>
        </div>
        
        {/* Workspaces Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {sortedWorkspaces.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4 max-w-4xl'
            }>
              {sortedWorkspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  onClick={() => console.log('Open workspace:', workspace.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No workspaces found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery ? 'Try adjusting your search terms' : 'Create your first intelligent workspace'}
                </p>
                {!searchQuery && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Workspace
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 