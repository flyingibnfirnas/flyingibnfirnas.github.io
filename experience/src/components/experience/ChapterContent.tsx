import { useMemo } from 'react'
import { careerChapters, chapterProgressBounds } from '@/data/careerChapters'
import { beatVisibility } from '@/lib/cameraPath'
import { scrollToProgress } from '@/lib/scrollStore'
import { useExperience } from './ExperienceContext'

export function ChapterContent() {
  const { progress, chapterIndex, localProgress, reducedMotion } = useExperience()
  const chapter = careerChapters[chapterIndex]

  const activeBeat = useMemo(() => {
    let best = chapter.contentBeats[0]
    let bestScore = -1
    const width = reducedMotion ? 0.2 : Math.max(0.09, 0.55 / Math.max(3, chapter.contentBeats.length))
    for (const beat of chapter.contentBeats) {
      const v = beatVisibility(localProgress, beat.t, width)
      if (v > bestScore) {
        bestScore = v
        best = beat
      }
    }
    return { beat: best, visibility: Math.max(bestScore, 0.2) }
  }, [chapter, localProgress, reducedMotion])

  const overlays = chapter.overlays
    .map((o) => ({ ...o, v: beatVisibility(localProgress, o.t, reducedMotion ? 0.08 : 0.05) }))
    .filter((o) => o.v > 0.12)

  const timelineStops = useMemo(
    () =>
      careerChapters.map((c, i) => {
        const { start, end } = chapterProgressBounds(i)
        return { ...c, index: i, start, mid: (start + end) / 2 }
      }),
    [],
  )

  return (
    <div className="chapter-ui">
      <header className="experience-chrome experience-chrome--timeline">
        <a className="chrome-brand" href="/index.html" aria-label="Flying Ibn Firnas — home">
          <img
            className="chrome-logo"
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Flying Ibn Firnas"
            width={128}
            height={128}
          />
        </a>

        <nav className="chrome-timeline" aria-label="Career timeline">
          <div className="timeline-track" aria-hidden="true">
            <div className="timeline-fill" style={{ width: `${progress * 100}%` }} />
          </div>
          <ol className="timeline-stops">
            {timelineStops.map((stop) => {
              const active = stop.index === chapterIndex
              const passed = progress >= stop.start
              return (
                <li key={stop.id} className="timeline-stop">
                  <button
                    type="button"
                    className={[
                      'timeline-node',
                      active ? 'active' : '',
                      passed ? 'passed' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={{ left: `${stop.mid * 100}%` }}
                    onClick={() => scrollToProgress(stop.start, { immediate: reducedMotion })}
                    title={`${stop.name} · ${stop.era}`}
                  >
                    <span className="timeline-dot" />
                    <span className="timeline-era">{stop.era}</span>
                    <span className="timeline-label">{stop.name}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>

        <div className="chrome-actions">
          <a className="chrome-link chrome-back" href="/index.html" aria-label="Back to original site">
            ← Back
          </a>
        </div>
      </header>

      <div
        className="content-panel"
        style={{ opacity: 0.4 + activeBeat.visibility * 0.6 }}
      >
        <p className="panel-kicker">
          {String(chapterIndex + 1).padStart(2, '0')} · {chapter.name}
          <span className="panel-era"> · {chapter.era}</span>
        </p>
        <h1>{activeBeat.beat.title}</h1>
        <p className="panel-body">{activeBeat.beat.body}</p>
      </div>

      <div className="overlay-stack" aria-hidden="true">
        {overlays.map((o) => (
          <div key={o.title} className="tech-chip" style={{ opacity: o.v }}>
            <span className="tech-chip-title">{o.title}</span>
            <span className="tech-chip-body">{o.body}</span>
          </div>
        ))}
      </div>

      <div className="scroll-hint" style={{ opacity: progress < 0.04 ? 1 : 0 }}>
        <span>Scroll to begin</span>
        <div className="scroll-line" />
      </div>

      <div className="progress-rail" aria-hidden="true">
        <div className="progress-fill" style={{ height: `${progress * 100}%` }} />
      </div>
    </div>
  )
}
