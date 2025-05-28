import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Home, 
  Plus,
  X,
  Globe
} from 'lucide-react';
import { SidebarTrigger } from "@/components/ui/sidebar";
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

interface Tab {
  id: string;
  title: string;
  url: string;
  isLoading: boolean;
}

export interface BrowserRef {
  handleNavigation: (url: string) => void;
  addNewTab: () => void;
  reload: () => void;
  goHome: () => void;
}

// Extend HTMLElement to include our custom cleanup property
interface WebviewElement extends HTMLElement {
  src: string;
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
  addEventListener: (event: string, handler: (event: any) => void) => void;
  removeEventListener: (event: string, handler: (event: any) => void) => void;
  _cleanup?: () => void;
}

// Sortable Tab Component
interface SortableTabProps {
  tab: Tab;
  isActive: boolean;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  canClose: boolean;
}

function SortableTab({ tab, isActive, onTabClick, onTabClose, canClose }: SortableTabProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative flex items-center px-4 py-2 cursor-pointer min-w-0 max-w-sm transition-all duration-200 ${
        isActive 
          ? 'bg-white z-10' 
          : 'bg-gray-100 hover:bg-gray-200'
      } ${isDragging ? 'opacity-50 z-50' : ''}`}
      onClick={() => onTabClick(tab.id)}
    >
      <Globe className="w-4 h-4 mr-2 flex-shrink-0 text-gray-500" />
      <span className={`truncate text-sm font-medium ${
        isActive ? 'text-gray-900' : 'text-gray-600'
      }`}>
        {tab.title}
      </span>
      {canClose && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTabClose(tab.id);
          }}
          className="ml-2 p-1 hover:bg-gray-300 rounded-full transition-colors"
        >
          <X className="w-3 h-3 text-gray-500" />
        </button>
      )}
    </div>
  );
}

const Browser = forwardRef<BrowserRef>((props, ref) => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'New Tab', url: 'https://www.google.com', isLoading: false }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [addressBarValue, setAddressBarValue] = useState('https://www.google.com');
  // Store refs for all webviews
  const webviewRefs = useRef<{ [key: string]: WebviewElement }>({});

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  // Handle drag end for tab reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setTabs((tabs) => {
        const oldIndex = tabs.findIndex((tab) => tab.id === active.id);
        const newIndex = tabs.findIndex((tab) => tab.id === over?.id);

        return arrayMove(tabs, oldIndex, newIndex);
      });
    }
  };

  useEffect(() => {
    if (activeTab) {
      setAddressBarValue(activeTab.url);
    }
  }, [activeTab]);

  // Set up webview event listeners for a specific tab
  const setupWebviewListeners = (tabId: string, webview: WebviewElement) => {
    if (!webview) return;

    const handleWebviewLoad = () => {
      setTabs(tabs => tabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, isLoading: false }
          : tab
      ));
    };

    const handleWebviewTitleUpdate = (event: any) => {
      setTabs(tabs => tabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, title: event.title || 'Untitled' }
          : tab
      ));
    };

    const handleWebviewNavigate = (event: any) => {
      // Only update address bar if this is the active tab
      if (tabId === activeTabId) {
        setAddressBarValue(event.url);
      }
      setTabs(tabs => tabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, url: event.url }
          : tab
      ));
    };

    // Add event listeners
    webview.addEventListener('did-finish-load', handleWebviewLoad);
    webview.addEventListener('page-title-updated', handleWebviewTitleUpdate);
    webview.addEventListener('did-navigate', handleWebviewNavigate);

    // Store cleanup function
    return () => {
      webview.removeEventListener('did-finish-load', handleWebviewLoad);
      webview.removeEventListener('page-title-updated', handleWebviewTitleUpdate);
      webview.removeEventListener('did-navigate', handleWebviewNavigate);
    };
  };

  const handleNavigation = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    setTabs(tabs.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, url, isLoading: true }
        : tab
    ));
    setAddressBarValue(url);
    
    const activeWebview = webviewRefs.current[activeTabId];
    if (activeWebview) {
      activeWebview.src = url;
    }
  };

  const handleAddressBarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleNavigation(addressBarValue);
  };

  const goBack = () => {
    const activeWebview = webviewRefs.current[activeTabId];
    if (activeWebview) {
      activeWebview.goBack();
    }
  };

  const goForward = () => {
    const activeWebview = webviewRefs.current[activeTabId];
    if (activeWebview) {
      activeWebview.goForward();
    }
  };

  const reload = () => {
    const activeWebview = webviewRefs.current[activeTabId];
    if (activeWebview) {
      activeWebview.reload();
    }
  };

  const goHome = () => {
    handleNavigation('https://www.google.com');
  };

  const addNewTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      title: 'New Tab',
      url: 'https://www.google.com',
      isLoading: false
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return; // Don't close the last tab
    
    // Clean up webview ref
    delete webviewRefs.current[tabId];
    
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id);
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    handleNavigation,
    addNewTab,
    reload,
    goHome,
  }));

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background rounded-xl">
      {/* Tab Bar */}
      <div className="flex bg-gray-100 relative">
        {/* Sidebar trigger area */}
        <div className="flex items-center justify-center w-12 bg-gray-100">
          <SidebarTrigger className="p-2 hover:bg-gray-200 rounded-lg transition-colors" />
        </div>
        
        {/* Tabs container */}
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
              {tabs.map((tab, index) => (
                <SortableTab
                  key={tab.id}
                  tab={tab}
                  isActive={tab.id === activeTabId}
                  onTabClick={(tabId) => setActiveTabId(tabId)}
                  onTabClose={(tabId) => closeTab(tabId)}
                  canClose={tabs.length > 1}
                />
              ))}
            </SortableContext>
          </DndContext>
          
          {/* New tab button */}
          <button
            onClick={addNewTab}
            className="flex items-center justify-center w-8 h-8 ml-2 mt-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
            title="New Tab"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center p-3 bg-white space-x-2">
        <div className="flex items-center space-x-1">
          <button
            onClick={goBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={goForward}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Forward"
          >
            <ArrowRight className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={reload}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Reload"
          >
            <RotateCcw className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={goHome}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Home"
          >
            <Home className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Address Bar */}
        <form onSubmit={handleAddressBarSubmit} className="flex-1">
          <input
            type="text"
            value={addressBarValue}
            onChange={(e) => setAddressBarValue(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all text-sm"
            placeholder="Search Google or type a URL"
          />
        </form>
      </div>

      {/* Web Content - Multiple webviews, one for each tab */}
      <div className="flex-1 relative">
        {tabs.map((tab) => (
          <webview
            key={tab.id}
            ref={(el) => {
              if (el) {
                const webviewEl = el as WebviewElement;
                webviewRefs.current[tab.id] = webviewEl;
                // Set up listeners when webview is mounted
                const cleanup = setupWebviewListeners(tab.id, webviewEl);
                // Store cleanup function for later use
                webviewEl._cleanup = cleanup;
              } else {
                // Clean up when webview is unmounted
                const webview = webviewRefs.current[tab.id];
                if (webview && webview._cleanup) {
                  webview._cleanup();
                }
                delete webviewRefs.current[tab.id];
              }
            }}
            src={tab.url}
            className="absolute inset-0 w-full h-full"
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

Browser.displayName = 'Browser';

export default Browser;