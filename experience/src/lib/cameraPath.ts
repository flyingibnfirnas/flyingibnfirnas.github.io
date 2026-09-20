import type { CameraKeyframe, Vec3 } from '@/data/careerChapters'

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function lerpVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
}

export type SampledShot = {
  position: Vec3
  lookAt: Vec3
  fov: number
  subjectYaw: number
}

/**
 * Piecewise-linear path through keyframes.
 * Guarantees every authored shot is hit exactly at its `t` (no Catmull-Rom overshoot).
 */
export function sampleCameraPath(
  keyframes: CameraKeyframe[],
  localT: number,
  fallbackYaw = 0,
): SampledShot {
  const sorted = [...keyframes].sort((a, b) => a.t - b.t)
  const t = Math.min(1, Math.max(0, localT))

  if (sorted.length === 0) {
    return {
      position: [0, 2, 8],
      lookAt: [0, 0, 0],
      fov: 40,
      subjectYaw: fallbackYaw,
    }
  }

  if (sorted.length === 1 || t <= sorted[0].t) {
    const k = sorted[0]
    return {
      position: [...k.position] as Vec3,
      lookAt: [...k.lookAt] as Vec3,
      fov: k.fov ?? 40,
      subjectYaw: k.subjectYaw ?? fallbackYaw,
    }
  }

  const last = sorted[sorted.length - 1]
  if (t >= last.t) {
    return {
      position: [...last.position] as Vec3,
      lookAt: [...last.lookAt] as Vec3,
      fov: last.fov ?? 40,
      subjectYaw: last.subjectYaw ?? fallbackYaw,
    }
  }

  let i = 0
  while (i < sorted.length - 1 && sorted[i + 1].t < t) i++

  const a = sorted[i]
  const b = sorted[i + 1]
  const span = b.t - a.t || 1
  const u = (t - a.t) / span

  const yawA = a.subjectYaw ?? fallbackYaw
  const yawB = b.subjectYaw ?? fallbackYaw

  return {
    position: lerpVec3(a.position, b.position, u),
    lookAt: lerpVec3(a.lookAt, b.lookAt, u),
    fov: lerp(a.fov ?? 40, b.fov ?? 40, u),
    subjectYaw: lerp(yawA, yawB, u),
  }
}

/** Soft visibility of a beat around its peak time. */
export function beatVisibility(localT: number, peak: number, width = 0.18) {
  const d = Math.abs(localT - peak)
  if (d >= width) return 0
  return 1 - d / width
}

export function formatKeyframe(k: CameraKeyframe): string {
  const [x, y, z] = k.position.map((n) => +n.toFixed(3))
  const [lx, ly, lz] = k.lookAt.map((n) => +n.toFixed(3))
  const yaw =
    k.subjectYaw === undefined ? '' : `, subjectYaw: ${k.subjectYaw.toFixed(4)}`
  return `{ t: ${k.t.toFixed(3)}, position: [${x}, ${y}, ${z}], lookAt: [${lx}, ${ly}, ${lz}], fov: ${+(k.fov ?? 40).toFixed(2)}${yaw} },`
}
