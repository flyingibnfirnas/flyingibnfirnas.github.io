import { createContext, useContext } from 'react'

export type ExperienceState = {
  /** Global scroll progress 0–1 */
  progress: number
  /** Active chapter index */
  chapterIndex: number
  /** Progress within active chapter 0–1 */
  localProgress: number
  reducedMotion: boolean
  webglOk: boolean
}

export const ExperienceContext = createContext<ExperienceState>({
  progress: 0,
  chapterIndex: 0,
  localProgress: 0,
  reducedMotion: false,
  webglOk: true,
})

export function useExperience() {
  return useContext(ExperienceContext)
}
