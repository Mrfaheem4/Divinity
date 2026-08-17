import { useEffect, useRef, useState } from 'react'
import SpotlightCard from '../SpotlightCard'
import { handleSearch } from '../../handlers/handleSearch'
import {
  goBack,
  goForward,
  canGoBack as checkCanGoBack,
  canGoForward as checkCanGoForward
} from '../../handlers/handleNavigation'
import Bookmarks from './Bookmarks'
import { useTabStore } from '../../store/tabStore'

function Searchbar({
  onSearch,
  onGoHome
}: {
  onSearch?: (url: string) => void
  onGoHome?: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [canBack, setCanBack] = useState(false)
  const [canForward, setCanForward] = useState(false)

  const activeTabId = useTabStore((s) => s.activeTabId)
  const activeTab = useTabStore((s) => s.tabs.find((t) => t.id === s.activeTabId))
  const isDocked = !(activeTab?.isHome ?? true)
  console.log(
    'Searchbar render — activeTabId:',
    activeTabId,
    'activeTab:',
    activeTab,
    'isDocked:',
    isDocked
  )
  const url = activeTab?.url ?? ''

  useEffect(() => {
    const unsubscribe = window.api.onUrlChanged((url) => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.value = url
      }
      checkCanGoBack().then(setCanBack)
      checkCanGoForward().then(setCanForward)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (inputRef.current) inputRef.current.value = url
  }, [url, activeTabId])

  function handleFocus() {
    inputRef.current?.select()
  }

  function dockAndNavigate(resolvedUrl: string) {
    onSearch?.(resolvedUrl)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      window.api.getCurrentUrl().then((url) => {
        if (inputRef.current) inputRef.current.value = url
      })
      inputRef.current?.blur()
      return
    }
    if (e.key !== 'Enter') return
    const query = e.currentTarget.value.trim()
    if (!query) return
    dockAndNavigate(handleSearch(query))
    inputRef.current?.blur()
  }

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-auto">
      <div
        className={`pointer-events-auto z-20 flex items-center gap-2 ${
          isDocked ? 'fixed top-1 w-[90%] h-9' : 'relative'
        }`}
        style={!isDocked ? { width: '30rem', height: '3rem', marginTop: '20rem' } : undefined}
      >
        {isDocked && (
          <>
            <SpotlightCard
              className="!rounded-full !p-0 shrink-0 w-10 h-8"
              spotlightColor="rgba(255, 255, 255, 0.25)"
            >
              <button
                onClick={() => onGoHome?.()}
                className="w-full h-full flex items-center justify-center rounded-full border-2 border-white/50 bg-transparent"
              >
                <img src="./icons/home.svg" className="w-4 h-4" alt="home" />
              </button>
            </SpotlightCard>
            <SpotlightCard
              className="!rounded-full !p-0 shrink-0 w-10 h-8"
              spotlightColor="rgba(255, 255, 255, 0.25)"
            >
              <button
                onClick={() => goBack()}
                disabled={!canBack}
                className="w-full h-full flex items-center justify-center rounded-full border-2 border-white/50 bg-transparent"
              >
                <img src="./icons/backward.svg" className="w-4 h-4" alt="back" />
              </button>
            </SpotlightCard>
            <SpotlightCard
              className="!rounded-full !p-0 shrink-0 w-10 h-8"
              spotlightColor="rgba(255, 255, 255, 0.25)"
            >
              <button
                onClick={() => goForward()}
                disabled={!canForward}
                className="w-full h-full flex items-center justify-center rounded-full border-2 border-white/50 bg-transparent"
              >
                <img src="./icons/forward.svg" className="w-4 h-4" alt="forward" />
              </button>
            </SpotlightCard>
          </>
        )}
        <SpotlightCard
          className="w-full h-full !rounded-full !p-0"
          spotlightColor="rgba(255, 255, 255, 0.25)"
        >
          <div className="flex items-center flex-row border-2 border-white/50 w-full h-full rounded-full">
            <img src="./icons/search.svg" className="w-6 h-6 m-1 ml-2" alt="search icon" />
            <input
              ref={inputRef}
              placeholder="Search the Web"
              id="search-input"
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              className="relative z-10 w-full h-full rounded-full border-none bg-transparent px-4 text-sm text-white outline-none"
            />
          </div>
        </SpotlightCard>
      </div>
      {!isDocked && <Bookmarks onSelect={dockAndNavigate} />}
    </div>
  )
}

export default Searchbar
