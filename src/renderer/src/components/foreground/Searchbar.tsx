import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import SpotlightCard from '../SpotlightCard'
import { handleSearch } from '../../handlers/handleSearch'

function Searchbar({ onDock, onSearch }: { onSearch?: (url: string) => void; onDock: () => void }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDocked, setIsDocked] = useState(false)

  // keep the bar in sync with wherever the view actually navigates to
  useEffect(() => {
    const unsubscribe = window.api.onUrlChanged((url) => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.value = url
      }
    })
    return unsubscribe
  }, [])

  function handleFocus() {
    // select-all on focus, like a real address bar — makes re-searching one keystroke away
    inputRef.current?.select()
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
    if (!query || !wrapperRef.current) return

    const resolvedUrl = handleSearch(query)

    if (!isDocked) {
      setIsDocked(true)
      onDock?.()

      const rect = wrapperRef.current.getBoundingClientRect()
      const targetTop = 12
      const deltaY = targetTop - rect.top

      animate(wrapperRef.current, {
        translateY: deltaY,
        width: '90%',
        height: '3rem',
        duration: 500,
        ease: 'outExpo',
        onComplete: () => onSearch?.(resolvedUrl)
      })
    } else {
      onSearch?.(resolvedUrl)
    }

    inputRef.current?.blur()
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div
        ref={wrapperRef}
        className="pointer-events-auto"
        style={{ width: '30rem', height: '3rem', marginTop: '20rem' }}
      >
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
    </div>
  )
}

export default Searchbar
