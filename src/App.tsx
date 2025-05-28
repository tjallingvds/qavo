import { AppSidebar } from "@/components/app-sidebar"
import Browser, { BrowserRef } from './components/Browser'
import { CommandPalette } from "@/components/CommandPalette"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import './App.css'
import { useRef } from 'react'

function App() {
  const browserRef = useRef<BrowserRef>(null);

  const handleNavigate = (url: string) => {
    browserRef.current?.handleNavigation(url);
  };

  const handleNewTab = () => {
    browserRef.current?.addNewTab();
  };

  const handleReload = () => {
    browserRef.current?.reload();
  };

  const handleHome = () => {
    browserRef.current?.goHome();
  };

  return (
    <SidebarProvider>
      <CommandPalette 
        onNavigate={handleNavigate}
        onNewTab={handleNewTab}
        onReload={handleReload}
        onHome={handleHome}
      />
      <AppSidebar />
      <SidebarInset className="border-l-0">
        <div className="flex flex-1 flex-col gap-2 p-2 bg-background">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-white shadow-sm border md:min-h-min">
            <Browser ref={browserRef} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App