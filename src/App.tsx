import React from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import Browser, { BrowserRef } from './components/Browser'
import Chat from './components/Chat'
import Email from './components/Email'
import Dashboard from './components/Dashboard'
import Workspaces from './components/Workspaces'
import ResearchPages from './components/ResearchPages'
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"
import './App.css'
import { useRef, useState, useEffect } from 'react'

// Page Components
function DashboardPage() {
  return <Dashboard />;
}

function WorkspacesPage({ onOpenWorkspace }: { onOpenWorkspace: (workspaceId: string) => void }) {
  return <Workspaces onOpenWorkspace={onOpenWorkspace} />;
}

function ChatPage() {
  return <Chat />;
}

function EmailPage() {
  return <Email />;
}

function AIAgentsPage() {
  return (
    <div className="flex flex-1 items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-dark-text mb-2">AI Agents</h1>
        <p className="text-sidebar-text">AI Agents content will go here</p>
      </div>
    </div>
  );
}

function NotesPage() {
  return (
    <div className="flex flex-1 items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-dark-text mb-2">Notes</h1>
        <p className="text-sidebar-text">Notes content will go here</p>
      </div>
    </div>
  );
}

function ResearchPagesPage({ workspaceId }: { workspaceId?: string }) {
  return <ResearchPages workspaceId={workspaceId} />;
}

export type PageType = 'dashboard' | 'workspaces' | 'chat' | 'email' | 'ai-agents' | 'notes' | 'browser' | 'research-pages';

function AppContent() {
  const browserRef = useRef<BrowserRef>(null);
  const { setOpen, open } = useSidebar();
  const [isPinned, setIsPinned] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverDisabled, setHoverDisabled] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('chat');
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | undefined>();
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  // Listen for browser reload message from main process
  useEffect(() => {
    const handleBrowserReload = () => {
      if (browserRef.current && currentPage === 'browser') {
        browserRef.current.reload();
      }
    };

    const handleRefresh = () => {
      if (currentPage === 'browser' && browserRef.current) {
        // Only reload if on browser page
        browserRef.current.reload();
      }
      // Do nothing if not on browser page - Command+R is disabled
    };

    // Prevent default Command+R behavior when not on browser page
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        if (currentPage !== 'browser') {
          e.preventDefault();
          e.stopPropagation();
          // Completely prevent refresh when not on browser page
        }
      }
    };

    // Check if we're in an Electron environment
    if (window.ipcRenderer) {
      window.ipcRenderer.on('browser-reload', handleBrowserReload);
      window.ipcRenderer.on('handle-refresh', handleRefresh);
      
      // Tell main process about current page
      window.ipcRenderer.send('page-changed', currentPage);
    }

    // Add keyboard listener to prevent default Command+R
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      if (window.ipcRenderer) {
        window.ipcRenderer.off('browser-reload', handleBrowserReload);
        window.ipcRenderer.off('handle-refresh', handleRefresh);
      }
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPage]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const isNearLeftEdge = e.clientX <= 10; // 10px from left edge
      const sidebarElement = document.querySelector('[data-sidebar="sidebar"]');
      const isOverSidebar = sidebarElement?.contains(e.target as Node);

      if (!isPinned && !hoverDisabled) {
        if (isNearLeftEdge || isOverSidebar) {
          if (!isHovering) {
            setIsHovering(true);
            setOpen(true);
          }
          // Clear any pending close timeout
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = undefined;
          }
        } else if (isHovering && !isOverSidebar) {
          // Add delay before closing
          if (!hoverTimeoutRef.current) {
            hoverTimeoutRef.current = setTimeout(() => {
              setIsHovering(false);
              setOpen(false);
              hoverTimeoutRef.current = undefined;
            }, 300); // 300ms delay before closing
          }
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [isPinned, isHovering, hoverDisabled, setOpen]);

  const handleTogglePin = () => {
    const newPinnedState = !isPinned;
    setIsPinned(newPinnedState);
    
    if (newPinnedState) {
      // When pinning, ensure sidebar stays open
      setOpen(true);
      setIsHovering(false); // Reset hover state
    } else {
      // When unpinning, close the sidebar and disable hover for 1 second
      setOpen(false);
      setIsHovering(false);
      setHoverDisabled(true);
      
      // Clear any pending timeouts
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = undefined;
      }
      
      // Re-enable hover after 1 second
      setTimeout(() => {
        setHoverDisabled(false);
      }, 500);
    }
  };

  const handleOpenWorkspace = (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
    setCurrentPage('research-pages');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'workspaces':
        return <WorkspacesPage onOpenWorkspace={handleOpenWorkspace} />;
      case 'chat':
        return <ChatPage />;
      case 'email':
        return <EmailPage />;
      case 'ai-agents':
        return <AIAgentsPage />;
      case 'notes':
        return <NotesPage />;
      case 'browser':
        return <Browser ref={browserRef} />;
      case 'research-pages':
        return <ResearchPagesPage workspaceId={currentWorkspaceId} />;
      default:
        return <ChatPage />;
    }
  };

  const handlePageChange = (pageId: string) => {
    setCurrentPage(pageId as PageType);
  };

  return (
    <>
      <AppSidebar 
        onTogglePin={handleTogglePin} 
        isPinned={isPinned} 
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
      <SidebarInset className="border-l-0">
        <div className="flex flex-1 flex-col gap-2 p-2 bg-sidebar-bg">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-page-bg shadow-sm border-sidebar-text/10 border md:min-h-min">
            {renderCurrentPage()}
          </div>
        </div>
      </SidebarInset>
    </>
  );
}

function App() {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppContent />
    </SidebarProvider>
  )
}

export default App