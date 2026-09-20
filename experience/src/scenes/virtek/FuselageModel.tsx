import { useGLTF } from '@react-three/drei'
import { Suspense, useMemo } from 'react'
import * as THREE from 'three'

/** Desktop `airb_fuselage.glb` → experience/public/models/airb_fuselage.glb */
export const FUSELAGE_MODEL_URL = '/models/airb_fuselage.glb'

/** On-screen length along the long (X) axis */
export const FUSELAGE_TARGET_LENGTH = 4.6

/**
 * Native airb_fuselage AABB ≈ 7813 × 5973 × 5971.
 * After length scale these are the bay-space extents (plus plinth clearance).
 */
export const FUSELAGE_LAYOUT = {
  length: FUSELAGE_TARGET_LENGTH,
  /** Approx diameter after scale */
  diameter: (5972.571 / 7813) * FUSELAGE_TARGET_LENGTH,
  plinth: 0.12,
} as const

export const FUSELAGE_CROWN_Y = FUSELAGE_LAYOUT.plinth + FUSELAGE_LAYOUT.diameter
export const FUSELAGE_RADIUS = FUSELAGE_LAYOUT.diameter * 0.5
/** Barrel centerline height (cylinder axis along X) */
export const FUSELAGE_AXIS_Y = FUSELAGE_LAYOUT.plinth + FUSELAGE_RADIUS

const PLINTH_CLEARANCE = FUSELAGE_LAYOUT.plinth

function prepareFuselage(source: THREE.Object3D, targetLength: number) {
  const root = source.clone(true)

  root.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return
    const mesh = obj as THREE.Mesh
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.frustumCulled = false
    if (!mesh.material) return
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    mats.forEach((m) => {
      const std = m as THREE.MeshStandardMaterial
      if ('envMapIntensity' in std) std.envMapIntensity = 1.05
      if ('metalness' in std && std.metalness < 0.15) {
        std.metalness = Math.min(0.45, std.metalness + 0.2)
      }
      if ('roughness' in std) {
        std.roughness = Math.max(0.28, Math.min(0.72, std.roughness))
      }
      std.needsUpdate = true
    })
  })

  root.position.set(0, 0, 0)
  root.rotation.set(0, 0, 0)
  root.scale.set(1, 1, 1)
  root.updateMatrixWorld(true)

  const native = new THREE.Box3().setFromObject(root)
  const nativeSize = native.getSize(new THREE.Vector3())
  root.scale.setScalar(targetLength / (nativeSize.x || 1))
  root.updateMatrixWorld(true)

  const box = new THREE.Box3().setFromObject(root)
  const center = box.getCenter(new THREE.Vector3())
  root.position.set(-center.x, -box.min.y + PLINTH_CLEARANCE, -center.z)
  root.updateMatrixWorld(true)

  return root
}

function FuselageGlb() {
  const { scene } = useGLTF(FUSELAGE_MODEL_URL, true, true)
  const root = useMemo(() => prepareFuselage(scene, FUSELAGE_TARGET_LENGTH), [scene])
  return <primitive object={root} />
}

/** Airbus fuselage section — centered on the Virtek bay pad. */
export function FuselageModel() {
  return (
    <Suspense fallback={null}>
      <FuselageGlb />
    </Suspense>
  )
}

useGLTF.preload(FUSELAGE_MODEL_URL, true, true)
