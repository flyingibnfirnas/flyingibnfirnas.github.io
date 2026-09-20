/**
 * Mutable scroll progress for the R3F render loop.
 * Updated every Lenis/ScrollTrigger tick without React setState —
 * keeps camera motion smooth while UI updates stay throttled.
 */
export const scrollProgress = {
  current: 0,
}

type ScrollToFn = (progress: number, opts?: { immediate?: boolean }) => void

let scrollToImpl: ScrollToFn | null = null

/** Called by ExperienceController once Lenis (or native scroll) is ready. */
export function bindScrollToProgress(fn: ScrollToFn | null) {
  scrollToImpl = fn
}

/** Jump/animate to a global 0–1 progress. Falls back to window.scrollTo. */
export function scrollToProgress(progress: number, opts?: { immediate?: boolean }) {
  const p = Math.min(1, Math.max(0, progress))
  if (scrollToImpl) {
    scrollToImpl(p, opts)
    return
  }
  const max = document.documentElement.scrollHeight - window.innerHeight
  window.scrollTo({
    top: p * Math.max(0, max),
    behavior: opts?.immediate ? 'auto' : 'smooth',
  })
}
