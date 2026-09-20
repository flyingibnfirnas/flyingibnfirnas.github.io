import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { LaserTemplatingRig } from './LaserTemplatingRig'
import { useShotTuner } from '@/components/experience/ShotTunerContext'
import { careerChapters, chapterProgressBounds, VIRTEK_BAY_OFFSET } from '@/data/careerChapters'
import { scrollProgress } from '@/lib/scrollStore'
import { BayPad } from '@/scenes/shared/HangarGround'

export function VirtekScene() {
  const root = useRef<THREE.Group>(null)
  const { enabled: tuning, tuneChapterIndex } = useShotTuner()
  const virtekIndex = careerChapters.findIndex((c) => c.id === 'virtek')
  const f16Index = careerChapters.findIndex((c) => c.id === 'f16')
  const autoIndex = careerChapters.findIndex((c) => c.id === 'automotive')
  const f16Bounds = chapterProgressBounds(f16Index)
  const autoStart = chapterProgressBounds(autoIndex).start
  const f16Span = f16Bounds.end - f16Bounds.start || 1
  // Stage in during the F-16 truck (same cadence as jet during robot truck)
  const stageIn = f16Bounds.start + f16Span * 0.58
  // Clear after the car’s early hold — fuselage has already left the south-side truck frame
  const clearAfter = autoStart + (chapterProgressBounds(autoIndex).end - autoStart) * 0.22
  const [vx, vy, vz] = VIRTEK_BAY_OFFSET
  const accent = '#e87a20'

  useFrame(() => {
    if (!root.current) return
    const progress = scrollProgress.current
    const show = tuning
      ? tuneChapterIndex === virtekIndex
      : progress >= stageIn && progress < clearAfter
    root.current.visible = show
  })

  return (
    <group ref={root} position={[vx, vy, vz]} visible={false}>
      <BayPad accent={accent} ringInner={2.35} ringOuter={2.5} plinthRadius={1.9} plinthRadiusBottom={2.05} />
      <LaserTemplatingRig />
    </group>
  )
}
