import { AppSidebar } from "@/components/app-sidebar"
import Browser, { BrowserRef } from './components/Browser'
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"
import './App.css'
import { useRef, useState, useEffect } from 'react'

function AppContent() {
  const browserRef = useRef<BrowserRef>(null);
  const { setOpen, open } = useSidebar();
  const [isPinned, setIsPinned] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverDisabled, setHoverDisabled] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

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

  return (
    <>
      <AppSidebar onTogglePin={handleTogglePin} isPinned={isPinned} />
      <SidebarInset className="border-l-0">
        <div className="flex flex-1 flex-col gap-2 p-2 bg-background">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-white shadow-sm border md:min-h-min">
            <Browser ref={browserRef} />
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