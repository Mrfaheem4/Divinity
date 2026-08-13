import { ElectronAPI } from '@electron-toolkit/preload'

interface Api {
  navigate: (url: string) => void
  getCurrentUrl: () => Promise<string>
  onUrlChanged: (callback: (url: string) => void) => () => void
}
declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
