import * as React from "react"
import {
  Building2Icon,
  LayoutDashboardIcon,
  FolderIcon,
  MessageCircleIcon,
  MailIcon,
  PanelLeft,
  BotIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

interface PersonalWorkItem {
  id: string;
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  pageId: string;
}

// Sortable Icon Component
interface SortableIconProps {
  item: PersonalWorkItem;
  onPageChange: (pageId: string) => void;
  currentPage: string;
}

function SortableIcon({ item, onPageChange, currentPage }: SortableIconProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: item.id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
  };

  const isActive = currentPage === item.pageId;

  const handleClick = (e: React.MouseEvent) => {
    // Only handle click if not currently dragging
    if (!isDragging) {
      e.preventDefault();
      e.stopPropagation();
      onPageChange(item.pageId);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative flex items-center justify-center rounded-lg cursor-pointer
        transition-all duration-200 hover:scale-[1.02] border aspect-square
        bg-gray-100/80 backdrop-blur-sm text-gray-600 hover:bg-gray-200/90 hover:shadow-sm
        w-full h-auto p-4
        ${isActive 
          ? 'border-gray-400 text-gray-800 bg-gray-200/90 shadow-sm' 
          : 'border-gray-300 hover:border-gray-400'
        }
        ${isDragging ? 'opacity-50 z-50 shadow-lg' : ''}
      `}
      title={item.title}
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      <item.icon className="h-5 w-5 stroke-[1.5] pointer-events-none" />
    </div>
  );
}

const initialPersonalWork: PersonalWorkItem[] = [
  {
    id: '1',
    title: "Dashboard",
    url: "#",
    icon: LayoutDashboardIcon,
    pageId: "dashboard",
  },
  {
    id: '2',
    title: "Workspaces",
    url: "#",
    icon: FolderIcon,
    pageId: "workspaces",
  },
  {
    id: '3',
    title: "Chat",
    url: "#",
    icon: MessageCircleIcon,
    isActive: true,
    pageId: "chat",
  },
  {
    id: '4',
    title: "Email",
    url: "#",
    icon: MailIcon,
    pageId: "email",
  },
  {
    id: '5',
    title: "AI Agents",
    url: "#",
    icon: BotIcon,
    pageId: "ai-agents",
  },
  {
    id: '6',
    title: "Free Browse",
    url: "#",
    icon: Building2Icon,
    pageId: "browser",
  },
];

const data = {
  user: {
    name: "Tjalling",
    email: "tjalling@abcsolutions.com",
    avatar: "/avatars/tjalling.jpg",
  },
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onTogglePin: () => void;
  isPinned: boolean;
  currentPage: string;
  onPageChange: (pageId: string) => void;
}

export function AppSidebar({ onTogglePin, isPinned, currentPage, onPageChange, ...props }: AppSidebarProps) {
  const [personalWork, setPersonalWork] = React.useState<PersonalWorkItem[]>(initialPersonalWork);
  const [pageHistory, setPageHistory] = React.useState<string[]>([currentPage]);
  const [historyIndex, setHistoryIndex] = React.useState(0);

  // Update history when page changes externally
  React.useEffect(() => {
    if (pageHistory[historyIndex] !== currentPage) {
      const newHistory = pageHistory.slice(0, historyIndex + 1);
      newHistory.push(currentPage);
      setPageHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [currentPage]);

  const handlePageChange = (pageId: string) => {
    onPageChange(pageId);
  };

  const handleGoBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onPageChange(pageHistory[newIndex]);
    }
  };

  const handleGoForward = () => {
    if (historyIndex < pageHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onPageChange(pageHistory[newIndex]);
    }
  };

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < pageHistory.length - 1;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPersonalWork((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <Sidebar 
      collapsible="offcanvas" 
      className="!border-r-0 [&>[data-sidebar=sidebar]]:bg-white/40 [&>[data-sidebar=sidebar]]:backdrop-blur-xl [&>[data-sidebar=sidebar]]:border-r [&>[data-sidebar=sidebar]]:border-gray-100" 
      {...props}
    >
      <SidebarHeader className="pt-2">
        {/* Header */}
        <div className="px-2 py-1 border-b border-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTogglePin();
              }}
              className={`p-2 hover:bg-gray-50 rounded-md transition-colors ${
                isPinned ? 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground' : ''
              }`}
            >
              <PanelLeft className="h-4 w-4 text-gray-400" />
              <span className="sr-only">Toggle Pin Sidebar</span>
            </button>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={handleGoBack}
                disabled={!canGoBack}
                className="p-1.5 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft className="h-4 w-4 text-gray-500" />
              </button>
              <button
                onClick={handleGoForward}
                disabled={!canGoForward}
                className="p-1.5 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2 -mt-2">
        {/* Draggable Icon Grid */}
        <SidebarGroup>
          <SidebarGroupContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToParentElement]}
            >
              <SortableContext
                items={personalWork.map(item => item.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-3 gap-3">
                  {personalWork.map((item) => (
                    <SortableIcon 
                      key={item.id} 
                      item={item} 
                      onPageChange={handlePageChange}
                      currentPage={currentPage}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
