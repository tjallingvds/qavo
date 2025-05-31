export interface Tab {
  id: string;
  title: string;
  url: string;
  isLoading: boolean;
}

export interface WebsiteColors {
  primary: string;
  text: string;
  background: string;
  accent: string;
  isDark: boolean;
}

export interface SplitPane {
  id: string;
  tabs: Tab[];
  activeTabId: string;
  addressBarValue: string;
  websiteColors: WebsiteColors;
}

export interface SplitViewTab {
  id: string;
  title: string;
  type: 'split-view';
  panes: SplitPane[];
  activePaneId: string;
  splitRatio?: number; // 0.5 = 50/50, 0.3 = 30/70, etc.
}

export type BrowserTab = Tab & { type?: 'regular' } | SplitViewTab;

export interface BrowserRef {
  handleNavigation: (url: string) => void;
  addNewTab: () => void;
  reload: () => void;
  goHome: () => void;
}

export interface WebviewElement extends HTMLElement {
  src: string;
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
  executeJavaScript: (script: string) => Promise<any>;
  addEventListener: (event: string, handler: (event: any) => void) => void;
  removeEventListener: (event: string, handler: (event: any) => void) => void;
  _cleanup?: () => void;
} 