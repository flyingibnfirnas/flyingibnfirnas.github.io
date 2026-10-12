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

/** First paint: only the opening drone (~0.4MB). */
export function preloadExperienceModels() {
  preloadUrl(CHAPTER_MODEL_URLS[0])
}

/** Warm previous/current/next bays so timeline jumps and handoffs stay smooth. */
export function preloadAroundChapter(chapterIndex: number) {
  const start = Math.max(0, chapterIndex - 1)
  const end = Math.min(CHAPTER_MODEL_URLS.length - 1, chapterIndex + 1)
  for (let i = start; i <= end; i++) {
    preloadUrl(CHAPTER_MODEL_URLS[i])
  }
}
