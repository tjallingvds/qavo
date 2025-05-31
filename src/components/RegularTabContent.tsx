import React from 'react';
import { BrowserPane } from './BrowserPane';
import { Tab, WebviewElement, WebsiteColors } from './types/browser';

interface RegularTabContentProps {
  tab: Tab;
  webviewRefs: React.MutableRefObject<{ [key: string]: WebviewElement }>;
  extractWebsiteColors: (webview: WebviewElement) => Promise<WebsiteColors>;
}

export function RegularTabContent({ tab, webviewRefs, extractWebsiteColors }: RegularTabContentProps) {
  return (
    <BrowserPane
      pane={{
        id: 'single-pane',
        tabs: [tab],
        activeTabId: tab.id,
        addressBarValue: tab.url,
        websiteColors: {
          primary: '#ffffff',
          text: '#000000',
          background: '#ffffff',
          accent: '#3b82f6',
          isDark: false
        }
      }}
      isActive={true}
      showSplitZones={false}
      dragOverThisPane={false}
      dragOverPosition={null}
      onPaneClick={() => {}}
      onTabClick={() => {}}
      onTabClose={() => {}}
      onAddressBarSubmit={() => {}}
      onAddressBarChange={() => {}}
      onNavigation={() => {}}
      onAddNewTab={() => {}}
      webviewRefs={webviewRefs}
      setupWebviewListeners={() => undefined}
    />
  );
} 