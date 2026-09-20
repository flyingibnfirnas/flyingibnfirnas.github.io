import { Center, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { careerChapters } from '@/data/careerChapters'
import { useShotTuner } from '@/components/experience/ShotTunerContext'

/** Place CT5 GLB at: experience/public/models/ct5.glb */
export const CT5_MODEL_URL = `${import.meta.env.BASE_URL}models/ct5.glb`

type Props = {
  accent?: string
  forceProcedural?: boolean
}

function CT5GlbModel() {
  const { scene } = useGLTF(CT5_MODEL_URL, true, true)
  const yawGroup = useRef<THREE.Group>(null)
  const { enabled: tuning, activeSample, draft, tuneChapterIndex } = useShotTuner()
  const chapterYaw = careerChapters.find((c) => c.id === 'automotive')?.subjectYaw ?? 0.6519
  const autoIndex = careerChapters.findIndex((c) => c.id === 'automotive')

  const { cloned, scale } = useMemo(() => {
    const root = scene.clone(true)
    root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = false
        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
          mats.forEach((m) => {
            const std = m as THREE.MeshStandardMaterial
            if ('envMapIntensity' in std) std.envMapIntensity = 1.25
            if ('metalness' in std && std.metalness < 0.25) {
              std.metalness = Math.min(0.7, std.metalness + 0.3)
            }
            if ('roughness' in std) {
              std.roughness = Math.max(0.2, Math.min(0.65, std.roughness))
            }
            std.needsUpdate = true
          })
        }
      }
    })

    const box = new THREE.Box3().setFromObject(root)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const targetSize = 5.4

    return { cloned: root, scale: targetSize / maxDim }
  }, [scene])

  useFrame(() => {
    if (!yawGroup.current) return
    const yaw =
      tuning && tuneChapterIndex === autoIndex
        ? activeSample
          ? activeSample.subjectYaw
          : (draft.subjectYawDeg * Math.PI) / 180
        : chapterYaw
    yawGroup.current.rotation.y = yaw
  })

  return (
    <group position={[0, 0.22, 0]}>
      <Center top>
        <group ref={yawGroup} scale={scale}>
          <primitive object={cloned} />
        </group>
      </Center>
    </group>
  )
}

/** Stylized placeholder used only if ct5.glb is missing. */
function CarProcedural({ accent = '#e87a20' }: { accent?: string }) {
  const materials = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({
        color: '#1a1d22',
        metalness: 0.72,
        roughness: 0.28,
      }),
      dark: new THREE.MeshStandardMaterial({
        color: '#0c0e12',
        metalness: 0.5,
        roughness: 0.4,
      }),
      accent: new THREE.MeshStandardMaterial({
        color: accent,
        metalness: 0.45,
        roughness: 0.32,
        emissive: accent,
        emissiveIntensity: 0.12,
      }),
      rubber: new THREE.MeshStandardMaterial({
        color: '#111111',
        metalness: 0.1,
        roughness: 0.85,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: '#6a7a88',
        metalness: 0.1,
        roughness: 0.08,
        transmission: 0.45,
        transparent: true,
        opacity: 0.85,
      }),
    }),
    [accent],
  )

  const Wheel = ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
      <mesh castShadow rotation={[0, 0, Math.PI / 2]} material={materials.rubber}>
        <cylinderGeometry args={[0.32, 0.32, 0.22, 24]} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} material={materials.dark}>
        <cylinderGeometry args={[0.16, 0.16, 0.24, 16]} />
      </mesh>
    </group>
  )

  return (
    <group position={[0, 0.32, 0]} rotation={[0, Math.PI * 0.05, 0]}>
      <mesh castShadow material={materials.body} position={[0, 0.35, 0]}>
        <boxGeometry args={[1.85, 0.45, 4.4]} />
      </mesh>
      <mesh castShadow material={materials.body} position={[0, 0.72, -0.15]}>
        <boxGeometry args={[1.7, 0.4, 2.2]} />
      </mesh>
      <mesh castShadow material={materials.glass} position={[0, 0.78, 0.35]}>
        <boxGeometry args={[1.55, 0.32, 1.1]} />
      </mesh>
      <mesh castShadow material={materials.accent} position={[0, 0.18, 2.15]}>
        <boxGeometry args={[1.5, 0.06, 0.12]} />
      </mesh>
      <Wheel position={[-0.85, 0, 1.35]} />
      <Wheel position={[0.85, 0, 1.35]} />
      <Wheel position={[-0.85, 0, -1.4]} />
      <Wheel position={[0.85, 0, -1.4]} />
    </group>
  )
}

/** Cadillac CT5-V Blackwing (GLB). Suspense keeps the bay empty until ready — no probe fetch. */
export function FormulaCar({ accent = '#e87a20', forceProcedural = false }: Props) {
  if (forceProcedural) return <CarProcedural accent={accent} />

  return (
    <Suspense fallback={null}>
      <CT5GlbModel />
    </Suspense>
  )
}

useGLTF.preload(CT5_MODEL_URL, true, true)
