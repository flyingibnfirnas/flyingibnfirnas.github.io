import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * Lightweight stand-in while a bay’s GLB streams in — keeps the pad from reading empty.
 */
export function BaySilhouette({
  kind,
  accent = '#e87a20',
}: {
  kind: 'fuselage' | 'server'
  accent?: string
}) {
  const materials = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({
        color: '#1a1f28',
        metalness: 0.45,
        roughness: 0.52,
      }),
      accent: new THREE.MeshStandardMaterial({
        color: accent,
        metalness: 0.35,
        roughness: 0.4,
        emissive: accent,
        emissiveIntensity: 0.18,
      }),
    }),
    [accent],
  )

  if (kind === 'fuselage') {
    return (
      <group>
        <mesh castShadow material={materials.body} position={[0, 1.15, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.9, 1.0, 4.0, 28]} />
        </mesh>
        <mesh material={materials.accent} position={[0, 2.05, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.92, 0.92, 0.08, 28]} />
        </mesh>
      </group>
    )
  }

  return (
    <group position={[0, 0.1, 0]}>
      <mesh castShadow material={materials.body} position={[0, 1.15, 0]}>
        <boxGeometry args={[0.95, 2.2, 0.72]} />
      </mesh>
      <mesh castShadow material={materials.body} position={[0.85, 0.55, 0.1]}>
        <boxGeometry args={[0.55, 1.0, 0.45]} />
      </mesh>
      {[0.45, 0.85, 1.25, 1.65].map((y) => (
        <mesh key={y} material={materials.accent} position={[-0.42, y, 0.37]}>
          <boxGeometry args={[0.08, 0.12, 0.02]} />
        </mesh>
      ))}
    </group>
  )
}
