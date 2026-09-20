import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  careerChapters,
  chapterProgressBounds,
  totalScrollVh,
} from '@/data/careerChapters'
import { scrollProgress, bindScrollToProgress } from '@/lib/scrollStore'
import { ExperienceContext, type ExperienceState } from './ExperienceContext'

gsap.registerPlugin(ScrollTrigger)

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    )
  } catch {
    return false
  }
}

function chapterIndexFromProgress(progress: number) {
  for (let i = 0; i < careerChapters.length; i++) {
    const { start, end } = chapterProgressBounds(i)
    if (progress < end || i === careerChapters.length - 1) {
      if (progress >= start || i === 0) return i
    }
  }
  return 0
}

export function ExperienceController({ children }: { children: ReactNode }) {
  const reducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  const [webglOk] = useState(() => (typeof window === 'undefined' ? true : detectWebGL()))
  const [progress, setProgress] = useState(0)
  const lastUiPush = useRef(0)
  const lastChapter = useRef(0)

  useEffect(() => {
    const pushUi = (p: number, force = false) => {
      scrollProgress.current = p
      const chapter = chapterIndexFromProgress(p)
      const now = performance.now()
      // Keep React UI ~20fps; always flush on chapter boundaries
      if (force || chapter !== lastChapter.current || now - lastUiPush.current > 50) {
        lastUiPush.current = now
        lastChapter.current = chapter
        setProgress(p)
      }
    }

    if (reducedMotion) {
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        pushUi(max > 0 ? window.scrollY / max : 0, true)
      }
      onScroll()
      bindScrollToProgress((p, opts) => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        window.scrollTo({ top: p * Math.max(0, max), behavior: opts?.immediate ? 'auto' : 'smooth' })
      })
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => {
        bindScrollToProgress(null)
        window.removeEventListener('scroll', onScroll)
      }
    }

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      touchMultiplier: 1.1,
      lerp: 0.12,
    })

    lenis.on('scroll', ScrollTrigger.update)
    bindScrollToProgress((p, opts) => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      lenis.scrollTo(p * Math.max(0, max), { immediate: Boolean(opts?.immediate) })
    })

    const ticker = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(ticker)
    gsap.ticker.lagSmoothing(0)

    const st = ScrollTrigger.create({
      trigger: '#experience-scroll',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => pushUi(self.progress),
    })

    return () => {
      bindScrollToProgress(null)
      st.kill()
      gsap.ticker.remove(ticker)
      lenis.destroy()
    }
  }, [reducedMotion])

  const chapterIndex = useMemo(() => chapterIndexFromProgress(progress), [progress])

  const { start, end } = chapterProgressBounds(chapterIndex)
  const localProgress = Math.min(1, Math.max(0, (progress - start) / (end - start || 1)))

  const value: ExperienceState = {
    progress,
    chapterIndex,
    localProgress,
    reducedMotion,
    webglOk,
  }

  return (
    <ExperienceContext.Provider value={value}>
      <div
        id="experience-scroll"
        className="experience-scroll"
        style={{ height: `${totalScrollVh}vh` }}
      />
      {children}
    </ExperienceContext.Provider>
  )
}
