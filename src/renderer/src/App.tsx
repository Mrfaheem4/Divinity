import { Canvas } from '@react-three/fiber'
import Background from './components/Background'

function App() {
  return (
    <div className="h-screen w-screen bg-[#282830]">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <Background />
      </Canvas>
    </div>
  )
}

export default App
