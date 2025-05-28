/// <reference types="vite/client" />
/// <reference path="./types/webview.d.ts" />

interface Window {
  // expose in the `electron/preload/index.ts`
  ipcRenderer: import('electron').IpcRenderer
}
