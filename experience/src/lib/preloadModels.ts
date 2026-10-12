import { useGLTF } from '@react-three/drei'
import { DRONE_MODEL_URL } from '@/scenes/avionics/DroneAircraft'
import { ROBOT_MODEL_URL } from '@/scenes/robotics/RobotArm'
import { F16_MODEL_URL } from '@/scenes/f16/F16Aircraft'
import { CT5_MODEL_URL } from '@/scenes/automotive/FormulaCar'
import { FUSELAGE_MODEL_URL } from '@/scenes/virtek/FuselageModel'
import { SERVER_MODEL_URL } from '@/scenes/amd/ServerRack'

/** One hero GLB per hangar bay, in chapter order */
export const CHAPTER_MODEL_URLS = [
  DRONE_MODEL_URL,
  ROBOT_MODEL_URL,
  F16_MODEL_URL,
  FUSELAGE_MODEL_URL,
  CT5_MODEL_URL,
  SERVER_MODEL_URL,
] as const

const preloaded = new Set<string>()

function preloadUrl(url: string) {
  if (preloaded.has(url)) return
  preloaded.add(url)
  useGLTF.preload(url, true, true)
}

/**
 * First paint: opening drone + robot (first handoff).
 * Remaining bays warm in the background so mid-scroll decode never freezes Lenis.
 */
export function preloadExperienceModels() {
  preloadUrl(CHAPTER_MODEL_URLS[0])
  preloadUrl(CHAPTER_MODEL_URLS[1])

  if (typeof window === 'undefined') return
  CHAPTER_MODEL_URLS.slice(2).forEach((url, i) => {
    // Stagger so meshopt decode doesn't land as one main-thread spike
    window.setTimeout(() => preloadUrl(url), 900 + i * 1100)
  })
}

/** Warm a window around the active chapter (and optionally further ahead). */
export function preloadAroundChapter(chapterIndex: number, ahead = 2) {
  const start = Math.max(0, chapterIndex - 1)
  const end = Math.min(CHAPTER_MODEL_URLS.length - 1, chapterIndex + ahead)
  for (let i = start; i <= end; i++) {
    preloadUrl(CHAPTER_MODEL_URLS[i])
  }
}
