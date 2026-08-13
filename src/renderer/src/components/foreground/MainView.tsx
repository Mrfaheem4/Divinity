import { useEffect, useRef } from 'react'

function MainView() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const updateBounds = (): void => {
      const rect = el.getBoundingClientRect()
      window.api.setViewBounds({
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      })
    }

    updateBounds()

    const resizeObserver = new ResizeObserver(updateBounds)
    resizeObserver.observe(el)
    window.addEventListener('resize', updateBounds)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateBounds)
    }
  }, [])

  return <div ref={containerRef} className="absolute inset-0" />
}

export default MainView
