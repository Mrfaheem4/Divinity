import { ElectronAPI } from '@electron-toolkit/preload'

interface Api {
  navigate: (url: string) => void
  getCurrentUrl: () => Promise<string>
  onUrlChanged: (callback: (url: string) => void) => () => void
  getCurrentState: () => Promise<{ url: string; isVisible: boolean }> // NEW

  goBack: () => void
  goForward: () => void
  reload: () => void
  goHome: () => void
  canGoBack: () => Promise<boolean>
  canGoForward: () => Promise<boolean>
  getBookmarks: () => Promise<{ label: string; url: string }[]>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
