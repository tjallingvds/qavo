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
  Zap
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

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
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
            <Button onClick={onCreateResearchPage}>
              <Plus className="h-4 w-4 mr-2" />
              New Research Page
            </Button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-lg font-semibold text-gray-900">{workspace.totalNotes}</div>
                <div className="text-xs text-gray-600">Total Notes</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-lg font-semibold text-gray-900">{workspace.members.length}</div>
                <div className="text-xs text-gray-600">Members</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-lg font-semibold text-gray-900">{workspace.weeklyActivity}%</div>
                <div className="text-xs text-gray-600">Activity</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-lg font-semibold text-gray-900">{workspace.aiInsights.length}</div>
                <div className="text-xs text-gray-600">AI Insights</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Insights */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">AI Insights</h3>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {workspace.aiInsights.map((insight) => (
                  <div key={insight.id} className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {insight.type}
                      </Badge>
                      <span className="text-xs text-gray-500">{formatTime(insight.timestamp)}</span>
                    </div>
                    <p className="text-sm text-blue-800">{insight.content}</p>
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="w-full bg-blue-200 rounded-full h-1">
                        <div 
                          className="bg-blue-600 h-1 rounded-full" 
                          style={{width: `${insight.confidence * 100}%`}}
                        ></div>
                      </div>
                      <span className="text-xs text-blue-600">{Math.round(insight.confidence * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Team Members */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Team Members</h3>
              </div>
              <div className="p-4 space-y-3">
                {workspace.members.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-xs bg-gray-200">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                        member.status === 'online' ? 'bg-green-400' :
                        member.status === 'away' ? 'bg-yellow-400' :
                        member.status === 'busy' ? 'bg-red-400' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.currentPage}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-4 space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={onCreateResearchPage}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Research Page
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Summary
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Archive className="h-4 w-4 mr-2" />
                  Export Notes
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Workspace Settings
                </Button>
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