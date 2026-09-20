import { useEffect, useRef, useState } from 'react'
import { ambientAudio } from '@/lib/ambientAudio'
import { useExperience } from './ExperienceContext'
import { careerChapters } from '@/data/careerChapters'

const STORAGE_KEY = 'flyingibnfirnas.journey.sound'

function moodForChapter(id: string) {
  if (id === 'avionics') return 'avionics' as const
  if (id === 'robotics') return 'robotics' as const
  if (id === 'f16') return 'aerospace' as const
  if (id === 'virtek') return 'aerospace' as const
  if (id === 'automotive') return 'automotive' as const
  if (id === 'amd') return 'amd' as const
  return 'default' as const
}

/**
 * Hangar ambience + chrome mute control.
 * Sound starts only after an explicit user gesture (browser autoplay rules).
 */
export function AmbientAudioControl() {
  const { chapterIndex } = useExperience()
  const chapter = careerChapters[chapterIndex]
  const prevChapter = useRef(chapterIndex)
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'on'
    } catch {
      return false
    }
  })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    return () => {
      ambientAudio.setMuted(true)
    }
  }, [])

  useEffect(() => {
    if (!enabled || !ready) return
    ambientAudio.setMood(moodForChapter(chapter.id))
  }, [chapter.id, enabled, ready])

  useEffect(() => {
    if (!enabled || !ready) return
    if (prevChapter.current !== chapterIndex) {
      ambientAudio.playTransitionCue()
      prevChapter.current = chapterIndex
    }
  }, [chapterIndex, enabled, ready])

  const toggle = async () => {
    const next = !enabled
    setEnabled(next)
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off')
    } catch {
      // ignore
    }

    if (next) {
      await ambientAudio.ensureStarted()
      ambientAudio.setMuted(false)
      ambientAudio.setMood(moodForChapter(chapter.id))
      setReady(true)
    } else {
      ambientAudio.setMuted(true)
    }
  }

  return (
    <button
      type="button"
      className={`chrome-sound ${enabled ? 'on' : ''}`}
      onClick={() => void toggle()}
      aria-pressed={enabled}
      title={enabled ? 'Mute ambience' : 'Play hangar ambience'}
    >
      {enabled ? 'Sound on' : 'Sound off'}
    </button>
  )
}
