import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { careerChapters } from '@/data/careerChapters'
import { useShotTuner } from '@/components/experience/ShotTunerContext'

/** Place drone GLB at: experience/public/models/drone.glb */
export const DRONE_MODEL_URL = `${import.meta.env.BASE_URL}models/drone.glb`

/** On-screen span (max AABB axis) in world units */
export const DRONE_TARGET_SIZE = 2.85

/** Plinth top ≈ 0.1; hover sits just above */
const HOVER_CLEARANCE = 0.55

type Props = {
  accent?: string
  forceProcedural?: boolean
}

/**
 * Center XZ on the bay origin and rest the lowest point on y=0 before hover lift.
 * Avoid <Center>: this GLB’s AABB is Z-asymmetric and Center+yaw left it off-pad.
 */
function prepareDrone(source: THREE.Object3D, targetSize: number) {
  const root = source.clone(true)

  root.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return
    const mesh = obj as THREE.Mesh
    mesh.castShadow = true
    mesh.receiveShadow = false
    mesh.frustumCulled = false
    if (!mesh.material) return
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    mats.forEach((m) => {
      const std = m as THREE.MeshStandardMaterial
      if ('envMapIntensity' in std) std.envMapIntensity = 1.15
      if ('metalness' in std && std.metalness < 0.25) {
        std.metalness = Math.min(0.65, std.metalness + 0.28)
      }
      if ('roughness' in std) {
        std.roughness = Math.max(0.22, Math.min(0.68, std.roughness))
      }
      std.needsUpdate = true
    })
  })

  root.position.set(0, 0, 0)
  root.rotation.set(0, 0, 0)
  root.scale.set(1, 1, 1)
  root.updateMatrixWorld(true)

  const nativeBox = new THREE.Box3().setFromObject(root)
  const nativeSize = nativeBox.getSize(new THREE.Vector3())
  const maxDim = Math.max(nativeSize.x, nativeSize.y, nativeSize.z) || 1
  root.scale.setScalar(targetSize / maxDim)
  root.updateMatrixWorld(true)

  const box = new THREE.Box3().setFromObject(root)
  const center = box.getCenter(new THREE.Vector3())
  root.position.set(-center.x, -box.min.y + HOVER_CLEARANCE, -center.z)
  root.updateMatrixWorld(true)

  return root
}

function DroneGlbModel() {
  const { scene } = useGLTF(DRONE_MODEL_URL, true, true)
  const yawGroup = useRef<THREE.Group>(null)
  const { enabled: tuning, activeSample, draft, tuneChapterIndex } = useShotTuner()
  const chapter = careerChapters.find((c) => c.id === 'avionics') ?? careerChapters[0]
  const chapterIndex = careerChapters.findIndex((c) => c.id === 'avionics')
  const chapterYaw = chapter.subjectYaw ?? 0.35

  const drone = useMemo(() => prepareDrone(scene, DRONE_TARGET_SIZE), [scene])

  useFrame(() => {
    if (!yawGroup.current) return
    const yaw =
      tuning && tuneChapterIndex === chapterIndex
        ? activeSample
          ? activeSample.subjectYaw
          : (draft.subjectYawDeg * Math.PI) / 180
        : chapterYaw
    yawGroup.current.rotation.y = yaw + Math.PI
  })

  return (
    <group ref={yawGroup}>
      <primitive object={drone} />
    </group>
  )
}

/** Stylized quadrotor if drone.glb is missing. */
function DroneProcedural({ accent = '#e87a20' }: { accent?: string }) {
  const materials = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({
        color: '#2a3038',
        metalness: 0.65,
        roughness: 0.32,
      }),
      arm: new THREE.MeshStandardMaterial({
        color: '#9aa3ad',
        metalness: 0.7,
        roughness: 0.28,
      }),
      prop: new THREE.MeshStandardMaterial({
        color: '#1a1e24',
        metalness: 0.4,
        roughness: 0.55,
      }),
      accent: new THREE.MeshStandardMaterial({
        color: accent,
        metalness: 0.4,
        roughness: 0.35,
        emissive: accent,
        emissiveIntensity: 0.18,
      }),
    }),
    [accent],
  )

  const arm = (yaw: number) => (
    <group rotation={[0, yaw, 0]}>
      <mesh castShadow material={materials.arm} position={[0.85, 0, 0]}>
        <boxGeometry args={[1.1, 0.08, 0.12]} />
      </mesh>
      <mesh castShadow material={materials.body} position={[1.4, 0.06, 0]}>
        <cylinderGeometry args={[0.14, 0.16, 0.12, 16]} />
      </mesh>
      <mesh material={materials.prop} position={[1.4, 0.14, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.9, 0.02, 0.08]} />
      </mesh>
      <mesh material={materials.prop} position={[1.4, 0.14, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.9, 0.02, 0.08]} />
      </mesh>
    </group>
  )

  return (
    <group position={[0, HOVER_CLEARANCE + 0.3, 0]}>
      <mesh castShadow material={materials.body}>
        <boxGeometry args={[0.7, 0.22, 0.7]} />
      </mesh>
      <mesh castShadow material={materials.accent} position={[0, 0.14, 0]}>
        <boxGeometry args={[0.35, 0.06, 0.35]} />
      </mesh>
      <mesh castShadow material={materials.body} position={[0, -0.28, 0]}>
        <boxGeometry args={[0.2, 0.35, 0.2]} />
      </mesh>
      {arm(0)}
      {arm(Math.PI / 2)}
      {arm(Math.PI)}
      {arm((3 * Math.PI) / 2)}
    </group>
  )
}

export function DroneAircraft({ accent = '#e87a20', forceProcedural = false }: Props) {
  if (forceProcedural) return <DroneProcedural accent={accent} />

  return (
    <Suspense fallback={null}>
      <DroneGlbModel />
    </Suspense>
  )
}

useGLTF.preload(DRONE_MODEL_URL, true, true)
