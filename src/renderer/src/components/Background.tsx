import { useGLTF, useAnimations, Environment, OrbitControls, useHelper } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import type { Group, DirectionalLight } from 'three'
import { Object3D } from 'three'
import { DirectionalLightHelper } from 'three'
import modelUrl from '../assets/models/star_orb.glb?url'

function Model() {
  const group = useRef<Group>(null)
  const { scene, animations } = useGLTF(modelUrl)
  const { actions } = useAnimations(animations, group)

  useEffect(() => {
    const firstAction = Object.values(actions)[0]
    firstAction.timeScale = 0.8
    firstAction?.play()
  }, [actions])

  return <primitive ref={group} object={scene} />
}

function Lights() {
  const light1 = useRef<DirectionalLight>(null!)
  const light2 = useRef<DirectionalLight>(null!)
  const target = useRef(new Object3D())
  const light3 = useRef<DirectionalLight>(null!)

  useHelper(light1 as any, DirectionalLightHelper, 1, '#ffffff')
  useHelper(light2 as any, DirectionalLightHelper, 1, '#ffffff')
  useHelper(light3 as any, DirectionalLightHelper, 1, '#ffffff')

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

function Background() {
  return (
    <>
      <Lights />
      <Environment files="/hdri/event.hdr" />
      <Model />
      <OrbitControls />
    </>
  )
}

export default Background
