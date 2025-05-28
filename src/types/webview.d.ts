declare namespace JSX {
  interface IntrinsicElements {
    webview: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string;
      nodeintegration?: boolean;
      webpreferences?: string;
      onDidFinishLoad?: () => void;
      onPageTitleUpdated?: (event: { title: string }) => void;
      onDidNavigate?: (event: { url: string }) => void;
      onDidNavigateInPage?: (event: { url: string }) => void;
      onNewWindow?: (event: { url: string }) => void;
      onWillNavigate?: (event: { url: string }) => void;
      goBack?: () => void;
      goForward?: () => void;
      reload?: () => void;
      canGoBack?: () => boolean;
      canGoForward?: () => boolean;
    };
  }
} 