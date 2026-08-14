import { useEffect, useState } from 'react' // make sure useEffect is imported
import { Canvas } from '@react-three/fiber'
import Searchbar from './foreground/Searchbar'
import Background from './Background'

function Tab() {
  const [isDocked, setIsDocked] = useState(false)

  // NEW — separate, top-level effect, runs once on mount
  useEffect(() => {
    window.api.getCurrentState().then(({ url, isVisible }) => {
      console.log('restored state:', { url, isVisible })
      if (isVisible && url) {
        setIsDocked(true)
      }
    })
  }, [])

  function handleSearchComplete(url: string) {
    window.api.navigate(url)
  }

  function goHome() {
    window.api.goHome() // tells main process to hide the view
    setIsDocked(false) // Tab's own state — brings back 3D background
  }

  return (
    <div className="relative h-full w-full">
      <div
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
      </div>

      <div className="absolute inset-0 z-10">
        <Searchbar
          onDock={() => setIsDocked(true)}
          onSearch={handleSearchComplete}
          onGoHome={goHome}
        />
      </div>
    </div>
  )
}

export default Tab
