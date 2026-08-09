import { Canvas } from '@react-three/fiber'
import Background from './Background'

function NewTab() {
  return (
    <div className="relative h-full w-full">
      {/* 3D layer — fills this component's space */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[2, 2, 2]} intensity={1} color="#7C5CFF" />
          <pointLight position={[-2, -1, 2]} intensity={0.5} color="#ffffff" />
          <Background />
        </Canvas>
      </div>

      {/* Foreground content — search bar etc, sits on top */}
      <div className="relative z-10 flex items-center justify-center h-full pointer-events-none">
        {/* search bar will go here later, wrapped in pointer-events-auto */}
      </div>
    </div>
  )
}

export default NewTab
