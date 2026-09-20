import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { careerChapters } from '@/data/careerChapters'
import { useShotTuner } from '@/components/experience/ShotTunerContext'

/** Desktop `server_rack_and_console_v3.glb` → experience/public/models/server_rack.glb */
export const SERVER_MODEL_URL = `${import.meta.env.BASE_URL}models/server_rack.glb`

/** On-screen rack height */
const SERVER_TARGET_HEIGHT = 4.2
const PLINTH_CLEARANCE = 0.08

function prepareServer(source: THREE.Object3D, targetHeight: number) {
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
      if ('envMapIntensity' in std) std.envMapIntensity = 1.15
      if ('metalness' in std && std.metalness < 0.2) {
        std.metalness = Math.min(0.55, std.metalness + 0.25)
      }
      if ('roughness' in std) {
        std.roughness = Math.max(0.28, Math.min(0.7, std.roughness))
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
  root.scale.setScalar(targetHeight / (nativeSize.y || 1))
  root.updateMatrixWorld(true)

  // Center on the bay pad (XZ) and sit on the plinth — before yaw so rotation stays on-axis
  const box = new THREE.Box3().setFromObject(root)
  const center = box.getCenter(new THREE.Vector3())
  root.position.set(-center.x, -box.min.y + PLINTH_CLEARANCE, -center.z)
  root.updateMatrixWorld(true)

  return root
}

function ServerGlb() {
  const { scene } = useGLTF(SERVER_MODEL_URL, true, true)
  const root = useMemo(() => prepareServer(scene, SERVER_TARGET_HEIGHT), [scene])
  const yawGroup = useRef<THREE.Group>(null)
  const { enabled: tuning, activeSample, draft, tuneChapterIndex } = useShotTuner()
  const chapterYaw = careerChapters.find((c) => c.id === 'amd')?.subjectYaw ?? 0.6519
  const amdIndex = careerChapters.findIndex((c) => c.id === 'amd')

  useFrame(() => {
    if (!yawGroup.current) return
    const base =
      tuning && tuneChapterIndex === amdIndex
        ? activeSample
          ? activeSample.subjectYaw
          : (draft.subjectYawDeg * Math.PI) / 180
        : chapterYaw
    // 90° clockwise from the car’s facing (negative Y is CW when viewed from above)
    yawGroup.current.rotation.y = base - Math.PI / 2
  })

  return (
    <group ref={yawGroup}>
      <primitive object={root} />
    </group>
  )
}

/** AMD bay hero — server rack + console from Desktop. */
export function ServerRack() {
  return (
    <Suspense fallback={null}>
      <ServerGlb />
    </Suspense>
  )
}

useGLTF.preload(SERVER_MODEL_URL, true, true)
