import { RoundedBox } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import {
  FuselageModel,
  FUSELAGE_AXIS_Y,
  FUSELAGE_CROWN_Y,
  FUSELAGE_RADIUS,
  FUSELAGE_TARGET_LENGTH,
} from './FuselageModel'

const LASER_GREEN = '#39ff6a'
const LASER_SOFT = '#1aff5c'
/** Lift projected marks slightly off the skin so they don't z-fight */
const SKIN_LIFT = 0.035

type Vec3 = [number, number, number]

type LaserMats = {
  metal: THREE.MeshStandardMaterial
  metalLight: THREE.MeshStandardMaterial
  laserCore: THREE.MeshBasicMaterial
  laserGlow: THREE.MeshBasicMaterial
  plyLine: THREE.MeshBasicMaterial
  plyFill: THREE.MeshBasicMaterial
}

/** Point on the fuselage barrel: φ = 0 at crown, +φ toward +Z (south). */
function skinPoint(x: number, phi: number, radius: number, axisY: number): THREE.Vector3 {
  const r = radius + SKIN_LIFT
  return new THREE.Vector3(x, axisY + r * Math.cos(phi), r * Math.sin(phi))
}

/** Thin laser segment between two skin points. */
function LaserSegment({
  a,
  b,
  material,
  thickness = 0.018,
}: {
  a: THREE.Vector3
  b: THREE.Vector3
  material: THREE.Material
  thickness?: number
}) {
  const { mid, quat, len } = useMemo(() => {
    const mid = a.clone().add(b).multiplyScalar(0.5)
    const dir = b.clone().sub(a)
    const len = dir.length()
    dir.normalize()
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir)
    return { mid, quat, len }
  }, [a, b])

  if (len < 1e-4) return null
  return (
    <mesh position={mid.toArray()} quaternion={quat} material={material}>
      <boxGeometry args={[len, thickness, thickness]} />
    </mesh>
  )
}

/** Polyline of laser segments on the skin. */
function LaserPolyline({
  points,
  material,
  closed = false,
  thickness,
}: {
  points: THREE.Vector3[]
  material: THREE.Material
  closed?: boolean
  thickness?: number
}) {
  const segs = useMemo(() => {
    const out: { a: THREE.Vector3; b: THREE.Vector3; key: string }[] = []
    for (let i = 0; i < points.length - 1; i++) {
      out.push({ a: points[i], b: points[i + 1], key: `s${i}` })
    }
    if (closed && points.length > 2) {
      out.push({ a: points[points.length - 1], b: points[0], key: 'close' })
    }
    return out
  }, [closed, points])

  return (
    <group>
      {segs.map((s) => (
        <LaserSegment key={s.key} a={s.a} b={s.b} material={material} thickness={thickness} />
      ))}
    </group>
  )
}

/**
 * CAD-like laser template: station frames, crown butt line, ply nests,
 * and feature outlines — all lying on the cylindrical skin under the throw.
 */
function PlyLaserTemplate({
  materials,
  radius,
  axisY,
}: {
  materials: LaserMats
  radius: number
  axisY: number
}) {
  const halfLen = FUSELAGE_TARGET_LENGTH * 0.42

  const marks = useMemo(() => {
    const pt = (x: number, phi: number) => skinPoint(x, phi, radius, axisY)

    // Crown butt line (φ = 0) and ±butt lines
    const crownLine = [-halfLen, halfLen].map((x) => pt(x, 0))
    const buttL = [-halfLen * 0.92, halfLen * 0.92].map((x) => pt(x, -0.38))
    const buttR = [-halfLen * 0.92, halfLen * 0.92].map((x) => pt(x, 0.38))

    // Station frames — upper arcs at regular X
    const stationXs = [-1.6, -0.8, 0, 0.8, 1.6]
    const stations = stationXs.map((x) => {
      const phis = Array.from({ length: 13 }, (_, i) => -0.85 + (i / 12) * 1.7)
      return phis.map((phi) => pt(x, phi))
    })

    // South projector ply nest (closed outline on crown / +Z quarter)
    const plySouth = [
      pt(-0.55, -0.22),
      pt(0.85, -0.22),
      pt(0.95, 0.08),
      pt(0.85, 0.48),
      pt(-0.55, 0.48),
      pt(-0.65, 0.08),
    ]

    // Aft projector ply nest (−Z quarter)
    const plyAft = [
      pt(-1.15, -0.5),
      pt(0.15, -0.5),
      pt(0.25, -0.18),
      pt(0.15, 0.12),
      pt(-1.15, 0.12),
      pt(-1.25, -0.18),
    ]

    // Inner nest / next-ply inset for south
    const plySouthInner = [
      pt(-0.35, -0.1),
      pt(0.65, -0.1),
      pt(0.72, 0.08),
      pt(0.65, 0.32),
      pt(-0.35, 0.32),
      pt(-0.42, 0.08),
    ]

    // Circular feature (window / access) under south throw — ring of points
    const featureSouth = Array.from({ length: 20 }, (_, i) => {
      const t = (i / 20) * Math.PI * 2
      return pt(0.15 + Math.cos(t) * 0.28, 0.18 + Math.sin(t) * 0.16)
    })

    // Fastener / datum crosses
    const datums: [THREE.Vector3, THREE.Vector3][] = [
      [pt(-1.6, 0), pt(-1.45, 0)],
      [pt(-1.525, -0.08), pt(-1.525, 0.08)],
      [pt(1.45, 0), pt(1.6, 0)],
      [pt(1.525, -0.08), pt(1.525, 0.08)],
      [pt(0, 0.55), pt(0, 0.7)],
      [pt(-0.08, 0.62), pt(0.08, 0.62)],
    ]

    // Fiber-angle ticks inside south ply (45° reference)
    const fiberTicks: [THREE.Vector3, THREE.Vector3][] = [
      [pt(-0.2, 0.05), pt(0.05, 0.22)],
      [pt(0.1, 0.05), pt(0.35, 0.22)],
      [pt(0.4, 0.05), pt(0.65, 0.22)],
    ]

    // Short label bars reading as PLY callouts near nests
    const labels: [THREE.Vector3, THREE.Vector3][] = [
      [pt(-0.55, 0.55), pt(-0.15, 0.55)],
      [pt(-0.55, 0.62), pt(-0.35, 0.62)],
      [pt(-1.15, -0.58), pt(-0.75, -0.58)],
      [pt(-1.15, -0.65), pt(-0.95, -0.65)],
    ]

    return {
      crownLine,
      buttL,
      buttR,
      stations,
      plySouth,
      plySouthInner,
      plyAft,
      featureSouth,
      datums,
      fiberTicks,
      labels,
    }
  }, [axisY, halfLen, radius])

  return (
    <group>
      <LaserPolyline points={marks.crownLine} material={materials.plyLine} thickness={0.02} />
      <LaserPolyline points={marks.buttL} material={materials.plyLine} thickness={0.014} />
      <LaserPolyline points={marks.buttR} material={materials.plyLine} thickness={0.014} />

      {marks.stations.map((pts, i) => (
        <LaserPolyline key={`st-${i}`} points={pts} material={materials.plyLine} thickness={0.014} />
      ))}

      <LaserPolyline points={marks.plySouth} material={materials.plyLine} closed thickness={0.022} />
      <LaserPolyline points={marks.plySouthInner} material={materials.plyLine} closed thickness={0.014} />
      <LaserPolyline points={marks.plyAft} material={materials.plyLine} closed thickness={0.022} />
      <LaserPolyline points={marks.featureSouth} material={materials.plyLine} closed thickness={0.016} />

      {marks.datums.map(([a, b], i) => (
        <LaserSegment key={`d-${i}`} a={a} b={b} material={materials.plyLine} thickness={0.016} />
      ))}
      {marks.fiberTicks.map(([a, b], i) => (
        <LaserSegment key={`f-${i}`} a={a} b={b} material={materials.plyLine} thickness={0.012} />
      ))}
      {marks.labels.map(([a, b], i) => (
        <LaserSegment key={`l-${i}`} a={a} b={b} material={materials.plyLine} thickness={0.02} />
      ))}
    </group>
  )
}

/**
 * Overhead laser head aimed at a skin target.
 * Local −Y is the throw axis (tip at aperture, base on the fuselage).
 */
function LaserProjector({
  position,
  target,
  materials,
  radius: coneR = [1.55, 1.05],
}: {
  position: Vec3
  target: Vec3
  materials: LaserMats
  radius?: [number, number]
}) {
  const { origin, quat, throwLen } = useMemo(() => {
    const from = new THREE.Vector3(...position)
    const to = new THREE.Vector3(...target)
    const dir = to.clone().sub(from)
    const throwLen = Math.max(1.2, dir.length())
    dir.normalize()
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir)
    return { origin: from, quat, throwLen }
  }, [position, target])

  const [glowR, coreR] = coneR
  const glowH = throwLen + 0.15
  const coreH = throwLen

  return (
    <group position={origin.toArray()} quaternion={quat}>
      <RoundedBox
        castShadow
        args={[0.58, 0.3, 0.7]}
        radius={0.075}
        smoothness={5}
        position={[0, 0.22, 0]}
        material={materials.metal}
      />
      <mesh material={materials.metalLight} position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.05, 20]} />
      </mesh>
      <mesh material={materials.plyLine} position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.09, 20]} />
      </mesh>

      <mesh position={[0, -glowH * 0.5, 0]} material={materials.laserGlow}>
        <coneGeometry args={[glowR, glowH, 28, 1, true]} />
      </mesh>
      <mesh position={[0, -coreH * 0.5 - 0.03, 0]} material={materials.laserCore}>
        <coneGeometry args={[coreR, coreH, 28, 1, true]} />
      </mesh>

      <pointLight position={[0, -0.15, 0]} intensity={6} distance={11} color={LASER_GREEN} />
    </group>
  )
}

/** Portal-frame gantry: four legs, top rails, spine, and drop hangers for the two heads. */
function OverheadScaffold({
  materials,
  railY,
  hangY,
  southZ,
  aftZ,
}: {
  materials: LaserMats
  railY: number
  hangY: number
  southZ: number
  aftZ: number
}) {
  const legX = 2.85
  const legZ = 3.35
  const beam = 0.16
  const drop = railY - hangY

  const legs: Vec3[] = [
    [-legX, 0, -legZ],
    [legX, 0, -legZ],
    [-legX, 0, legZ],
    [legX, 0, legZ],
  ]

  return (
    <group>
      {/* Four corner columns outside the fuselage / cradle footprint */}
      {legs.map(([x, , z]) => (
        <group key={`${x}-${z}`}>
          <mesh castShadow material={materials.metal} position={[x, railY * 0.5, z]}>
            <cylinderGeometry args={[0.09, 0.11, railY, 16]} />
          </mesh>
          <mesh castShadow material={materials.metalLight} position={[x, 0.08, z]}>
            <cylinderGeometry args={[0.28, 0.32, 0.16, 16]} />
          </mesh>
        </group>
      ))}

      {/* Mid-height ring — keeps the four legs from looking freestanding */}
      {([-legZ, legZ] as const).map((z) => (
        <RoundedBox
          key={`mid-long-${z}`}
          castShadow
          args={[legX * 2 + beam, beam * 0.85, beam * 0.85]}
          radius={0.035}
          smoothness={4}
          position={[0, railY * 0.42, z]}
          material={materials.metalLight}
        />
      ))}
      {([-legX, legX] as const).map((x) => (
        <RoundedBox
          key={`mid-cross-${x}`}
          castShadow
          args={[beam * 0.85, beam * 0.85, legZ * 2 + beam]}
          radius={0.035}
          smoothness={4}
          position={[x, railY * 0.42, 0]}
          material={materials.metalLight}
        />
      ))}

      {/* Top rectangle — long rails along X, cross rails along Z */}
      {([-legZ, legZ] as const).map((z) => (
        <RoundedBox
          key={`long-${z}`}
          castShadow
          args={[legX * 2 + beam, beam, beam]}
          radius={0.04}
          smoothness={4}
          position={[0, railY, z]}
          material={materials.metalLight}
        />
      ))}
      {([-legX, legX] as const).map((x) => (
        <RoundedBox
          key={`cross-${x}`}
          castShadow
          args={[beam, beam, legZ * 2 + beam]}
          radius={0.04}
          smoothness={4}
          position={[x, railY, 0]}
          material={materials.metalLight}
        />
      ))}

      {/* Center spine — carries both laser carriages along Z */}
      <RoundedBox
        castShadow
        args={[beam * 1.15, beam * 1.15, legZ * 2 + 0.4]}
        radius={0.045}
        smoothness={4}
        position={[0, railY, 0]}
        material={materials.metal}
      />
      {/* Mid cross-tie under the spine */}
      <RoundedBox
        castShadow
        args={[legX * 1.6, beam * 0.9, beam * 0.9]}
        radius={0.04}
        smoothness={4}
        position={[0, railY, 0]}
        material={materials.metalLight}
      />

      {/* Carriage hangers — clamp on spine, drop tube to each head */}
      {([southZ, aftZ] as const).map((z) => (
        <group key={`hang-${z}`} position={[0, railY, z]}>
          <RoundedBox
            castShadow
            args={[0.42, 0.22, 0.42]}
            radius={0.05}
            smoothness={4}
            position={[0, 0.02, 0]}
            material={materials.metal}
          />
          <mesh castShadow material={materials.metalLight} position={[0, -drop * 0.5, 0]}>
            <cylinderGeometry args={[0.055, 0.055, drop, 12]} />
          </mesh>
          {/* Gimbal plate just above the head */}
          <RoundedBox
            castShadow
            args={[0.36, 0.1, 0.36]}
            radius={0.035}
            smoothness={4}
            position={[0, -drop + 0.08, 0]}
            material={materials.metalLight}
          />
        </group>
      ))}
    </group>
  )
}

/**
 * Virtek cell: fuselage + two overhead laser heads on a portal gantry.
 */
export function LaserTemplatingRig() {
  const materials = useMemo(
    () => ({
      metal: new THREE.MeshStandardMaterial({
        color: '#2a3038',
        metalness: 0.78,
        roughness: 0.3,
      }),
      metalLight: new THREE.MeshStandardMaterial({
        color: '#7a8490',
        metalness: 0.68,
        roughness: 0.36,
      }),
      laserCore: new THREE.MeshBasicMaterial({
        color: LASER_GREEN,
        transparent: true,
        opacity: 0.14,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
      laserGlow: new THREE.MeshBasicMaterial({
        color: LASER_SOFT,
        transparent: true,
        opacity: 0.07,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
      plyLine: new THREE.MeshBasicMaterial({
        color: LASER_GREEN,
        transparent: true,
        opacity: 0.95,
        toneMapped: false,
      }),
      plyFill: new THREE.MeshBasicMaterial({
        color: LASER_GREEN,
        transparent: true,
        opacity: 0.14,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    }),
    [],
  )

  const crownY = FUSELAGE_CROWN_Y
  const radius = FUSELAGE_RADIUS
  const axisY = FUSELAGE_AXIS_Y

  const railY = crownY + 2.95
  const hangY = crownY + 2.4
  const southZ = 2.45
  const aftZ = -2.45

  const projectors = useMemo(
    () => [
      {
        id: 'south',
        position: [0.12, hangY, southZ] as Vec3,
        // Aim at south ply nest center
        target: [0.15, axisY + radius * Math.cos(0.15), (radius + SKIN_LIFT) * Math.sin(0.15)] as Vec3,
        radius: [1.65, 1.12] as [number, number],
      },
      {
        id: 'aft',
        position: [-0.2, hangY, aftZ] as Vec3,
        // Aim at aft ply nest center
        target: [-0.5, axisY + radius * Math.cos(-0.2), (radius + SKIN_LIFT) * Math.sin(-0.2)] as Vec3,
        radius: [1.55, 1.05] as [number, number],
      },
    ],
    [aftZ, axisY, hangY, radius, southZ],
  )

  return (
    <group>
      <FuselageModel />

      {/* Cradles */}
      <group>
        {([-1.55, 1.55] as const).map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh castShadow material={materials.metalLight} position={[0, 0.28, 0.7]}>
              <boxGeometry args={[0.14, 0.56, 0.14]} />
            </mesh>
            <mesh castShadow material={materials.metalLight} position={[0, 0.28, -0.7]}>
              <boxGeometry args={[0.14, 0.56, 0.14]} />
            </mesh>
            <mesh castShadow material={materials.metal} position={[0, 0.05, 0]}>
              <boxGeometry args={[0.6, 0.1, 1.6]} />
            </mesh>
          </group>
        ))}
        <mesh castShadow material={materials.metal} position={[0, 0.05, 0]}>
          <boxGeometry args={[3.6, 0.08, 1.7]} />
        </mesh>
      </group>

      <OverheadScaffold
        materials={materials}
        railY={railY}
        hangY={hangY}
        southZ={southZ}
        aftZ={aftZ}
      />

      <PlyLaserTemplate materials={materials} radius={radius} axisY={axisY} />

      {projectors.map((p) => (
        <LaserProjector key={p.id} {...p} materials={materials} />
      ))}

      <spotLight
        position={[0, crownY + 3.6, 4.2]}
        angle={0.55}
        penumbra={0.65}
        intensity={40}
        distance={24}
        color="#e8eef5"
        castShadow
        shadow-mapSize={[512, 512]}
      />
      <pointLight position={[-3.0, 2.6, 3.4]} intensity={14} distance={16} color="#9eb6d4" />
    </group>
  )
}
