import { useGLTF, useAnimations, Environment, OrbitControls } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import type { Group, DirectionalLight } from 'three'
import { Object3D } from 'three'
import modelUrl from '../assets/models/star_orb.glb?url'
import { useThree } from '@react-three/fiber'

function Model({ isDocked }: { isDocked: boolean }) {
  // NEW: accept isDocked as a prop
  const group = useRef<Group>(null)
  const { scene, animations } = useGLTF(modelUrl)
  const { actions } = useAnimations(animations, group)
  const actionRef = useRef<any>(null) // NEW: a "box" to remember the action

  useEffect(() => {
    const firstAction = Object.values(actions)[0]
    if (firstAction) {
      firstAction.timeScale = 0.8
      firstAction.play()
      actionRef.current = firstAction // NEW: store it in the box
    }
  }, [actions])

  useEffect(() => {
    // NEW: a second effect, watches isDocked
    if (actionRef.current) {
      actionRef.current.paused = isDocked // NEW: pause/unpause based on isDocked
    }
  }, [isDocked])

  return <primitive ref={group} object={scene} />
}

function CameraAim({ target }: { target: [number, number, number] }) {
  const { camera } = useThree()
  useEffect(() => {
    camera.lookAt(...target)
  }, [camera, target])
  return null
}

function Lights() {
  const light1 = useRef<DirectionalLight>(null!)
  const light2 = useRef<DirectionalLight>(null!)
  const target = useRef<Object3D | null>(null)
  if (target.current === null) {
    target.current = new Object3D()
  }
  const light3 = useRef<DirectionalLight>(null!)

  return (
    <>
      <directionalLight
        ref={light1}
        position={[2, 2, 10]}
        target={target.current}
        intensity={10}
        color="#ffffff"
      />
      <directionalLight
        ref={light2}
        position={[-2, -1, 10]}
        target={target.current}
        intensity={10}
        color="#ffffff"
      />
      <directionalLight
        ref={light3}
        position={[0, 2, 10]}
        target={target.current}
        intensity={10}
        color="#ffffff"
      />
    </>
  )
}

function Background({ isDocked }: { isDocked: boolean }) {
  return (
    <>
      <Lights />
      <Environment files="/hdri/event.hdr" />
      <Model isDocked={isDocked} />
      <CameraAim target={[0, -5.2, 27]} />
      <OrbitControls target={[0, -5.2, 27]} enabled={false} />
    </>
  )
}

export default Background
