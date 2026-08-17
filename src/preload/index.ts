import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  newTab: () => ipcRenderer.send('new-tab'),
  navigate: (url: string) => ipcRenderer.send('navigate', url),
  getCurrentUrl: () => ipcRenderer.invoke('get-current-url'),
  onUrlChanged: (callback: (url: string) => void) => {
    const listener = (_e: Electron.IpcRendererEvent, url: string) => callback(url)
    ipcRenderer.on('url-changed', listener)
    return () => ipcRenderer.removeListener('url-changed', listener)
  },
  onTabSwitched: (callback: (state: { id: string; isHome: boolean; url: string }) => void) => {
    const listener = (
      _e: Electron.IpcRendererEvent,
      state: { id: string; isHome: boolean; url: string }
    ) => callback(state)
    ipcRenderer.on('tab-switched', listener)
    return () => ipcRenderer.removeListener('tab-switched', listener)
  },

  getCurrentState: () => ipcRenderer.invoke('get-current-state'),

  onTabsUpdated: (callback: (tabs: { id: string; url: string; isHome: boolean }[]) => void) => {
    const listener = (
      _e: Electron.IpcRendererEvent,
      tabs: { id: string; url: string; isHome: boolean }[]
    ) => callback(tabs)
    ipcRenderer.on('tabs-updated', listener)
    return () => ipcRenderer.removeListener('tabs-updated', listener)
  },

  goBack: () => ipcRenderer.send('go-back'),
  goForward: () => ipcRenderer.send('go-forward'),
  reload: () => ipcRenderer.send('reload'),
  goHome: () => ipcRenderer.send('go-home'),
  canGoBack: () => ipcRenderer.invoke('can-go-back'),
  canGoForward: () => ipcRenderer.invoke('can-go-forward'),
  getBookmarks: () => ipcRenderer.invoke('get-bookmarks'),
  switchTab: (tabId: string) => ipcRenderer.send('switch-tab', tabId),
  closeTab: (tabId: string) => ipcRenderer.send('close-tab', tabId),
  getTabs: () => ipcRenderer.invoke('get-tabs')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
