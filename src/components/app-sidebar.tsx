import * as React from "react"
import {
  Building2Icon,
  LayoutDashboardIcon,
  FolderIcon,
  MessageCircleIcon,
  MailIcon,
  BarChart3Icon,
  UsersIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  UserIcon,
  PanelLeft,
  BotIcon,
  StickyNoteIcon,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

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
    // Only handle click if not dragging
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
    >
      <item.icon className="h-5 w-5 stroke-[1.5] pointer-events-none" />
      {/* Drag handle - small area for dragging */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-0 right-0 w-3 h-3 cursor-grab active:cursor-grabbing"
        title="Drag to reorder"
      />
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
    title: "Notes",
    url: "#",
    icon: StickyNoteIcon,
    pageId: "notes",
  },
];

const data = {
  user: {
    name: "Tjalling",
    email: "tjalling@abcsolutions.com",
    avatar: "/avatars/tjalling.jpg",
  },
  teamRooms: [
    {
      name: "Water Cooler",
      icon: UsersIcon,
      members: [
        { name: "Pedro", isOnline: true },
        { name: "Zefi", isOnline: false },
      ],
    },
    {
      name: "Cool People Corner",
      icon: UsersIcon,
      members: [
        { name: "Alex", isOnline: true },
        { name: "Tjalling", isOnline: true },
        { name: "Rick", isOnline: false },
      ],
    },
  ],
  teamMembers: [
    { name: "Tjalling", isOnline: true },
    { name: "Zefi", isOnline: false },
    { name: "Rick", isOnline: false },
    { name: "Alex", isOnline: true },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onTogglePin: () => void;
  isPinned: boolean;
  currentPage: string;
  onPageChange: (pageId: string) => void;
}

export function AppSidebar({ onTogglePin, isPinned, currentPage, onPageChange, ...props }: AppSidebarProps) {
  const [personalWork, setPersonalWork] = React.useState<PersonalWorkItem[]>(initialPersonalWork);
  const [openRooms, setOpenRooms] = React.useState<{ [key: string]: boolean }>({
    "Water Cooler": false,
    "Cool People Corner": false,
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
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

  const toggleRoom = (roomName: string) => {
    setOpenRooms(prev => ({
      ...prev,
      [roomName]: !prev[roomName]
    }))
  }

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
      
      <SidebarContent className="px-3">
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

        {/* Browser Button */}
        <SidebarGroup className="mt-4">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  className={`w-full justify-start px-3 py-2 ${
                    currentPage === 'browser' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                  }`}
                >
                  <button onClick={() => onPageChange('browser')} className="flex items-center gap-3">
                    <Building2Icon className="h-4 w-4" />
                    <span className="font-medium">Browser</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Team Rooms Section */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mb-1">
            Team Rooms
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {data.teamRooms.map((room) => (
                <SidebarMenuItem key={room.name}>
                  <Collapsible open={openRooms[room.name]} onOpenChange={() => toggleRoom(room.name)}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="w-full justify-start px-3 py-2">
                        <room.icon className="h-4 w-4" />
                        <span className="font-bold flex-1 text-left">{room.name}</span>
                        {openRooms[room.name] ? (
                          <ChevronDownIcon className="h-4 w-4" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4" />
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-6 mt-1 space-y-1">
                        {room.members.map((member) => (
                          <div key={member.name} className="flex items-center gap-2 px-3 py-1.5 text-sm">
                            <div className={`h-2 w-2 rounded-full ${member.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <span className="text-muted-foreground font-medium">{member.name}</span>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Team Members Section */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mb-1">
            Team Members
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {data.teamMembers.map((member) => (
                <SidebarMenuItem key={member.name}>
                  <SidebarMenuButton asChild className="w-full justify-start px-3 py-2">
                    <a href="#" className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${member.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="font-medium">{member.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
