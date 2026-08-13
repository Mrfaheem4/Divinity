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
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
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
