import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Plus,
  X,
  Globe
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

interface Tab {
  id: string;
  title: string;
  url: string;
  isLoading: boolean;
}

interface WebsiteColors {
  primary: string;
  text: string;
  background: string;
  accent: string;
  isDark: boolean;
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
  executeJavaScript: (script: string) => Promise<any>;
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
      <Globe 
        className="w-4 h-4 mr-2 flex-shrink-0 relative z-10" 
        style={{ 
          color: isActive 
            ? (websiteColors.isDark ? '#ffffff' : websiteColors.text)
            : '#6b7280'
        }} 
      />
      <span 
        className="truncate text-sm font-medium relative z-10 flex-1 min-w-0"
        style={{ 
          color: isActive 
            ? (websiteColors.isDark ? '#ffffff' : websiteColors.text)
            : '#6b7280'
        }}
      >
        {tab.title}
      </span>
      {canClose && (
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
      
      {/* Adaptive background for active tab with same logic as search bar */}
      {isActive && (
        <>
          {/* Base background - always visible for active tab */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: websiteColors.background,
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              zIndex: 0,
            }}
          />
          {/* Ensure content is above backgrounds */}
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

const Browser = forwardRef<BrowserRef>((props, ref) => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'New Tab', url: 'https://www.google.com', isLoading: false }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [addressBarValue, setAddressBarValue] = useState('https://www.google.com');
  const [websiteColors, setWebsiteColors] = useState<WebsiteColors>({
    primary: '#ffffff',
    text: '#000000',
    background: '#ffffff',
    accent: '#3b82f6',
    isDark: false
  });
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

  // Utility function to determine if a color is dark
  const isColorDark = (hex: string): boolean => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  };

  // Function to extract colors from website
  const extractWebsiteColors = async (webview: WebviewElement): Promise<WebsiteColors> => {
    try {
      // Execute script in webview to get color information
      const result = await webview.executeJavaScript(`
        (function() {
          // Get computed styles of body and main elements
          const body = document.body;
          const bodyStyle = window.getComputedStyle(body);
          
          // Try to find the main content area
          const mainContent = document.querySelector('main') || 
                            document.querySelector('.main') || 
                            document.querySelector('#main') || 
                            document.querySelector('.content') || 
                            body;
          
          const mainStyle = window.getComputedStyle(mainContent);
          
          // Extract colors with better fallbacks
          let backgroundColor = bodyStyle.backgroundColor || mainStyle.backgroundColor || '#ffffff';
          let textColor = bodyStyle.color || mainStyle.color || '#000000';
          
          // Convert rgba/rgb to hex if needed
          function rgbToHex(color) {
            if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return '#ffffff';
            if (color.startsWith('#')) return color;
            
            const rgbaMatch = color.match(/rgba?\\(([^)]+)\\)/);
            if (rgbaMatch) {
              const [r, g, b] = rgbaMatch[1].split(',').map(x => parseInt(x.trim()));
              // Handle invalid values
              if (isNaN(r) || isNaN(g) || isNaN(b)) return '#ffffff';
              return '#' + [r, g, b].map(x => {
                const hex = Math.max(0, Math.min(255, x)).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
              }).join('');
            }
            return '#ffffff';
          }
          
          // Get the actual background color, checking multiple elements
          let finalBackgroundColor = rgbToHex(backgroundColor);
          
          // If background is transparent or white, check for actual page background
          if (finalBackgroundColor === '#ffffff' || backgroundColor === 'transparent' || backgroundColor === 'rgba(0, 0, 0, 0)') {
            // Check html element background
            const htmlStyle = window.getComputedStyle(document.documentElement);
            const htmlBg = htmlStyle.backgroundColor;
            if (htmlBg && htmlBg !== 'transparent' && htmlBg !== 'rgba(0, 0, 0, 0)') {
              finalBackgroundColor = rgbToHex(htmlBg);
            }
          }
          
          // Get text color
          let finalTextColor = rgbToHex(textColor);
          
          // If text color is still default, try to get it from other elements
          if (finalTextColor === '#000000') {
            const paragraphs = document.querySelectorAll('p, h1, h2, h3, span, div');
            for (let el of paragraphs) {
              const elStyle = window.getComputedStyle(el);
              const elColor = elStyle.color;
              if (elColor && elColor !== 'rgb(0, 0, 0)') {
                finalTextColor = rgbToHex(elColor);
                break;
              }
            }
          }
          
          // For white backgrounds, ensure we have proper dark text
          if (finalBackgroundColor === '#ffffff' || finalBackgroundColor === '#fefefe') {
            // For white backgrounds, use dark text unless we found a specific color
            if (finalTextColor === '#ffffff' || finalTextColor === '#000000') {
              finalTextColor = '#1f2937'; // Use a nice dark gray instead of pure black
            }
          }
          
          // For dark backgrounds, ensure we have proper light text
          const bgLuminance = (parseInt(finalBackgroundColor.slice(1, 3), 16) * 0.299 + 
                              parseInt(finalBackgroundColor.slice(3, 5), 16) * 0.587 + 
                              parseInt(finalBackgroundColor.slice(5, 7), 16) * 0.114) / 255;
          
          if (bgLuminance < 0.5) {
            // Dark background - ensure light text
            if (finalTextColor === '#000000' || finalTextColor === '#1f2937') {
              finalTextColor = '#ffffff';
            }
          }
          
          // Try to find accent colors from links or buttons
          const links = document.querySelectorAll('a, button, [role="button"]');
          let accentColor = '#3b82f6';
          
          for (let link of links) {
            const linkStyle = window.getComputedStyle(link);
            const color = linkStyle.color || linkStyle.backgroundColor;
            if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent' && color !== 'rgb(0, 0, 0)' && color !== 'rgb(255, 255, 255)') {
              accentColor = rgbToHex(color);
              break;
            }
          }
          
          return {
            background: finalBackgroundColor,
            text: finalTextColor,
            primary: finalBackgroundColor,
            accent: accentColor
          };
        })();
      `);

      const colors: WebsiteColors = {
        background: result.background || '#ffffff',
        text: result.text || '#000000',
        primary: result.primary || '#ffffff',
        accent: result.accent || '#3b82f6',
        isDark: isColorDark(result.background || '#ffffff')
      };

      console.log('Extracted website colors:', colors);
      return colors;
    } catch (error) {
      console.error('Failed to extract website colors:', error);
      // Return default colors
      return {
        primary: '#ffffff',
        text: '#000000',
        background: '#ffffff',
        accent: '#3b82f6',
        isDark: false
      };
    }
  };

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

  // Extract colors when active tab changes
  useEffect(() => {
    const extractColorsForActiveTab = async () => {
      const activeWebview = webviewRefs.current[activeTabId];
      if (activeWebview) {
        try {
          const colors = await extractWebsiteColors(activeWebview);
          setWebsiteColors(colors);
        } catch (error) {
          console.error('Failed to extract colors for active tab:', error);
        }
      }
    };

    // Add a small delay to ensure the page is fully rendered
    const timer = setTimeout(extractColorsForActiveTab, 10);
    return () => clearTimeout(timer);
  }, [activeTabId]);

  // Set up webview event listeners for a specific tab
  const setupWebviewListeners = (tabId: string, webview: WebviewElement) => {
    if (!webview) return;

    const handleWebviewLoad = async () => {
      setTabs(tabs => tabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, isLoading: false }
          : tab
      ));

      // Extract colors from the loaded website if this is the active tab
      if (tabId === activeTabId) {
        try {
          // Add a small delay to ensure the page is fully rendered
          setTimeout(async () => {
            const colors = await extractWebsiteColors(webview);
            setWebsiteColors(colors);
          }, 10);
        } catch (error) {
          console.error('Failed to extract colors:', error);
        }
      }
    };

    const handleWebviewTitleUpdate = (event: any) => {
      setTabs(tabs => tabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, title: event.title || 'Untitled' }
          : tab
      ));
    };

    const handleWebviewNavigate = async (event: any) => {
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
    <div className="flex flex-col h-full overflow-hidden transition-all duration-300 rounded-xl">
      {/* Tab Bar */}
      <div 
        className="flex relative transition-all duration-300 bg-gray-100 rounded-t-xl"
      >
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
                  websiteColors={websiteColors}
                />
              ))}
            </SortableContext>
          </DndContext>
          
          {/* New tab button */}
          <button
            onClick={addNewTab}
            className="flex items-center justify-center w-8 h-8 ml-2 mt-1 rounded-full transition-colors flex-shrink-0 hover:bg-gray-200"
            title="New Tab"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
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
            {/* Adaptive background container that appears on hover and focus */}
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
            {/* Focus ring with adaptive color */}
            <div 
              className="absolute inset-0 rounded-full opacity-0 focus-within:opacity-100 transition-all duration-200 pointer-events-none"
              style={{
                boxShadow: `0 0 0 2px ${websiteColors.accent}40`,
              }}
            />
          </div>
        </form>
      </div>

      {/* Web Content - Multiple webviews, one for each tab */}
      <div className="flex-1 relative overflow-hidden rounded-b-xl">
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

Browser.displayName = 'Browser';

export default Browser;