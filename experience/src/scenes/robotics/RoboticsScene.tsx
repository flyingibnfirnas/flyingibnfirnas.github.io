import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { RobotArm } from './RobotArm'
import { useShotTuner } from '@/components/experience/ShotTunerContext'
import { careerChapters, chapterProgressBounds } from '@/data/careerChapters'
import { scrollProgress } from '@/lib/scrollStore'
import { BayPad } from '@/scenes/shared/HangarGround'

function LabLights() {
  return (
    <group>
      <spotLight
        position={[4, 12, 6]}
        angle={0.4}
        penumbra={0.65}
        intensity={70}
        distance={36}
        castShadow
        color="#fff2e6"
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.0002}
      />
      <spotLight
        position={[-7, 8, -3]}
        angle={0.45}
        penumbra={0.75}
        intensity={32}
        distance={30}
        color="#9eb6d4"
      />
      <pointLight position={[0, 2, 5]} intensity={5} distance={14} color="#7a8fa8" />
      <Sparkles
        count={8}
        scale={[8, 5, 8]}
        position={[0, 3.2, 0]}
        size={1.2}
        speed={0.08}
        opacity={0.14}
        color="#e8eef5"
      />
    </group>
  )
}

export function RoboticsScene() {
  const group = useRef<THREE.Group>(null)
  const { enabled: tuning, tuneChapterIndex } = useShotTuner()
  const robotIndex = careerChapters.findIndex((c) => c.id === 'robotics')
  const avionicsIndex = careerChapters.findIndex((c) => c.id === 'avionics')
  const f16Index = careerChapters.findIndex((c) => c.id === 'f16')
  const droneBounds = chapterProgressBounds(avionicsIndex)
  const { start: f16Start, end: f16End } = chapterProgressBounds(f16Index)
  const droneSpan = droneBounds.end - droneBounds.start || 1
  // Stage in during the drone truck so the arm is already on the pad when the
  // camera arrives — same cadence as the jet during the robot→F-16 truck.
  const stageIn = droneBounds.start + droneSpan * 0.58
  const clearAfter = f16Start + (f16End - f16Start) * 0.11
  const accent = '#e87a20'

  useFrame(() => {
    if (!group.current) return
    const progress = scrollProgress.current
    const show = tuning
      ? tuneChapterIndex === robotIndex
      : progress >= stageIn && progress < clearAfter
    group.current.visible = show
  })

  return (
    <group ref={group} visible={false}>
      <BayPad accent={accent} ringInner={2.2} ringOuter={2.32} plinthRadius={1.6} plinthRadiusBottom={1.75} />
      <LabLights />
      <RobotArm accent={accent} />
    </group>
  )
}
