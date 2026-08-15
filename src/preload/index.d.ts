import { ElectronAPI } from '@electron-toolkit/preload'

interface Api {
  navigate: (url: string) => void
  getCurrentUrl: () => Promise<string>
  onUrlChanged: (callback: (url: string) => void) => () => void
  getCurrentState: () => Promise<{ url: string; isHome: boolean }>
  onTabSwitched: (callback: (state: { isHome: boolean; url: string }) => void) => () => void

  goBack: () => void
  goForward: () => void
  reload: () => void
  goHome: () => void
  canGoBack: () => Promise<boolean>
  canGoForward: () => Promise<boolean>
  getBookmarks: () => Promise<{ label: string; url: string }[]>
  switchTab: (tabId: string) => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
