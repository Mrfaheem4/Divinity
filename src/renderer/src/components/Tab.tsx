import { Canvas } from '@react-three/fiber'
import Searchbar from './foreground/Searchbar'
import { useState } from 'react'
import Background from './Background'

function Tab() {
  const [isDocked, setIsDocked] = useState(false)

  function handleSearchComplete(url: string) {
    window.api.navigate(url)
  }

  return (
    <div className="relative h-full w-full">
      {/* 3D layer */}
      <div
        className="absolute inset-0 z-0"
        style={{
          opacity: isDocked ? 0 : 1, // NEW: fade out when docked
          transition: 'opacity 500ms ease', // NEW: smooth fade instead of a snap
          pointerEvents: isDocked ? 'none' : 'auto' // NEW: can't click through it once hidden... or into it
        }}
      >
        <Canvas camera={{ position: [0, -5, 30] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[2, 2, 2]} intensity={1} color="#7C5CFF" />
          <pointLight position={[-2, -1, 2]} intensity={0.5} color="#ffffff" />
          <Background isDocked={isDocked} />
        </Canvas>
      </div>

      {/* UI layer */}
      <div className="absolute inset-0 z-10">
        <Searchbar onDock={() => setIsDocked(true)} onSearch={handleSearchComplete} />
      </div>
    </div>
  )
}

export default Tab
