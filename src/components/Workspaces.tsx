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

function WorkspaceCard({ workspace, onClick }: { workspace: Workspace; onClick: (workspaceId: string) => void }) {
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
      case 'active': return 'text-green-600 bg-green-50 border-green-100';
      case 'idle': return 'text-yellow-600 bg-yellow-50 border-yellow-100';
      case 'messy': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'archived': return 'text-gray-600 bg-gray-50 border-gray-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const getPriorityInsight = () => {
    return workspace.aiInsights.find(insight => insight.priority === 'high') || workspace.aiInsights[0];
  };

  const mostActiveResearchPage = workspace.researchPages.find(page => page.isActive) || workspace.researchPages[0];

  // Mock deadline - in real app this would come from workspace data
  const deadline = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days from now
  const formatDeadline = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      onClick={() => onClick(workspace.id)}
      className="bg-white border border-gray-100 rounded-lg p-4 hover:bg-gray-25/50 transition-all duration-200 cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="text-xl">{workspace.emoji}</div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900 text-sm">
                {workspace.name}
              </h3>
              {workspace.isPinned && <Pin className="h-3 w-3 text-gray-400" />}
            </div>
            <p className="text-xs text-gray-600 line-clamp-1">{workspace.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`text-xs px-2 py-1 rounded-full border ${getHealthColor(workspace.health)}`}>
            {workspace.health}
          </span>
          <button className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 rounded-md">
            <MoreHorizontal className="h-3 w-3 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Progress Summary */}
      {getPriorityInsight() && (
        <div className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-100">
          <div className="flex items-start space-x-2">
            <div className="h-4 w-4 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs">📊</span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Progress Summary</p>
              <p className="text-xs text-gray-600 leading-relaxed">{getPriorityInsight()?.content}</p>
            </div>
          </div>
        </div>
      )}

      {/* Latest Pages */}
      {mostActiveResearchPage && (
        <div className="mb-3 p-3 bg-gray-25 rounded-md">
          <div className="flex items-center space-x-2 mb-2">
            <ExternalLink className="h-3 w-3 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">Latest Pages</span>
            {mostActiveResearchPage.isActive && (
              <div className="h-1.5 w-1.5 bg-green-400 rounded-full"></div>
            )}
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-gray-800 line-clamp-1">
              {mostActiveResearchPage.title}
            </h4>
            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
              {mostActiveResearchPage.aiSummary}
            </p>
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <StickyNote className="h-3 w-3" />
                <span>{mostActiveResearchPage.noteCount}</span>
              </span>
              <span>{formatTime(mostActiveResearchPage.lastVisited)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">{workspace.researchPages.length}</div>
          <div className="text-xs text-gray-500">Pages</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">{workspace.members.length}</div>
          <div className="text-xs text-gray-500">Collaborators</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">{formatDeadline(deadline)}</div>
          <div className="text-xs text-gray-500">Deadline</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-1">
            {workspace.members.slice(0, 3).map((member) => (
              <div key={member.id} className="relative">
                <div className="h-5 w-5 rounded-full bg-gray-100 border border-white flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full border border-white ${
                  member.status === 'online' ? 'bg-green-400' :
                  member.status === 'away' ? 'bg-yellow-400' :
                  member.status === 'busy' ? 'bg-red-400' : 'bg-gray-400'
                }`} />
              </div>
            ))}
            {workspace.members.length > 3 && (
              <div className="h-5 w-5 bg-gray-50 border border-white rounded-full flex items-center justify-center">
                <span className="text-xs text-gray-500">+{workspace.members.length - 3}</span>
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500">{formatTime(workspace.lastActivity)}</span>
        </div>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 hover:bg-gray-50 rounded-md transition-colors">
            <Eye className="h-3 w-3 text-gray-400" />
          </button>
          <button className="p-1.5 hover:bg-gray-50 rounded-md transition-colors">
            <Share2 className="h-3 w-3 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Workspaces({ onOpenWorkspace }: { onOpenWorkspace?: (workspaceId: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredWorkspaces = mockWorkspaces.filter(workspace => {
    return workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           workspace.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortedWorkspaces = [...filteredWorkspaces].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.lastActivity.getTime() - a.lastActivity.getTime();
  });

  return (
    <div className="flex h-full bg-white overflow-hidden rounded-xl">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-50 bg-white rounded-t-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-medium text-gray-900">Workspaces</h1>
              <p className="text-sm text-gray-600 mt-1">
                AI-augmented environments for deep work and collaboration
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  placeholder="Search workspaces..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-9 pr-3 py-2 bg-gray-50 border-0 rounded-md text-sm placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-200 transition-all"
                />
              </div>
              
              <div className="flex items-center space-x-1">
                <button className="p-2 hover:bg-gray-50 rounded-md transition-colors">
                  <Filter className="h-4 w-4 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-50 rounded-md transition-colors">
                  <Grid3x3 className="h-4 w-4 text-gray-400" />
                </button>
              </div>

              <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                <Plus className="h-4 w-4 mr-2 inline" />
                New Workspace
              </button>
            </div>
          </div>
        </div>
        
        {/* Workspaces Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {sortedWorkspaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedWorkspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  onClick={(workspaceId) => onOpenWorkspace?.(workspaceId)}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No workspaces found</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {searchQuery ? 'Try adjusting your search terms' : 'Create your first intelligent workspace'}
                </p>
                {!searchQuery && (
                  <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    <Plus className="h-4 w-4 mr-2 inline" />
                    Create Workspace
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 