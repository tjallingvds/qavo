import React, { useState, useRef, useEffect } from 'react';
import { BrowserPane } from './BrowserPane';
import { SplitViewTab, WebviewElement, WebsiteColors } from './types/browser';

interface SplitViewContentProps {
  splitTab: SplitViewTab;
  onUpdate: (updates: Partial<SplitViewTab>) => void;
  webviewRefs: React.MutableRefObject<{ [key: string]: WebviewElement }>;
  extractWebsiteColors: (webview: WebviewElement) => Promise<WebsiteColors>;
}

export function SplitViewContent({ splitTab, onUpdate, webviewRefs, extractWebsiteColors }: SplitViewContentProps) {
  const [resizing, setResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newRatio = (e.clientX - containerRect.left) / containerRect.width;
      const clampedRatio = Math.max(0.2, Math.min(0.8, newRatio)); // 20% to 80%
      
      onUpdate({ splitRatio: clampedRatio });
    };

    const handleMouseUp = () => {
      setResizing(false);
    };

    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, onUpdate]);

  const leftWidthPercent = (splitTab.splitRatio || 0.5) * 100;
  const rightWidthPercent = 100 - leftWidthPercent;

  return (
    <div ref={containerRef} className="flex h-full relative">
      {/* Left Pane */}
      <div style={{ width: `${leftWidthPercent}%` }}>
        <BrowserPane
          pane={splitTab.panes[0]}
          isActive={splitTab.activePaneId === splitTab.panes[0].id}
          showSplitZones={false}
          dragOverThisPane={false}
          dragOverPosition={null}
          onPaneClick={() => onUpdate({ activePaneId: splitTab.panes[0].id })}
          onTabClick={(tabId) => {
            const updatedPane = { ...splitTab.panes[0], activeTabId: tabId };
            onUpdate({ 
              panes: [updatedPane, splitTab.panes[1]],
              activePaneId: splitTab.panes[0].id
            });
          }}
          onTabClose={() => {}} // TODO: Implement if needed
          onAddressBarSubmit={() => {}} // TODO: Implement if needed  
          onAddressBarChange={() => {}} // TODO: Implement if needed
          onNavigation={() => {}} // TODO: Implement if needed
          onAddNewTab={() => {}} // TODO: Implement if needed
          webviewRefs={webviewRefs}
          setupWebviewListeners={() => undefined}
        />
      </div>

      {/* Resizer */}
      <div
        className={`w-1 bg-gray-300 cursor-col-resize hover:bg-blue-400 transition-colors ${
          resizing ? 'bg-blue-400' : ''
        }`}
        onMouseDown={handleMouseDown}
      />

      {/* Right Pane */}
      <div style={{ width: `${rightWidthPercent}%` }}>
        <BrowserPane
          pane={splitTab.panes[1]}
          isActive={splitTab.activePaneId === splitTab.panes[1].id}
          showSplitZones={false}
          dragOverThisPane={false}
          dragOverPosition={null}
          onPaneClick={() => onUpdate({ activePaneId: splitTab.panes[1].id })}
          onTabClick={(tabId) => {
            const updatedPane = { ...splitTab.panes[1], activeTabId: tabId };
            onUpdate({ 
              panes: [splitTab.panes[0], updatedPane],
              activePaneId: splitTab.panes[1].id
            });
          }}
          onTabClose={() => {}} // TODO: Implement if needed
          onAddressBarSubmit={() => {}} // TODO: Implement if needed
          onAddressBarChange={() => {}} // TODO: Implement if needed
          onNavigation={() => {}} // TODO: Implement if needed
          onAddNewTab={() => {}} // TODO: Implement if needed
          webviewRefs={webviewRefs}
          setupWebviewListeners={() => undefined}
        />
      </div>
    </div>
  );
} 