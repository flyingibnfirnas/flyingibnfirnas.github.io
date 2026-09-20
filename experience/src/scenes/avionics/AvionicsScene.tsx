import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { DroneAircraft } from './DroneAircraft'
import { useShotTuner } from '@/components/experience/ShotTunerContext'
import { careerChapters, chapterProgressBounds, DRONE_BAY_OFFSET } from '@/data/careerChapters'
import { scrollProgress } from '@/lib/scrollStore'
import { BayPad } from '@/scenes/shared/HangarGround'

function AvionicsLights() {
  return (
    <group>
      <spotLight
        position={[3, 11, 5]}
        angle={0.4}
        penumbra={0.65}
        intensity={65}
        distance={34}
        castShadow
        color="#fff2e6"
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.0002}
      />
      <spotLight
        position={[-6, 7, -2]}
        angle={0.42}
        penumbra={0.75}
        intensity={28}
        distance={28}
        color="#9eb6d4"
      />
      <pointLight position={[0, 2.2, 4]} intensity={4} distance={14} color="#7a8fa8" />
      <Sparkles
        count={8}
        scale={[7, 5, 7]}
        position={[0, 2.8, 0]}
        size={1.1}
        speed={0.08}
        opacity={0.14}
        color="#e8eef5"
      />
    </group>
  )
}

/**
 * Keep the drone up through the Master's early close-ups (camera path carries
 * it out of frame). Same cadence as robot→jet: clear well after the handoff.
 */
export function AvionicsScene() {
  const root = useRef<THREE.Group>(null)
  const bob = useRef<THREE.Group>(null)
  const { enabled: tuning, tuneChapterIndex } = useShotTuner()
  const avionicsIndex = careerChapters.findIndex((c) => c.id === 'avionics')
  const robotIndex = careerChapters.findIndex((c) => c.id === 'robotics')
  const { start: aviStart, end: aviEnd } = chapterProgressBounds(avionicsIndex)
  const { start: robotStart, end: robotEnd } = chapterProgressBounds(robotIndex)
  // After Master's shot-2 hold — drone has left the south-side truck framing
  const clearAfter = robotStart + (robotEnd - robotStart) * 0.22
  const [dx, dy, dz] = DRONE_BAY_OFFSET
  const accent = '#e87a20'

  useFrame((state) => {
    if (!root.current) return
    const progress = scrollProgress.current
    const show = tuning ? tuneChapterIndex === avionicsIndex : progress < clearAfter
    root.current.visible = show
    if (!show || !bob.current) return
    const local = Math.min(1, Math.max(0, (progress - aviStart) / (aviEnd - aviStart || 1)))
    const hover = Math.sin(state.clock.elapsedTime * 1.85)
    // Stronger hover bob so the float reads clearly in the bay
    bob.current.position.y = 0.12 + hover * 0.14 * (0.55 + local * 0.45)
    bob.current.rotation.z = hover * 0.035
    bob.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.1) * 0.025
  })

  return (
    <group ref={root} position={[dx, dy, dz]}>
      <BayPad accent={accent} ringInner={2.0} ringOuter={2.12} plinthRadius={1.35} plinthRadiusBottom={1.5} />
      <AvionicsLights />
      <group ref={bob}>
        <DroneAircraft accent={accent} />
      </group>
    </group>
  )
}
