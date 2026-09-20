import { useMemo } from 'react'
import * as THREE from 'three'
import { HANGAR_CAR_OFFSET, JET_BAY_OFFSET, DRONE_BAY_OFFSET, VIRTEK_BAY_OFFSET, AMD_BAY_OFFSET } from '@/data/careerChapters'

/**
 * One continuous hangar floor for drone → robot → jet → Virtek → car → AMD.
 * Bay pads live with each subject; this mesh never remounts or moves.
 */
export function HangarGround() {
  const materials = useMemo(
    () => ({
      floor: new THREE.MeshStandardMaterial({
        color: '#0a0c10',
        metalness: 0.55,
        roughness: 0.42,
      }),
      mark: new THREE.MeshBasicMaterial({
        color: '#3a4555',
        transparent: true,
        opacity: 0.32,
        toneMapped: false,
      }),
    }),
    [],
  )

  const [dx] = DRONE_BAY_OFFSET
  const [jx] = JET_BAY_OFFSET
  const [vx] = VIRTEK_BAY_OFFSET
  const [cx] = HANGAR_CAR_OFFSET
  const [ax] = AMD_BAY_OFFSET
  const midX = (dx + ax) / 2
  const spanX = Math.abs(ax - dx) + 48

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[midX, 0, 0]} receiveShadow material={materials.floor}>
        <planeGeometry args={[spanX, 100]} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[midX, 0.012, 0]} material={materials.mark}>
        <planeGeometry args={[spanX * 0.92, 0.06]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} material={materials.mark}>
        <planeGeometry args={[0.06, 56]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[jx, 0.012, 0]} material={materials.mark}>
        <planeGeometry args={[0.06, 56]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[vx, 0.012, 0]} material={materials.mark}>
        <planeGeometry args={[0.06, 56]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.012, 0]} material={materials.mark}>
        <planeGeometry args={[0.06, 56]} />
      </mesh>
    </group>
  )
}

/** Small service pad under a subject — no floor, so the shared hangar stays continuous */
export function BayPad({
  accent,
  ringInner = 2.4,
  ringOuter = 2.55,
  plinthRadius = 2.05,
  plinthRadiusBottom = 2.2,
}: {
  accent: string
  ringInner?: number
  ringOuter?: number
  plinthRadius?: number
  plinthRadiusBottom?: number
}) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
        <ringGeometry args={[ringInner, ringOuter, 64]} />
        <meshBasicMaterial color={accent} transparent opacity={0.24} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[plinthRadius, plinthRadiusBottom, 0.1, 48]} />
        <meshStandardMaterial color="#151920" metalness={0.55} roughness={0.45} />
      </mesh>
    </group>
  )
}
