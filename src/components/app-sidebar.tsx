import * as React from "react"
import {
  Building2Icon,
  LayoutDashboardIcon,
  FolderIcon,
  MessageCircleIcon,
  MailIcon,
  PanelLeft,
  BotIcon,
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
        transition-all duration-200 hover:scale-[1.02] border-2 aspect-square
        bg-sidebar-border/50 text-sidebar-foreground/90 hover:bg-sidebar-border/70
        w-full h-auto
        ${isActive 
          ? 'border-sidebar-accent text-sidebar-accent-foreground bg-sidebar-border/60' 
          : 'border-transparent hover:border-sidebar-border/30'
        }
        ${isDragging ? 'opacity-50 z-50' : ''}
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
    <Sidebar collapsible="offcanvas" className="!border-r-0" {...props}>
      <SidebarHeader className="pt-2">
        {/* Toggle Pin Button at top left */}
        <div className="flex items-center justify-start px-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onTogglePin();
            }}
            className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 ${
              isPinned ? 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground' : ''
            }`}
          >
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Pin Sidebar</span>
          </button>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="pl-4 pr-3">
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
                <div className="grid grid-cols-3 gap-2">
                  {personalWork.map((item) => (
                    <SortableIcon 
                      key={item.id} 
                      item={item} 
                      onPageChange={onPageChange}
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
