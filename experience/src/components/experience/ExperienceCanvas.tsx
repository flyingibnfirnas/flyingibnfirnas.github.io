import { Canvas } from '@react-three/fiber'
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Environment,
  Preload,
  useGLTF,
} from '@react-three/drei'
import { Suspense } from 'react'
import * as THREE from 'three'
import { CameraRig } from './CameraRig'
import { TuneOrbitControls } from './TuneOrbitControls'
import { useExperience } from './ExperienceContext'
import { F16Scene } from '@/scenes/f16/F16Scene'
import { F16_MODEL_URL } from '@/scenes/f16/F16Aircraft'
import { AutomotiveScene } from '@/scenes/automotive/AutomotiveScene'
import { CT5_MODEL_URL } from '@/scenes/automotive/FormulaCar'
import { RoboticsScene } from '@/scenes/robotics/RoboticsScene'
import { ROBOT_MODEL_URL } from '@/scenes/robotics/RobotArm'
import { AvionicsScene } from '@/scenes/avionics/AvionicsScene'
import { DRONE_MODEL_URL } from '@/scenes/avionics/DroneAircraft'
import { VirtekScene } from '@/scenes/virtek/VirtekScene'
import { FUSELAGE_MODEL_URL } from '@/scenes/virtek/FuselageModel'
import { AmdScene } from '@/scenes/amd/AmdScene'
import { SERVER_MODEL_URL } from '@/scenes/amd/ServerRack'
import { HangarGround } from '@/scenes/shared/HangarGround'

useGLTF.preload(DRONE_MODEL_URL, true, true)
useGLTF.preload(ROBOT_MODEL_URL, true, true)
useGLTF.preload(F16_MODEL_URL, true, true)
useGLTF.preload(FUSELAGE_MODEL_URL, true, true)
useGLTF.preload(CT5_MODEL_URL, true, true)
useGLTF.preload(SERVER_MODEL_URL, true, true)

function SceneAtmosphere() {
  return (
    <>
      <color attach="background" args={['#05070b']} />
      <fog attach="fog" args={['#05070b', 18, 110]} />
      <ambientLight intensity={0.22} />
      <hemisphereLight args={['#6d8299', '#08060a', 0.3]} />
      {/* Own Suspense — HDR must never blank the whole canvas */}
      <Suspense fallback={null}>
        <Environment preset="night" resolution={256} frames={1} />
      </Suspense>
    </>
  )
}

export function ExperienceCanvas() {
  const { reducedMotion, webglOk } = useExperience()

  if (!webglOk) {
    return (
      <div className="canvas-fallback">
        <p>WebGL is unavailable in this browser. The classic portfolio still works.</p>
        <a href="/">Return home</a>
      </div>
    )
  }

  return (
    <div className="experience-canvas" aria-hidden="true">
      <Canvas
        dpr={reducedMotion ? [1, 1] : [1, 1.5]}
        shadows={!reducedMotion}
        camera={{ position: [-2.8, 6.4, 9.5], fov: 38, near: 0.1, far: 220 }}
        performance={{ min: 0.5 }}
        gl={{
          antialias: !reducedMotion,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          depth: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.92,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <SceneAtmosphere />
        <HangarGround />
        <CameraRig />
        <TuneOrbitControls />
        <AvionicsScene />
        <RoboticsScene />
        <F16Scene />
        <VirtekScene />
        <AutomotiveScene />
        <AmdScene />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        <Suspense fallback={null}>
          <Preload all />
        </Suspense>
      </Canvas>
      <div className="cinema-grade" />
    </div>
  )
}
