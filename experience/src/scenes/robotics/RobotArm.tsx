import { useGLTF } from '@react-three/drei'
import { Suspense, useMemo } from 'react'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'
import { careerChapters } from '@/data/careerChapters'
import { useShotTuner } from '@/components/experience/ShotTunerContext'

/** Place robot GLB at: experience/public/models/robot.glb */
export const ROBOT_MODEL_URL = `${import.meta.env.BASE_URL}models/robot.glb`

const PLINTH_TOP = 0.1

/** On-screen height in world units (native model height ≈ 2.68) */
export const ROBOT_TARGET_HEIGHT = 3.267

type Props = {
  accent?: string
  forceProcedural?: boolean
}

/**
 * industrial_robot.glb is a Sketchfab *skinned* ABB arm.
 * Object3D.clone() breaks the skeleton — scale then does nothing to the mesh.
 * SkeletonUtils.clone() keeps skinning intact so root.scale actually works.
 *
 * Do NOT use <Center>: the arm AABB is skewed by the outstretched limb, which
 * slides the pedestal off the bay pad. Anchor on the root joint instead.
 */
function prepareSkinnedRobot(source: THREE.Object3D, targetHeight: number) {
  const root = SkeletonUtils.clone(source)

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.castShadow = true
    mesh.receiveShadow = false
    mesh.frustumCulled = false
    if (!mesh.material) return
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    mats.forEach((m) => {
      const std = m as THREE.MeshStandardMaterial
      if ('envMapIntensity' in std) std.envMapIntensity = 1.2
      if ('metalness' in std && std.metalness < 0.2) {
        std.metalness = Math.min(0.65, std.metalness + 0.28)
      }
      if ('roughness' in std) {
        std.roughness = Math.max(0.22, Math.min(0.7, std.roughness))
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
  root.scale.setScalar(targetHeight / (nativeSize.y || 1))
  root.updateMatrixWorld(true)

  // Prefer the armature root for XZ (true pedestal). Fall back to AABB.
  const base = new THREE.Vector3()
  let foundBase = false
  root.traverse((obj) => {
    if (foundBase) return
    if ((obj as THREE.Bone).isBone && (obj.name === 'Bone0_00' || obj.name === '_rootJoint')) {
      obj.getWorldPosition(base)
      foundBase = true
    }
  })
  if (!foundBase) {
    const box = new THREE.Box3().setFromObject(root)
    box.getCenter(base)
    base.y = 0
  }

  const grounded = new THREE.Box3().setFromObject(root)
  root.position.set(-base.x, -grounded.min.y + PLINTH_TOP + 0.02, -base.z)
  root.updateMatrixWorld(true)

  return root
}

function RobotGlbModel() {
  const { scene } = useGLTF(ROBOT_MODEL_URL, true, true)
  const { enabled: tuning, activeSample, draft, tuneChapterIndex } = useShotTuner()
  const chapter = careerChapters.find((c) => c.id === 'robotics') ?? careerChapters[0]
  const chapterIndex = careerChapters.findIndex((c) => c.id === 'robotics')
  const chapterYaw = chapter.subjectYaw ?? 0.4
  const yaw =
    tuning && tuneChapterIndex === chapterIndex
      ? activeSample
        ? activeSample.subjectYaw
        : (draft.subjectYawDeg * Math.PI) / 180
      : chapterYaw

  const robot = useMemo(
    () => prepareSkinnedRobot(scene, ROBOT_TARGET_HEIGHT),
    [scene, ROBOT_TARGET_HEIGHT],
  )

  return (
    <group rotation={[0, yaw, 0]}>
      <primitive object={robot} />
    </group>
  )
}

function RobotProcedural({ accent = '#e87a20' }: { accent?: string }) {
  const materials = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({
        color: '#c4c8ce',
        metalness: 0.7,
        roughness: 0.28,
      }),
      dark: new THREE.MeshStandardMaterial({
        color: '#2a3038',
        metalness: 0.55,
        roughness: 0.4,
      }),
      accent: new THREE.MeshStandardMaterial({
        color: accent,
        metalness: 0.4,
        roughness: 0.35,
        emissive: accent,
        emissiveIntensity: 0.15,
      }),
    }),
    [accent],
  )

  const scale = ROBOT_TARGET_HEIGHT / 2.6

  return (
    <group position={[0, PLINTH_TOP + 0.02, 0]} scale={scale}>
      <mesh castShadow receiveShadow material={materials.dark} position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.9, 1.05, 0.24, 32]} />
      </mesh>
      <mesh castShadow material={materials.body} position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.38, 0.45, 0.7, 24]} />
      </mesh>
      <mesh castShadow material={materials.body} position={[0, 1.15, 0.15]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[0.45, 0.45, 1.4]} />
      </mesh>
      <mesh castShadow material={materials.body} position={[0, 1.55, 1.15]} rotation={[1.1, 0, 0]}>
        <boxGeometry args={[0.35, 0.35, 1.5]} />
      </mesh>
      <mesh castShadow material={materials.dark} position={[0, 1.05, 2.1]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.55, 0.25, 0.55]} />
      </mesh>
      <mesh castShadow material={materials.accent} position={[0, 0.95, 2.45]}>
        <boxGeometry args={[0.2, 0.12, 0.35]} />
      </mesh>
    </group>
  )
}

export function RobotArm({ accent = '#e87a20', forceProcedural = false }: Props) {
  if (forceProcedural) return <RobotProcedural accent={accent} />

  return (
    <Suspense fallback={null}>
      <RobotGlbModel />
    </Suspense>
  )
}

useGLTF.preload(ROBOT_MODEL_URL, true, true)
