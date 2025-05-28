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
} from "lucide-react"

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

const data = {
  user: {
    name: "Tjalling",
    email: "tjalling@abcsolutions.com",
    avatar: "/avatars/tjalling.jpg",
  },
  personalWork: [
    {
      title: "Dashboard",
      url: "#",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Workspaces",
      url: "#",
      icon: FolderIcon,
    },
    {
      title: "Chat",
      url: "#",
      icon: MessageCircleIcon,
      isActive: true,
    },
    {
      title: "Email",
      url: "#",
      icon: MailIcon,
    },
  ],
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
}

export function AppSidebar({ onTogglePin, isPinned, ...props }: AppSidebarProps) {
  const [openRooms, setOpenRooms] = React.useState<{ [key: string]: boolean }>({
    "Water Cooler": false,
    "Cool People Corner": false,
  })

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
        {/* Arc-style Icon Row */}
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="grid grid-cols-2 gap-2">
              {data.personalWork.map((item) => (
                <a
                  key={item.title}
                  href={item.url}
                  className={`
                    relative flex flex-col items-center justify-center rounded-lg p-2
                    transition-all duration-200 hover:scale-[1.02] border-2
                    bg-sidebar-border/50 text-sidebar-foreground/90 hover:bg-sidebar-border/70
                    ${item.isActive 
                      ? 'border-sidebar-accent text-sidebar-accent-foreground bg-sidebar-border/60' 
                      : 'border-transparent hover:border-sidebar-border/30'
                    }
                  `}
                  title={item.title}
                >
                  <item.icon className="h-4 w-4 mb-1.5 stroke-[1.5]" />
                  <span className="text-[10px] font-semibold text-center leading-tight">{item.title}</span>
                </a>
              ))}
            </div>
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
