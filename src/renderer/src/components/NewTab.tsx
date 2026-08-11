import { Canvas } from '@react-three/fiber'
import Searchbar from './foreground/Searchbar'
import Background from './Background'

function NewTab() {
  return (
    <div className="relative h-full w-full">
      {/* 3D layer */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, -5, 30] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[2, 2, 2]} intensity={1} color="#7C5CFF" />
          <pointLight position={[-2, -1, 2]} intensity={0.5} color="#ffffff" />
          <Background />
        </Canvas>
      </div>

      {/* UI layer — sibling, not nested inside the 3D layer */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div className="translate-y-40 pointer-events-auto">
          <Searchbar />
        </div>
      </div>
    </div>
  )
}

export default NewTab
