import SpotlightCard from '../SpotlightCard'
import { useTabStore } from '../../store/tabStore'

function TabBar() {
  const tabs = useTabStore((s) => s.tabs)
  const activeTabId = useTabStore((s) => s.activeTabId)

  function handleClick(id: string) {
    window.api.switchTab(id)
  }

  function handleClose(id: string) {
    window.api.closeTab(id)
  }

  return (
    <div className="relative z-30 h-10 w-full flex items-center gap-2 px-4 pointer-events-auto">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId
        return (
          <SpotlightCard
            key={tab.id}
            className="!rounded-full !p-0 shrink-0"
            spotlightColor="rgba(255, 255, 255, 0.25)"
          >
            <div className="relative">
              <button
                type="button"
                onClick={() => handleClick(tab.id)}
                className={`h-8 px-4 pr-6 flex items-center justify-center rounded-full border-2 bg-transparent text-xs whitespace-nowrap transition-colors ${
                  isActive ? 'border-white/70 text-white' : 'border-white/30 text-white/50'
                }`}
              >
                {tab.isHome ? 'Home' : tab.url}
              </button>

              <button
                type="button"
                aria-label={`Close ${tab.isHome ? 'Home' : tab.url} tab`}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation()
                  handleClose(tab.id)
                }}
                className="absolute -top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full border border-white/40 bg-[#0f1320]/90 text-[9px] leading-none text-white/70 transition hover:border-white/70 hover:text-white"
              >
                ×
              </button>
            </div>
          </SpotlightCard>
        )
      })}

      <SpotlightCard
        className="!rounded-full !p-0 shrink-0"
        spotlightColor="rgba(255, 255, 255, 0.25)"
      >
        <button
          type="button"
          onClick={() => window.api.newTab()}
          className="h-8 w-8 flex items-center justify-center rounded-full border-2 border-white/30 bg-transparent text-white/60 hover:text-white"
        >
          +
        </button>
      </SpotlightCard>
    </div>
  )
}

export default TabBar
