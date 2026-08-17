import { ElectronAPI } from '@electron-toolkit/preload'

interface Api {
  navigate: (url: string) => void
  getCurrentUrl: () => Promise<string>
  onUrlChanged: (callback: (url: string) => void) => () => void
  getCurrentState: () => Promise<{ url: string; isHome: boolean }>
  onTabSwitched: (
    callback: (state: { id: string; isHome: boolean; url: string }) => void
  ) => () => void

  goBack: () => void
  goForward: () => void
  reload: () => void
  goHome: () => void
  canGoBack: () => Promise<boolean>
  canGoForward: () => Promise<boolean>
  getBookmarks: () => Promise<{ label: string; url: string }[]>
  switchTab: (tabId: string) => void
  closeTab: (tabId: string) => void
  getTabs: () => Promise<{ id: string; url: string; isHome: boolean }[]>
  newTab: () => void

  onTabsUpdated: (
    callback: (tabs: { id: string; url: string; isHome: boolean }[]) => void
  ) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
