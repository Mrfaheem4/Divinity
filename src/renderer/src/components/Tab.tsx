import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Searchbar from './foreground/Searchbar'
import Background from './Background'

function Tab() {
  const [isDocked, setIsDocked] = useState(false)
  const [url, setUrl] = useState('')

  useEffect(() => {
    window.api.getCurrentState().then(({ url, isHome }) => {
      setUrl(url)
      console.log('restored state:', { url, isHome })
      if (!isHome) {
        setIsDocked(true)
      }
    })
  }, [])

  useEffect(() => {
    const unsubscribe = window.api.onTabSwitched(({ url, isHome }) => {
      setUrl(url)
      setIsDocked(!isHome)
    })
    return unsubscribe
  }, [])

  function handleSearchComplete(url: string) {
    window.api.navigate(url)
  }

  function goHome() {
    window.api.goHome()
    setIsDocked(false)
  }

  return (
    <div className="relative h-full w-full">
      <div
        style={{
          position: 'absolute',
          top: 8,
          right: 16,
          zIndex: 50,
          display: 'flex',
          gap: 8,
          padding: '4px 8px',
          borderRadius: '8px'
        }}
      >
        <button className="bg-amber-700" onClick={() => window.api.switchTab('tab1')}>
          Tab 1
        </button>
        <button onClick={() => window.api.switchTab('tab2')}>Tab 2</button>
      </div>

      {/* <div
        className="absolute inset-0 z-0"
        style={{
          opacity: isDocked ? 0 : 1,
          transition: 'opacity 500ms ease',
          pointerEvents: isDocked ? 'none' : 'auto'
        }}
      >
        <Canvas camera={{ position: [0, -5, 30] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[2, 2, 2]} intensity={1} color="#7C5CFF" />
          <pointLight position={[-2, -1, 2]} intensity={0.5} color="#ffffff" />
          <Background isDocked={isDocked} />
        </Canvas>
      </div> */}

      <div className="absolute inset-0 z-10">
        <Searchbar
          isDocked={isDocked}
          onDock={() => setIsDocked(true)}
          onSearch={handleSearchComplete}
          onGoHome={goHome}
          url={url}
        />
      </div>
    </div>
  )
}

export default Tab
