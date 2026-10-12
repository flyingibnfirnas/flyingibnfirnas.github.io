import { Canvas } from '@react-three/fiber'
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Environment,
} from '@react-three/drei'
import { Suspense, useEffect, useState } from 'react'
import * as THREE from 'three'
import { CameraRig } from './CameraRig'
import { TuneOrbitControls } from './TuneOrbitControls'
import { useExperience } from './ExperienceContext'
import { F16Scene } from '@/scenes/f16/F16Scene'
import { AutomotiveScene } from '@/scenes/automotive/AutomotiveScene'
import { RoboticsScene } from '@/scenes/robotics/RoboticsScene'
import { AvionicsScene } from '@/scenes/avionics/AvionicsScene'
import { VirtekScene } from '@/scenes/virtek/VirtekScene'
import { AmdScene } from '@/scenes/amd/AmdScene'
import { HangarGround } from '@/scenes/shared/HangarGround'
import { preloadAroundChapter } from '@/lib/preloadModels'
import { careerChapters } from '@/data/careerChapters'

function SceneAtmosphere() {
  return (
    <>
      {/* Mid pass — readable but still cinematic (rollback: _checkpoint_pre_brighter_hangar) */}
      <color attach="background" args={['#07090e']} />
      <fog attach="fog" args={['#07090e', 20, 120]} />
      <ambientLight intensity={0.3} />
      <hemisphereLight args={['#7e93a8', '#0a0c10', 0.4]} />
      {/* Own Suspense — HDR must never blank the whole canvas */}
      <Suspense fallback={null}>
        <Environment preset="night" resolution={128} frames={1} environmentIntensity={0.55} />
      </Suspense>
    </>
  )
}

const SCENE_BY_BAY = [
  AvionicsScene,
  RoboticsScene,
  F16Scene,
  VirtekScene,
  AutomotiveScene,
  AmdScene,
] as const

export function ExperienceCanvas() {
  const { reducedMotion, webglOk, chapterIndex, localProgress } = useExperience()
  const bayCount = careerChapters.length

  // Sticky mount: once a bay is needed, keep it mounted so GLB decode never
  // hits mid-scroll (that was freezing Lenis and causing jump-cuts).
  const [mounted, setMounted] = useState(() => {
    const flags = Array.from({ length: bayCount }, () => false)
    flags[0] = true
    if (bayCount > 1) flags[1] = true
    return flags
  })

  useEffect(() => {
    // Mount / preload further ahead as the chapter progresses
    const ahead = localProgress > 0.55 ? 2 : localProgress > 0.25 ? 2 : 1
    preloadAroundChapter(chapterIndex, ahead)

    setMounted((prev) => {
      let changed = false
      const next = prev.slice()
      const start = Math.max(0, chapterIndex - 1)
      const end = Math.min(bayCount - 1, chapterIndex + ahead)
      for (let i = start; i <= end; i++) {
        if (!next[i]) {
          next[i] = true
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [bayCount, chapterIndex, localProgress])

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
        dpr={reducedMotion ? [1, 1] : [1, 1.35]}
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
          toneMappingExposure: 1.0,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <SceneAtmosphere />
        <HangarGround />
        <CameraRig />
        <TuneOrbitControls />
        {SCENE_BY_BAY.map((Scene, i) => (mounted[i] ? <Scene key={careerChapters[i].id} /> : null))}
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Canvas>
      <div className="cinema-grade" />
    </div>
  )
}
