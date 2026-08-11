import { Canvas, useFrame } from '@react-three/fiber'
import Background from './Background'
import { useRef } from 'react'

function NewTab() {
  return (
    <div className="relative h-full w-full">
      {/* 3D layer — fills this component's space */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, -5, 30] }}>
          {' '}
          // Adjusted camera position for better view
          <ambientLight intensity={0.5} />
          <pointLight position={[2, 2, 2]} intensity={1} color="#7C5CFF" />
          <pointLight position={[-2, -1, 2]} intensity={0.5} color="#ffffff" />
          <Background />
        </Canvas>
      </div>
    </div>
  )
}

export default NewTab
