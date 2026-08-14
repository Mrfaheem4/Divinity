import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  navigate: (url: string) => ipcRenderer.send('navigate', url),
  getCurrentUrl: () => ipcRenderer.invoke('get-current-url'),
  onUrlChanged: (callback: (url: string) => void) => {
    const listener = (_e: Electron.IpcRendererEvent, url: string) => callback(url)
    ipcRenderer.on('url-changed', listener)
    return () => ipcRenderer.removeListener('url-changed', listener)
  },
  getCurrentState: () => ipcRenderer.invoke('get-current-state'),

  goBack: () => ipcRenderer.send('go-back'),
  goForward: () => ipcRenderer.send('go-forward'),
  reload: () => ipcRenderer.send('reload'),
  goHome: () => ipcRenderer.send('go-home'),
  canGoBack: () => ipcRenderer.invoke('can-go-back'),
  canGoForward: () => ipcRenderer.invoke('can-go-forward'),
  getBookmarks: () => ipcRenderer.invoke('get-bookmarks'),
  addBookmark: (bookmark: { label: string; url: string }) =>
    ipcRenderer.send('add-bookmark', bookmark),
  removeBookmark: (url: string) => ipcRenderer.send('remove-bookmark', url)
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
