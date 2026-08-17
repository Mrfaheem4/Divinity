import { create } from 'zustand'

interface TabInfo {
  id: string
  url: string
  isHome: boolean
}

interface TabStore {
  tabs: TabInfo[]
  activeTabId: string
  setTabs: (tabs: TabInfo[]) => void
  setActiveTabId: (id: string) => void
  updateTab: (id: string, data: { url?: string; isHome?: boolean }) => void
  updateActiveTab: (data: { url?: string; isHome?: boolean }) => void
}

export const useTabStore = create<TabStore>((set) => ({
  tabs: [],
  activeTabId: '',
  setTabs: (tabs) => set({ tabs }),
  setActiveTabId: (id) => set({ activeTabId: id }),
  updateTab: (id, data) =>
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, ...data } : t))
    })),
  updateActiveTab: (data) =>
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === state.activeTabId ? { ...t, ...data } : t))
    }))
}))
