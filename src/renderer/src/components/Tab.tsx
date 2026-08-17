import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import Searchbar from './foreground/Searchbar'
import Background from './Background'
import TabBar from './foreground/TabBar'
import { useTabStore } from '../store/tabStore'

function Tab() {
  const setTabs = useTabStore((s) => s.setTabs)
  const setActiveTabId = useTabStore((s) => s.setActiveTabId)
  const updateTab = useTabStore((s) => s.updateTab)
  const isHome = useTabStore((s) => s.tabs.find((t) => t.id === s.activeTabId)?.isHome ?? true)

  useEffect(() => {
    window.api.getTabs().then((tabs) => {
      setTabs(tabs)

      if (tabs.length === 0) return

      const activeTab = tabs[0]
      setActiveTabId(activeTab.id)
      updateTab(activeTab.id, { url: activeTab.url, isHome: activeTab.isHome })
    })
  }, [setActiveTabId, setTabs, updateTab])

  useEffect(() => {
    const unsubscribe = window.api.onTabSwitched(({ id, url, isHome }) => {
      console.log('onTabSwitched fired:', { id, url, isHome })

      setActiveTabId(id)
      updateTab(id, { url, isHome })
    })
    return unsubscribe
  }, [setActiveTabId, updateTab])

  useEffect(() => {
    const unsubscribe = window.api.onTabsUpdated((tabs) => {
      setTabs(tabs)

      if (tabs.length === 0) return

      const activeTab = tabs.find((tab) => tab.id === useTabStore.getState().activeTabId) ?? tabs[0]
      setActiveTabId(activeTab.id)
      updateTab(activeTab.id, { url: activeTab.url, isHome: activeTab.isHome })
    })
    return unsubscribe
  }, [setActiveTabId, setTabs, updateTab])

  function handleSearchComplete(url: string) {
    console.log('navigating to:', url)

    window.api.navigate(url)
  }

  function goHome() {
    window.api.goHome()
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-11 left-0 right-0 z-30 pointer-events-auto">
        <TabBar />
      </div>

      <div
        className="absolute inset-0 z-0"
        style={{
          opacity: isHome ? 1 : 0,
          transition: 'opacity 300ms ease',
          pointerEvents: isHome ? 'auto' : 'none'
        }}
      >
        <Canvas camera={{ position: [0, -5, 30] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[2, 2, 2]} intensity={1} color="#7C5CFF" />
          <pointLight position={[-2, -1, 2]} intensity={0.5} color="#ffffff" />
          <Background isDocked={!isHome} />
        </Canvas>
      </div>

      <div className="absolute inset-0 z-10 pointer-events-auto">
        <Searchbar onSearch={handleSearchComplete} onGoHome={goHome} />
      </div>
    </div>
  )
}

export default Tab
