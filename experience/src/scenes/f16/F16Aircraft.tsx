import { Center, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { careerChapters, chapterProgressBounds } from '@/data/careerChapters'
import { sampleCameraPath } from '@/lib/cameraPath'
import { scrollProgress } from '@/lib/scrollStore'
import { useShotTuner } from '@/components/experience/ShotTunerContext'

/** Place a real F-16 GLB at: experience/public/models/f16.glb */
export const F16_MODEL_URL = `${import.meta.env.BASE_URL}models/f16.glb`

type Props = {
  accent?: string
  /** Force procedural placeholder even if GLB exists */
  forceProcedural?: boolean
}

function F16GlbModel() {
  const { scene } = useGLTF(F16_MODEL_URL, true, true)
  const yawGroup = useRef<THREE.Group>(null)
  const { enabled: tuning, activeSample, draft, tuneChapterIndex } = useShotTuner()
  const f16Index = careerChapters.findIndex((c) => c.id === 'f16')
  const { start, end } = chapterProgressBounds(f16Index)
  const chapter = careerChapters.find((c) => c.id === 'f16') ?? careerChapters[0]

  const { cloned, scale } = useMemo(() => {
    const root = scene.clone(true)
    root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh
        // Cast only — receiving on dense GLBs is expensive and barely visible under hangar lights
        mesh.castShadow = true
        mesh.receiveShadow = false
        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
          mats.forEach((m) => {
            const std = m as THREE.MeshStandardMaterial
            if ('envMapIntensity' in std) std.envMapIntensity = 1.1
            if ('metalness' in std && std.metalness < 0.2) {
              std.metalness = Math.min(0.55, std.metalness + 0.25)
            }
            if ('roughness' in std) {
              std.roughness = Math.max(0.25, Math.min(0.7, std.roughness))
            }
            std.needsUpdate = true
          })
        }
      }
    })

    const box = new THREE.Box3().setFromObject(root)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const targetSize = 11.5

    return { cloned: root, scale: targetSize / maxDim }
  }, [scene])

  useFrame(() => {
    if (!yawGroup.current) return
    let yaw = chapter.subjectYaw ?? 0
    if (tuning && tuneChapterIndex === f16Index) {
      yaw = activeSample ? activeSample.subjectYaw : (draft.subjectYawDeg * Math.PI) / 180
    } else {
      const local = Math.min(1, Math.max(0, (scrollProgress.current - start) / (end - start || 1)))
      yaw = sampleCameraPath(chapter.camera, local, chapter.subjectYaw ?? 0).subjectYaw
    }
    yawGroup.current.rotation.y = yaw
  })

  return (
    <Center top>
      <group ref={yawGroup} scale={scale}>
        <primitive object={cloned} />
      </group>
    </Center>
  )
}

/** Stylized fighter placeholder used until f16.glb is present. */
function F16Procedural({ accent = '#e87a20' }: { accent?: string }) {
  const materials = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({
        color: '#9aa3ad',
        metalness: 0.72,
        roughness: 0.28,
      }),
      dark: new THREE.MeshStandardMaterial({
        color: '#2a2f36',
        metalness: 0.55,
        roughness: 0.4,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: '#8ec8e8',
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.55,
        thickness: 0.4,
        transparent: true,
        opacity: 0.85,
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

  return (
    <group rotation={[0, Math.PI * 0.08, 0]} position={[0, 0.35, 0]}>
      <mesh castShadow material={materials.body} rotation={[0, 0, Math.PI / 2]} position={[0, 0.35, 0]}>
        <capsuleGeometry args={[0.38, 4.2, 8, 16]} />
      </mesh>
      <mesh castShadow material={materials.dark} position={[0, 0.35, 2.55]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.38, 1.1, 16]} />
      </mesh>
      <mesh castShadow material={materials.glass} position={[0, 0.78, 0.55]} rotation={[-0.15, 0, 0]}>
        <sphereGeometry args={[0.42, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
      </mesh>
      <mesh castShadow material={materials.body} position={[0, 0.28, -0.2]}>
        <boxGeometry args={[5.6, 0.08, 1.35]} />
      </mesh>
      <mesh castShadow material={materials.accent} position={[0, 0.33, -0.2]}>
        <boxGeometry args={[5.55, 0.02, 0.12]} />
      </mesh>
      <mesh castShadow material={materials.dark} position={[2.7, 0.28, -0.15]}>
        <boxGeometry args={[0.18, 0.45, 0.7]} />
      </mesh>
      <mesh castShadow material={materials.dark} position={[-2.7, 0.28, -0.15]}>
        <boxGeometry args={[0.18, 0.45, 0.7]} />
      </mesh>
      <mesh castShadow material={materials.body} position={[0, 0.45, -2.35]}>
        <boxGeometry args={[2.2, 0.06, 0.7]} />
      </mesh>
      <mesh castShadow material={materials.body} position={[0, 1.05, -2.15]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.08, 1.15, 0.95]} />
      </mesh>
      <mesh castShadow material={materials.accent} position={[0, 1.35, -2.0]}>
        <boxGeometry args={[0.09, 0.12, 0.5]} />
      </mesh>
      <mesh castShadow material={materials.dark} position={[0, -0.05, 0.2]}>
        <boxGeometry args={[0.55, 0.35, 2.4]} />
      </mesh>
      <mesh castShadow material={materials.dark} position={[0, 0.3, -2.85]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.38, 0.55, 16]} />
      </mesh>
      <mesh material={materials.accent} position={[0, 0.3, -3.15]}>
        <circleGeometry args={[0.28, 16]} />
      </mesh>
    </group>
  )
}

export function F16Aircraft({ accent = '#e87a20', forceProcedural = false }: Props) {
  if (forceProcedural) return <F16Procedural accent={accent} />

  return (
    <Suspense fallback={null}>
      <F16GlbModel />
    </Suspense>
  )
}

useGLTF.preload(F16_MODEL_URL, true, true)
