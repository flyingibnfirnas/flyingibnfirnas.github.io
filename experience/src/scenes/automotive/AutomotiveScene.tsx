import { useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FormulaCar } from './FormulaCar'
import { useShotTuner } from '@/components/experience/ShotTunerContext'
import { chapterProgressBounds, HANGAR_CAR_OFFSET, careerChapters } from '@/data/careerChapters'
import { scrollProgress } from '@/lib/scrollStore'
import { BayPad } from '@/scenes/shared/HangarGround'

function DiagnosticNodes({
  accent,
  localRef,
}: {
  accent: string
  localRef: MutableRefObject<number>
}) {
  const group = useRef<THREE.Group>(null)
  const nodes = useMemo(
    () => [
      { pos: [-1.6, 1.2, 0.4] as const, label: 'ECU' },
      { pos: [1.5, 1.0, -0.3] as const, label: 'BUS' },
      { pos: [0.2, 1.6, -1.2] as const, label: 'SENSOR' },
      { pos: [-0.8, 0.9, -1.5] as const, label: 'FAULT' },
    ],
    [],
  )

  useFrame((state) => {
    if (!group.current) return
    const local = localRef.current
    const opacity = Math.min(1, Math.max(0, (local - 0.18) / 0.28))
    group.current.visible = opacity > 0.01 && local < 0.66
    if (opacity <= 0.01) return
    group.current.children.forEach((child, i) => {
      if (i >= nodes.length) return
      const pulse = 0.85 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.15
      child.scale.setScalar(pulse * (0.4 + local * 0.6))
      const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
      if (mat) {
        mat.opacity = opacity
        mat.emissiveIntensity = 0.8 * opacity
      }
    })
  })

  return (
    <group ref={group}>
      {nodes.map((n, i) => (
        <mesh key={n.label} position={[...n.pos]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial
            color={i === 3 ? accent : '#7ec8ff'}
            emissive={i === 3 ? accent : '#3a7aad'}
            emissiveIntensity={0}
            transparent
            opacity={0}
          />
        </mesh>
      ))}
    </group>
  )
}

export function AutomotiveScene() {
  const root = useRef<THREE.Group>(null)
  const localRef = useRef(0)
  const { enabled: tuning, tuneChapterIndex } = useShotTuner()
  const autoIndex = careerChapters.findIndex((c) => c.id === 'automotive')
  const virtekIndex = careerChapters.findIndex((c) => c.id === 'virtek')
  const amdIndex = careerChapters.findIndex((c) => c.id === 'amd')
  const { start, end } = chapterProgressBounds(autoIndex)
  const virtekBounds = chapterProgressBounds(virtekIndex)
  const virtekSpan = virtekBounds.end - virtekBounds.start || 1
  const amdBounds = chapterProgressBounds(amdIndex)
  const span = end - start || 1
  // Stage in during the Virtek truck so the car is on the pad when the camera arrives
  const stageIn = virtekBounds.start + virtekSpan * 0.58
  // Soft clear once the top truck has settled over the rack (same cadence as jet→Virtek)
  const clearAfter = amdBounds.start + (amdBounds.end - amdBounds.start) * 0.12
  const accent = '#e87a20'
  const [ox, oy, oz] = HANGAR_CAR_OFFSET

  useFrame(() => {
    if (!root.current) return
    const progress = scrollProgress.current
    const show = tuning
      ? tuneChapterIndex === autoIndex
      : progress >= stageIn && progress < clearAfter
    root.current.visible = show
    if (!show) return

    localRef.current = Math.min(1, Math.max(0, (progress - start) / span))

    // Keep the car on its bay pad — no port slide (offset must stay aligned with camera path)
    root.current.position.set(ox, oy, oz)
  })

  return (
    <group ref={root} position={[ox, oy, oz]} visible={false}>
      <BayPad accent={accent} ringInner={2.55} ringOuter={2.7} plinthRadius={2.05} plinthRadiusBottom={2.2} />
      <FormulaCar accent={accent} />
      <DiagnosticNodes accent={accent} localRef={localRef} />

      <spotLight
        position={[0, 14, 0]}
        angle={0.45}
        penumbra={0.7}
        intensity={55}
        distance={32}
        color="#fff2e6"
        castShadow
        shadow-mapSize={[512, 512]}
      />
      <spotLight
        position={[3, 8, 5]}
        angle={0.4}
        penumbra={0.65}
        intensity={28}
        distance={24}
        color="#ffd2a8"
      />
      <pointLight position={[-3, 4, -2]} intensity={8} distance={16} color="#6eb6ff" />
    </group>
  )
}
