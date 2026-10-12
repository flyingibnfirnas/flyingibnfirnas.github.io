import { Canvas } from '@react-three/fiber'
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Environment,
} from '@react-three/drei'
import { Suspense, useEffect, useMemo } from 'react'
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

/** Mount only nearby bays so distant GLBs are not decoded up front. */
function shouldMountBay(bayIndex: number, chapterIndex: number) {
  return bayIndex >= chapterIndex - 1 && bayIndex <= chapterIndex + 1
}

export function ExperienceCanvas() {
  const { reducedMotion, webglOk, chapterIndex } = useExperience()
  const bayCount = careerChapters.length

  const mounted = useMemo(() => {
    const flags = Array.from({ length: bayCount }, (_, i) => shouldMountBay(i, chapterIndex))
    // Keep the opening bays warm at the start so the first handoff never pops late
    if (chapterIndex <= 1) {
      flags[0] = true
      if (bayCount > 1) flags[1] = true
    }
    return flags
  }, [bayCount, chapterIndex])

  useEffect(() => {
    preloadAroundChapter(chapterIndex)
  }, [chapterIndex])

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
          toneMappingExposure: 1.0,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <SceneAtmosphere />
        <HangarGround />
        <CameraRig />
        <TuneOrbitControls />
        {mounted[0] ? <AvionicsScene /> : null}
        {mounted[1] ? <RoboticsScene /> : null}
        {mounted[2] ? <F16Scene /> : null}
        {mounted[3] ? <VirtekScene /> : null}
        {mounted[4] ? <AutomotiveScene /> : null}
        {mounted[5] ? <AmdScene /> : null}
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Canvas>
      <div className="cinema-grade" />
    </div>
  )
}
