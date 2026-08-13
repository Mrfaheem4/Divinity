import { Canvas } from '@react-three/fiber'
import Searchbar from './foreground/Searchbar'

function Tab() {
  return (
    <div className="relative h-full w-full">
      {/* 3D layer */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, -5, 30] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[2, 2, 2]} intensity={1} color="#7C5CFF" />
          <pointLight position={[-2, -1, 2]} intensity={0.5} color="#ffffff" />
        </Canvas>
      </div>

      {/* UI layer */}
      <div className="absolute inset-0 z-10">
        <Searchbar />
      </div>
    </div>
  )
}

export default Tab
