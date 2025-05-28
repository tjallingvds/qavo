import React, { useState, useEffect } from 'react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Search,
  Home,
  FileText,
  Folder,
  Globe,
  Plus,
  RotateCcw,
} from "lucide-react";

interface CommandPaletteProps {
  onNavigate?: (url: string) => void;
  onNewTab?: () => void;
  onReload?: () => void;
  onHome?: () => void;
}

export function CommandPalette({ onNavigate, onNewTab, onReload, onHome }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    console.log('CommandPalette: Setting up event listeners');
    
    // Listen for IPC message from main process (global shortcut)
    const handleToggleCommandPalette = () => {
      console.log('CommandPalette: Received toggle-command-palette message');
      setOpen((prevOpen) => {
        console.log('CommandPalette: Toggling from', prevOpen, 'to', !prevOpen);
        return !prevOpen;
      });
    };

    // Check if we're in Electron environment and set up IPC listener
    if (typeof window !== 'undefined' && (window as any).ipcRenderer) {
      console.log('CommandPalette: Setting up IPC listener');
      (window as any).ipcRenderer.on('toggle-command-palette', handleToggleCommandPalette);
      
      return () => {
        console.log('CommandPalette: Cleaning up IPC listener');
        (window as any).ipcRenderer.off('toggle-command-palette', handleToggleCommandPalette);
      };
    } else {
      console.log('CommandPalette: No IPC available, setting up fallback keyboard listener');
      
      // Fallback for development/non-Electron environment
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
          console.log('CommandPalette: Fallback keyboard shortcut triggered');
          e.preventDefault();
          e.stopPropagation();
          setOpen((prevOpen) => !prevOpen);
        }
      };

      document.addEventListener("keydown", handleKeyDown, { capture: true });
      
      return () => {
        console.log('CommandPalette: Cleaning up fallback keyboard listener');
        document.removeEventListener("keydown", handleKeyDown, { capture: true });
      };
    }
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    console.log('CommandPalette: Running command and closing');
    setOpen(false);
    command();
  }, []);

  console.log('CommandPalette: Rendering with open =', open);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            
            <CommandGroup heading="Navigation">
              <CommandItem onSelect={() => runCommand(() => onHome?.())}>
                <Home className="mr-2 h-4 w-4" />
                <span>Go Home</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => onReload?.())}>
                <RotateCcw className="mr-2 h-4 w-4" />
                <span>Reload Page</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => onNewTab?.())}>
                <Plus className="mr-2 h-4 w-4" />
                <span>New Tab</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Quick Navigation">
              <CommandItem onSelect={() => runCommand(() => onNavigate?.("https://google.com"))}>
                <Search className="mr-2 h-4 w-4" />
                <span>Google</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => onNavigate?.("https://github.com"))}>
                <Globe className="mr-2 h-4 w-4" />
                <span>GitHub</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => onNavigate?.("https://youtube.com"))}>
                <Globe className="mr-2 h-4 w-4" />
                <span>YouTube</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => onNavigate?.("https://twitter.com"))}>
                <Globe className="mr-2 h-4 w-4" />
                <span>Twitter</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Suggestions">
              <CommandItem>
                <Calendar className="mr-2 h-4 w-4" />
                <span>Calendar</span>
              </CommandItem>
              <CommandItem>
                <Smile className="mr-2 h-4 w-4" />
                <span>Search Emoji</span>
              </CommandItem>
              <CommandItem>
                <Calculator className="mr-2 h-4 w-4" />
                <span>Calculator</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Settings">
              <CommandItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </CommandItem>
              <CommandItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </CommandItem>
              <CommandItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
} 