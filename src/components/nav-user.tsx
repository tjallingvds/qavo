import {
  BellIcon,
  CreditCardIcon,
  LogOutIcon,
  MoreVerticalIcon,
  UserCircleIcon,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-white/40 data-[state=open]:text-dark-text hover:bg-white/30 text-sidebar-text"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-accent-primary text-white text-xs font-medium">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-dark-text">{user.name}</span>
                <span className="truncate text-xs text-sidebar-text">
                  {user.email}
                </span>
              </div>
              <MoreVerticalIcon className="ml-auto size-4 text-sidebar-text" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-page-bg border-sidebar-text/10"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-accent-primary text-white text-xs font-medium">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-dark-text">{user.name}</span>
                  <span className="truncate text-xs text-sidebar-text">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-sidebar-text/10" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-dark-text hover:bg-accent-quaternary/20 focus:bg-accent-quaternary/20">
                <UserCircleIcon className="text-sidebar-text" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem className="text-dark-text hover:bg-accent-quaternary/20 focus:bg-accent-quaternary/20">
                <CreditCardIcon className="text-sidebar-text" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem className="text-dark-text hover:bg-accent-quaternary/20 focus:bg-accent-quaternary/20">
                <BellIcon className="text-sidebar-text" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-sidebar-text/10" />
            <DropdownMenuItem className="text-dark-text hover:bg-accent-primary/10 focus:bg-accent-primary/10">
              <LogOutIcon className="text-accent-primary" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
