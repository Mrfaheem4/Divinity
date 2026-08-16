import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import SpotlightCard from '../SpotlightCard'
import { handleSearch } from '../../handlers/handleSearch'
import {
  goBack,
  goForward,
  canGoBack as checkCanGoBack,
  canGoForward as checkCanGoForward,
  goHome
} from '../../handlers/handleNavigation'
import Bookmarks from './Bookmarks'

function Searchbar({
  onDock,
  onSearch,
  onGoHome,
  isDocked,
  url
}: {
  onSearch?: (url: string) => void
  onDock: () => void
  onGoHome?: () => void
  isDocked: boolean
  url: string
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [canBack, setCanBack] = useState(false)
  const [canForward, setCanForward] = useState(false)

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
    if (inputRef.current) {
      inputRef.current.value = url
    }
  }, [url])

  function handleFocus() {
    inputRef.current?.select()
  }

  function dockAndNavigate(resolvedUrl: string) {
    if (!isDocked && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect()
      const targetTop = 4
      const deltaY = targetTop - rect.top

      onDock?.()

      animate(wrapperRef.current, {
        translateY: deltaY,
        width: '90%',
        height: '2.5rem',
        duration: 500,
        ease: 'outExpo',
        onComplete: () => {
          if (wrapperRef.current) {
            wrapperRef.current.style.transform = ''
            wrapperRef.current.style.width = ''
            wrapperRef.current.style.height = ''
          }
          onSearch?.(resolvedUrl)
        }
      })
    } else {
      onSearch?.(resolvedUrl)
    }
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

  function handleGoHome() {
    onGoHome?.()
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <div
        ref={wrapperRef}
        className={`pointer-events-auto flex items-center gap-2 ${
          isDocked ? 'fixed top-1 w-[90%] h-10' : ''
        }`}
        style={!isDocked ? { width: '30rem', height: '3rem', marginTop: '20rem' } : undefined}
      >
        {isDocked && (
          <>
            <SpotlightCard
              className="!rounded-full !p-0 shrink-0 w-10 h-10"
              spotlightColor="rgba(255, 255, 255, 0.25)"
            >
              <button
                onClick={() => handleGoHome()}

                className="w-full h-full flex items-center justify-center rounded-full border-2 border-white/50 bg-transparent"
              >
                <img src="./icons/home.svg" className="w-4 h-4" alt="forward" />
              </button>
            </SpotlightCard>
            <SpotlightCard
              className="!rounded-full !p-0 shrink-0 w-10 h-10"
              spotlightColor="rgba(255, 255, 255, 0.25)"
            >
              <button
                onClick={() => goBack()}
                disabled={!canBack}
                className="w-full h-full flex items-center justify-center rounded-full border-2 border-white/50 bg-transparent "
              >
                <img src="./icons/backward.svg" className="w-4 h-4" alt="back" />
              </button>
            </SpotlightCard>

            <SpotlightCard
              className="!rounded-full !p-0 shrink-0 w-10 h-10"
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
