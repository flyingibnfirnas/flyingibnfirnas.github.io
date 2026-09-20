import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { ServerRack } from './ServerRack'
import { useShotTuner } from '@/components/experience/ShotTunerContext'
import { AMD_BAY_OFFSET, careerChapters, chapterProgressBounds } from '@/data/careerChapters'
import { scrollProgress } from '@/lib/scrollStore'
import { BayPad } from '@/scenes/shared/HangarGround'

export function AmdScene() {
  const root = useRef<THREE.Group>(null)
  const pulse = useRef<THREE.Group>(null)
  const { enabled: tuning, tuneChapterIndex } = useShotTuner()
  const amdIndex = careerChapters.findIndex((c) => c.id === 'amd')
  const autoIndex = careerChapters.findIndex((c) => c.id === 'automotive')
  const autoBounds = chapterProgressBounds(autoIndex)
  const { start: amdStart, end: amdEnd } = chapterProgressBounds(amdIndex)
  const autoSpan = autoBounds.end - autoBounds.start || 1
  // Stage in as the car rises to the top hold — rack is lit for the hangar truck
  const stageIn = autoBounds.start + autoSpan * 0.66
  const [ax, ay, az] = AMD_BAY_OFFSET
  const accent = '#e87a20'

  useFrame((state) => {
    if (!root.current) return
    const progress = scrollProgress.current
    const show = tuning ? tuneChapterIndex === amdIndex : progress >= stageIn
    root.current.visible = show
    if (!show) return

    if (pulse.current) {
      const local = Math.min(1, Math.max(0, (progress - amdStart) / (amdEnd - amdStart || 1)))
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.8) * 0.008 * (0.4 + local * 0.6)
      pulse.current.scale.setScalar(s)
    }
  })

  return (
    <group ref={root} position={[ax, ay, az]} visible={false}>
      <BayPad accent={accent} ringInner={2.2} ringOuter={2.35} plinthRadius={1.75} plinthRadiusBottom={1.9} />
      <group ref={pulse}>
        <ServerRack />
      </group>

      <spotLight
        position={[2.5, 9, 4]}
        angle={0.42}
        penumbra={0.7}
        intensity={48}
        distance={28}
        color="#e8eef5"
        castShadow
        shadow-mapSize={[512, 512]}
      />
      <spotLight
        position={[-3, 6, -2]}
        angle={0.45}
        penumbra={0.75}
        intensity={22}
        distance={22}
        color="#6eb6ff"
      />
      <pointLight position={[0.4, 2.2, 1.6]} intensity={6} distance={12} color="#39ff6a" />
    </group>
  )
}
