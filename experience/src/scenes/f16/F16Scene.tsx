import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { F16Aircraft } from './F16Aircraft'
import { useShotTuner } from '@/components/experience/ShotTunerContext'
import { chapterProgressBounds, careerChapters, JET_BAY_OFFSET } from '@/data/careerChapters'
import { scrollProgress } from '@/lib/scrollStore'
import { BayPad } from '@/scenes/shared/HangarGround'

function JetBayMarks({ accent }: { accent: string }) {
  const markDim = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#3a4555',
        transparent: true,
        opacity: 0.28,
        toneMapped: false,
      }),
    [],
  )

  return (
    <group>
      <BayPad accent={accent} ringInner={4.2} ringOuter={4.35} plinthRadius={2.8} plinthRadiusBottom={3.0} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.021, 0]}>
        <ringGeometry args={[2.55, 2.62, 64]} />
        <meshBasicMaterial color="#6a7788" transparent opacity={0.2} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 0]} material={markDim}>
        <planeGeometry args={[0.07, 18]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 0]} material={markDim}>
        <planeGeometry args={[18, 0.05]} />
      </mesh>
    </group>
  )
}

function CinematicLights({ accent }: { accent: string }) {
  return (
    <group>
      <spotLight
        position={[1.5, 11, 5]}
        angle={0.32}
        penumbra={0.55}
        intensity={80}
        distance={40}
        castShadow
        color="#fff2e6"
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.0002}
      />
      <spotLight
        position={[-8, 7, -3]}
        angle={0.38}
        penumbra={0.75}
        intensity={40}
        distance={34}
        color="#a8c0d8"
      />
      <spotLight
        position={[9, 6, 2]}
        angle={0.36}
        penumbra={0.7}
        intensity={28}
        distance={30}
        color="#d7e2ee"
      />
      <pointLight position={[0, 0.9, 4]} intensity={2} distance={12} color="#6f849c" />
      <Sparkles
        count={10}
        scale={[9, 7, 9]}
        position={[0.3, 4, 1.2]}
        size={1.3}
        speed={0.08}
        opacity={0.16}
        color="#f2ebe0"
      />
      <spotLight
        position={[7, 4, -8]}
        angle={0.3}
        penumbra={0.7}
        intensity={18}
        distance={26}
        color={accent}
      />
    </group>
  )
}

export function F16Scene() {
  const root = useRef<THREE.Group>(null)
  const bob = useRef<THREE.Group>(null)
  const { enabled: tuning, tuneChapterIndex } = useShotTuner()
  const f16Index = careerChapters.findIndex((c) => c.id === 'f16')
  const robotIndex = careerChapters.findIndex((c) => c.id === 'robotics')
  const virtekIndex = careerChapters.findIndex((c) => c.id === 'virtek')
  const { start, end } = chapterProgressBounds(f16Index)
  const robotBounds = chapterProgressBounds(robotIndex)
  const virtekStart = chapterProgressBounds(virtekIndex).start
  const robotSpan = robotBounds.end - robotBounds.start || 1
  const stageIn = robotBounds.start + robotSpan * 0.58
  // Clear after Virtek’s first hold (not at the car)
  const clearAfter = virtekStart + (chapterProgressBounds(virtekIndex).end - virtekStart) * 0.11
  const [jx, jy, jz] = JET_BAY_OFFSET
  const accent = '#e87a20'

  useFrame(() => {
    if (!root.current) return
    const progress = scrollProgress.current
    const show = tuning ? tuneChapterIndex === f16Index : progress >= stageIn && progress < clearAfter
    root.current.visible = show
    if (!show) return

    const exitT = tuning
      ? 0
      : Math.min(1, Math.max(0, (progress - (virtekStart - (end - start) * 0.08)) / ((end - start) * 0.08 || 1)))
    root.current.position.set(jx - exitT * 3.5, jy, jz)

    if (bob.current) {
      const local = Math.min(1, Math.max(0, (progress - start) / (end - start || 1)))
      const groupY = progress >= start ? 0.12 + Math.sin(Math.min(local, 0.9) * Math.PI) * 0.03 : 0.12
      bob.current.position.y = groupY
    }
  })

  return (
    <group ref={root} position={[jx, jy, jz]} visible={false}>
      <JetBayMarks accent={accent} />
      <CinematicLights accent={accent} />
      <group ref={bob} position={[0, 0.12, 0]}>
        <F16Aircraft accent={accent} />
      </group>
    </group>
  )
}
