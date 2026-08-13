import { useRef, useState } from 'react'
import { animate } from 'animejs'
import SpotlightCard from '../SpotlightCard'

function Searchbar({ onSearch }: { onSearch?: (query: string) => void }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [isDocked, setIsDocked] = useState(false)

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    const query = e.currentTarget.value.trim()
    if (!query || isDocked || !wrapperRef.current) return

    setIsDocked(true)

    const rect = wrapperRef.current.getBoundingClientRect()
    const targetTop = 12 // very top, small gap from window edge
    const deltaY = targetTop - rect.top

    animate(wrapperRef.current, {
      translateY: deltaY,
      width: '90%',
      duration: 500,
      ease: 'outExpo',
      onComplete: () => onSearch?.(query)
    })
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div ref={wrapperRef} className="pointer-events-auto" style={{ width: '30rem' }}>
        <SpotlightCard
          className="w-full h-[3rem] !rounded-full !p-0"
          spotlightColor="rgba(255, 255, 255, 0.25)"
        >
          <div className="flex items-center flex-row border-2 border-white/50 w-full h-full rounded-full">
            <img src="./icons/search.svg" className="w-6 h-6 m-1 ml-2" alt="search icon" />
            <input
              placeholder="Search the Web"
              id="search-input"
              onKeyDown={handleKeyDown}
              className="relative z-10 w-full h-full rounded-full border-none bg-transparent
               px-4 text-sm text-white outline-none"
            />
          </div>
        </SpotlightCard>
      </div>
    </div>
  )
}

export default Searchbar
