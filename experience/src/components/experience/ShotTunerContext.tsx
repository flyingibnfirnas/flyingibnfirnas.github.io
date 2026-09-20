import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CameraKeyframe, Vec3 } from '@/data/careerChapters'
import { careerChapters, chapterProgressBounds } from '@/data/careerChapters'
import { formatKeyframe, sampleCameraPath } from '@/lib/cameraPath'
import { scrollProgress, scrollToProgress } from '@/lib/scrollStore'
import { useExperience } from './ExperienceContext'

export type DraftShot = {
  /** World-space (orbit / viewport) */
  position: Vec3
  lookAt: Vec3
  fov: number
  subjectYawDeg: number
}

type ShotTunerContextValue = {
  enabled: boolean
  setEnabled: (v: boolean) => void
  /** Which chapter the board is authoring */
  tuneChapterIndex: number
  setTuneChapterIndex: (i: number) => void
  freeLook: boolean
  setFreeLook: (v: boolean) => void
  draft: DraftShot
  setDraft: (shot: DraftShot | ((prev: DraftShot) => DraftShot)) => void
  /** Chapter-local keyframes (same space as careerChapters.camera) */
  keyframes: CameraKeyframe[]
  selectedIndex: number
  setSelectedIndex: (i: number) => void
  previewT: number
  setPreviewT: (t: number) => void
  previewMode: boolean
  setPreviewMode: (v: boolean) => void
  captureShot: (t?: number) => void
  updateSelected: () => void
  deleteSelected: () => void
  loadSelectedIntoDraft: (index: number) => void
  redistributeTimes: () => void
  snippet: string
  resetFromChapter: () => void
  clearToBlank: () => void
  /** World-space sample for CameraRig while tuning */
  activeSample: ReturnType<typeof sampleCameraPath> | null
}

type PersistedBoard = {
  keyframes: CameraKeyframe[]
  selectedIndex: number
  draft: DraftShot
  previewT: number
}

function storageKey(chapterId: string) {
  return `flyingibnfirnas.shotboard.${chapterId}.v12`
}

function addVec(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

function subVec(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

function keyframeToDraft(k: CameraKeyframe, fallbackYaw: number, offset: Vec3): DraftShot {
  return {
    position: addVec(k.position, offset),
    lookAt: addVec(k.lookAt, offset),
    fov: k.fov ?? 40,
    subjectYawDeg: (((k.subjectYaw ?? fallbackYaw) * 180) / Math.PI),
  }
}

function draftToKeyframe(draft: DraftShot, t: number, offset: Vec3): CameraKeyframe {
  return {
    t,
    position: subVec(draft.position, offset),
    lookAt: subVec(draft.lookAt, offset),
    fov: draft.fov,
    subjectYaw: (draft.subjectYawDeg * Math.PI) / 180,
  }
}

function cloneChapterFrames(camera: CameraKeyframe[]): CameraKeyframe[] {
  return camera.map((k) => ({
    ...k,
    position: [...k.position] as Vec3,
    lookAt: [...k.lookAt] as Vec3,
  }))
}

function loadPersisted(chapterId: string): PersistedBoard | null {
  try {
    const raw = sessionStorage.getItem(storageKey(chapterId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedBoard
    if (!Array.isArray(parsed.keyframes) || parsed.keyframes.length === 0) return null
    return parsed
  } catch {
    return null
  }
}

function savePersisted(chapterId: string, board: PersistedBoard) {
  try {
    sessionStorage.setItem(storageKey(chapterId), JSON.stringify(board))
  } catch {
    // ignore
  }
}

const ShotTunerContext = createContext<ShotTunerContextValue | null>(null)

export function ShotTunerProvider({ children }: { children: ReactNode }) {
  const { chapterIndex: scrollChapterIndex } = useExperience()

  const [enabled, setEnabled] = useState(false)
  const [tuneChapterIndex, setTuneChapterIndex] = useState(0)
  const chapter = careerChapters[tuneChapterIndex] ?? careerChapters[0]
  const fallbackYaw = chapter.subjectYaw ?? 0
  const offset = (chapter.subjectOffset ?? [0, 0, 0]) as Vec3

  const [freeLook, setFreeLook] = useState(true)
  const [keyframes, setKeyframes] = useState<CameraKeyframe[]>(() =>
    cloneChapterFrames(careerChapters[0].camera),
  )
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [draft, setDraft] = useState<DraftShot>(() =>
    keyframeToDraft(careerChapters[0].camera[0], careerChapters[0].subjectYaw ?? 0, [0, 0, 0]),
  )
  const [previewT, setPreviewT] = useState(0)
  const [previewMode, setPreviewMode] = useState(false)

  const loadChapterBoard = useCallback((index: number) => {
    const ch = careerChapters[index] ?? careerChapters[0]
    const off = (ch.subjectOffset ?? [0, 0, 0]) as Vec3
    const yaw = ch.subjectYaw ?? 0
    const saved = loadPersisted(ch.id)
    const frames = saved?.keyframes ?? cloneChapterFrames(ch.camera)
    const sel = saved
      ? Math.max(0, Math.min(saved.selectedIndex, frames.length - 1))
      : 0
    setKeyframes(frames)
    setSelectedIndex(sel)
    setDraft(saved?.draft ?? keyframeToDraft(frames[0], yaw, off))
    setPreviewT(saved?.previewT ?? frames[0]?.t ?? 0)
    setPreviewMode(false)
  }, [])

  // When opening the board, author the chapter you're scrolled into
  useEffect(() => {
    if (!enabled) return
    setTuneChapterIndex(scrollChapterIndex)
    loadChapterBoard(scrollChapterIndex)
  }, [enabled]) // eslint-disable-line react-hooks/exhaustive-deps -- only on open

  // Persist per chapter
  useEffect(() => {
    if (!enabled) return
    savePersisted(chapter.id, { keyframes, selectedIndex, draft, previewT })
  }, [enabled, chapter.id, keyframes, selectedIndex, draft, previewT])

  const switchChapter = useCallback(
    (index: number) => {
      // save current first
      savePersisted(chapter.id, { keyframes, selectedIndex, draft, previewT })
      setTuneChapterIndex(index)
      loadChapterBoard(index)
      const { start } = chapterProgressBounds(index)
      scrollToProgress(start, { immediate: true })
    },
    [chapter.id, keyframes, selectedIndex, draft, previewT, loadChapterBoard],
  )

  const resetFromChapter = useCallback(() => {
    const frames = cloneChapterFrames(chapter.camera)
    setKeyframes(frames)
    setSelectedIndex(0)
    setDraft(keyframeToDraft(frames[0], fallbackYaw, offset))
    setPreviewT(0)
    setPreviewMode(false)
  }, [chapter.camera, fallbackYaw, offset])

  const clearToBlank = useCallback(() => {
    const frame = draftToKeyframe(draft, 0, offset)
    setKeyframes([frame])
    setSelectedIndex(0)
    setPreviewT(0)
    setPreviewMode(false)
  }, [draft, offset])

  const loadSelectedIntoDraft = useCallback(
    (index: number) => {
      const k = keyframes[index]
      if (!k) return
      setSelectedIndex(index)
      setDraft(keyframeToDraft(k, fallbackYaw, offset))
      setPreviewT(k.t)
      setPreviewMode(false)
    },
    [keyframes, fallbackYaw, offset],
  )

  const captureShot = useCallback(
    (t?: number) => {
      setKeyframes((prev) => {
        const frame = draftToKeyframe(draft, 0, offset)
        let next: CameraKeyframe[]

        if (t !== undefined) {
          frame.t = +t.toFixed(3)
          next = [...prev, frame].sort((a, b) => a.t - b.t)
        } else {
          next = [...prev, frame]
          if (next.length === 1) {
            next[0] = { ...next[0], t: 0 }
          } else {
            next = next.map((k, i) => ({
              ...k,
              t: +(i / (next.length - 1)).toFixed(3),
            }))
          }
        }

        setSelectedIndex(next.length - 1)
        return next
      })
      setPreviewMode(false)
    },
    [draft, offset],
  )

  const updateSelected = useCallback(() => {
    setKeyframes((prev) => {
      if (!prev[selectedIndex]) return prev
      const t = prev[selectedIndex].t
      const next = [...prev]
      next[selectedIndex] = draftToKeyframe(draft, t, offset)
      return next
    })
  }, [draft, selectedIndex, offset])

  const deleteSelected = useCallback(() => {
    setKeyframes((prev) => {
      if (prev.length <= 1) return prev
      const next = prev.filter((_, i) => i !== selectedIndex)
      const newIndex = Math.max(0, Math.min(selectedIndex, next.length - 1))
      setSelectedIndex(newIndex)
      setDraft(keyframeToDraft(next[newIndex], fallbackYaw, offset))
      return next
    })
  }, [selectedIndex, fallbackYaw, offset])

  const redistributeTimes = useCallback(() => {
    setKeyframes((prev) => {
      if (prev.length === 1) return [{ ...prev[0], t: 0 }]
      return prev.map((k, i) => ({
        ...k,
        t: +(i / (prev.length - 1)).toFixed(3),
      }))
    })
  }, [])

  const snippet = useMemo(() => {
    const lines = keyframes
      .slice()
      .sort((a, b) => a.t - b.t)
      .map((k) => `      ${formatKeyframe(k)}`)
    return `camera: [\n${lines.join('\n')}\n    ],`
  }, [keyframes])

  const activeSample = useMemo(() => {
    if (!enabled) return null
    if (previewMode) {
      const local = sampleCameraPath(keyframes, previewT, fallbackYaw)
      return {
        ...local,
        position: addVec(local.position, offset),
        lookAt: addVec(local.lookAt, offset),
      }
    }
    return {
      position: draft.position,
      lookAt: draft.lookAt,
      fov: draft.fov,
      subjectYaw: (draft.subjectYawDeg * Math.PI) / 180,
    }
  }, [enabled, previewMode, previewT, keyframes, draft, fallbackYaw, offset])

  useEffect(() => {
    if (!enabled) return
    const prevProgress = scrollProgress.current
    const { start } = chapterProgressBounds(tuneChapterIndex)
    scrollToProgress(start, { immediate: true })
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
      scrollToProgress(prevProgress, { immediate: true })
    }
  }, [enabled, tuneChapterIndex])

  const value = useMemo(
    () => ({
      enabled,
      setEnabled,
      tuneChapterIndex,
      setTuneChapterIndex: switchChapter,
      freeLook,
      setFreeLook,
      draft,
      setDraft,
      keyframes,
      selectedIndex,
      setSelectedIndex,
      previewT,
      setPreviewT,
      previewMode,
      setPreviewMode,
      captureShot,
      updateSelected,
      deleteSelected,
      loadSelectedIntoDraft,
      redistributeTimes,
      snippet,
      resetFromChapter,
      clearToBlank,
      activeSample,
    }),
    [
      enabled,
      tuneChapterIndex,
      switchChapter,
      freeLook,
      draft,
      keyframes,
      selectedIndex,
      previewT,
      previewMode,
      captureShot,
      updateSelected,
      deleteSelected,
      loadSelectedIntoDraft,
      redistributeTimes,
      snippet,
      resetFromChapter,
      clearToBlank,
      activeSample,
    ],
  )

  return <ShotTunerContext.Provider value={value}>{children}</ShotTunerContext.Provider>
}

export function useShotTuner() {
  const ctx = useContext(ShotTunerContext)
  if (!ctx) throw new Error('useShotTuner requires ShotTunerProvider')
  return ctx
}
