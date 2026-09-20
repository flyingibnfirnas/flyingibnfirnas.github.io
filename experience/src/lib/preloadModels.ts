import { useGLTF } from '@react-three/drei'
import { DRONE_MODEL_URL } from '@/scenes/avionics/DroneAircraft'
import { ROBOT_MODEL_URL } from '@/scenes/robotics/RobotArm'
import { F16_MODEL_URL } from '@/scenes/f16/F16Aircraft'
import { CT5_MODEL_URL } from '@/scenes/automotive/FormulaCar'
import { FUSELAGE_MODEL_URL } from '@/scenes/virtek/FuselageModel'
import { SERVER_MODEL_URL } from '@/scenes/amd/ServerRack'

const MODEL_URLS = [
  DRONE_MODEL_URL,
  ROBOT_MODEL_URL,
  F16_MODEL_URL,
  FUSELAGE_MODEL_URL,
  CT5_MODEL_URL,
  SERVER_MODEL_URL,
] as const

/**
 * Kick off GLB downloads as early as the JS bundle runs (before Canvas mount).
 * Third arg enables MeshoptDecoder for meshopt-compressed assets.
 */
export function preloadExperienceModels() {
  for (const url of MODEL_URLS) {
    useGLTF.preload(url, true, true)
  }
}
