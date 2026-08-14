// renderer/src/components/foreground/Bookmarks.tsx
import { useEffect, useState } from 'react'
import SpotlightCard from '../SpotlightCard'

interface Bookmark {
  label: string
  url: string
}

const DEFAULT_BOOKMARKS: Bookmark[] = [
  { label: 'YouTube', url: 'https://youtube.com' },
  { label: 'GitHub', url: 'https://github.com' }
]

function faviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
  } catch {
    return ''
  }
}

function Bookmarks({ onSelect }: { onSelect: (url: string) => void }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  useEffect(() => {
    window.api.getBookmarks().then((stored) => {
      setBookmarks(stored.length > 0 ? stored : DEFAULT_BOOKMARKS)
    })
  }, [])

  return (
    <div className="pointer-events-auto flex items-center gap-5 mt-8">
      {bookmarks.map((bookmark) => (
        <SpotlightCard
          key={bookmark.url}
          className="!rounded-4xl !p-0 shrink-0 group relative"
          spotlightColor="rgba(255, 255, 255, 0.25)"
        >
          <button
            onClick={() => onSelect(bookmark.url)}
            className="flex flex-col items-center gap-2 h-25 w-24 rounded-4xl border-2 border-white/20 bg-transparent px-2 py-3 text-white transition-colors hover:bg-white/5"
          >
            <img
              src={faviconUrl(bookmark.url)}
              className="h-12 w-12 rounded-xl object-cover"
              alt=""
            />
            <span className="text-xs text-white/80 truncate w-full text-center">
              {bookmark.label}
            </span>
          </button>
        </SpotlightCard>
      ))}
    </div>
  )
}

export default Bookmarks
