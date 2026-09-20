import { useShotTuner } from './ShotTunerContext'
import { careerChapters } from '@/data/careerChapters'

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <label className="tuner-row">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <input
        className="tuner-num"
        type="number"
        step={step}
        value={Number(value.toFixed(2))}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}

export function ShotTunerPanel() {
  const {
    enabled,
    setEnabled,
    tuneChapterIndex,
    setTuneChapterIndex,
    freeLook,
    setFreeLook,
    draft,
    setDraft,
    keyframes,
    selectedIndex,
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
  } = useShotTuner()

  const chapter = careerChapters[tuneChapterIndex]
  const hasBayOffset = Boolean(chapter?.subjectOffset)
  const bayLabel =
    chapter?.id === 'automotive' ? 'car bay' : chapter?.id === 'f16' ? 'jet bay' : 'bay'

  const updatePos = (i: 0 | 1 | 2, v: number) => {
    setDraft((s) => {
      const position = [...s.position] as typeof s.position
      position[i] = v
      return { ...s, position }
    })
  }

  const updateLook = (i: 0 | 1 | 2, v: number) => {
    setDraft((s) => {
      const lookAt = [...s.lookAt] as typeof s.lookAt
      lookAt[i] = v
      return { ...s, lookAt }
    })
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet)
    } catch {
      // ignore
    }
  }

  const confirmReset = () => {
    if (window.confirm('Discard captured shots and reload the chapter camera path?')) {
      resetFromChapter()
    }
  }

  const confirmBlank = () => {
    if (window.confirm('Replace the shot list with only the current camera pose?')) {
      clearToBlank()
    }
  }

  return (
    <div className="shot-tuner" style={{ pointerEvents: 'auto' }}>
      {!enabled ? (
        <button type="button" className="tuner-toggle" onClick={() => setEnabled(true)}>
          Shot board (T)
        </button>
      ) : (
        <div className="tuner-panel tuner-panel-wide">
          <div className="tuner-header">
            <strong>Shot board</strong>
            <button type="button" onClick={() => setEnabled(false)}>
              Done
            </button>
          </div>

          <div className="tuner-chapter-tabs">
            {careerChapters.map((c, i) => (
              <button
                key={c.id}
                type="button"
                className={i === tuneChapterIndex ? 'active' : ''}
                onClick={() => setTuneChapterIndex(i)}
              >
                {String(i + 1).padStart(2, '0')} {c.name}
              </button>
            ))}
          </div>

          <p className="tuner-hint">
            Authoring <strong>{chapter?.name}</strong>
            {hasBayOffset
              ? ` — Copy path is chapter-local (${bayLabel}). Orbit uses world space.`
              : ' — Capture exact camera + look-at, then Copy path.'}{' '}
            Auto-saves per chapter in this tab.
          </p>

          <div className="tuner-toolbar">
            <label className="tuner-check">
              <input
                type="checkbox"
                checked={freeLook}
                onChange={(e) => setFreeLook(e.target.checked)}
                disabled={previewMode}
              />
              Drag to orbit (free look)
            </label>
            <label className="tuner-check">
              <input
                type="checkbox"
                checked={previewMode}
                onChange={(e) => {
                  setPreviewMode(e.target.checked)
                  if (e.target.checked) setFreeLook(false)
                }}
              />
              Preview path
            </label>
          </div>

          {previewMode ? (
            <>
              <p className="tuner-section">Path preview</p>
              <SliderRow
                label="t"
                value={previewT}
                min={0}
                max={1}
                step={0.005}
                onChange={setPreviewT}
              />
            </>
          ) : (
            <>
              <p className="tuner-section">Camera position (world)</p>
              <SliderRow label="X" value={draft.position[0]} min={-40} max={40} step={0.1} onChange={(v) => updatePos(0, v)} />
              <SliderRow label="Y" value={draft.position[1]} min={-2} max={30} step={0.05} onChange={(v) => updatePos(1, v)} />
              <SliderRow label="Z" value={draft.position[2]} min={-40} max={40} step={0.1} onChange={(v) => updatePos(2, v)} />

              <p className="tuner-section">Look at (world)</p>
              <SliderRow label="X" value={draft.lookAt[0]} min={-20} max={30} step={0.05} onChange={(v) => updateLook(0, v)} />
              <SliderRow label="Y" value={draft.lookAt[1]} min={-2} max={12} step={0.05} onChange={(v) => updateLook(1, v)} />
              <SliderRow label="Z" value={draft.lookAt[2]} min={-20} max={20} step={0.05} onChange={(v) => updateLook(2, v)} />

              <p className="tuner-section">
                {chapter?.id === 'automotive'
                  ? 'Car yaw'
                  : chapter?.id === 'robotics'
                    ? 'Arm yaw'
                    : chapter?.id === 'avionics'
                      ? 'Drone yaw'
                      : 'Aircraft yaw'}
              </p>
              <SliderRow
                label="°"
                value={draft.subjectYawDeg}
                min={-180}
                max={180}
                step={0.5}
                onChange={(v) => setDraft((s) => ({ ...s, subjectYawDeg: v }))}
              />

              <p className="tuner-section">Lens</p>
              <SliderRow
                label="FOV"
                value={draft.fov}
                min={12}
                max={70}
                step={1}
                onChange={(v) => setDraft((s) => ({ ...s, fov: v }))}
              />
            </>
          )}

          <p className="tuner-section">Key shots ({keyframes.length})</p>
          <div className="shot-list">
            {keyframes.map((k, i) => (
              <button
                key={`${k.t}-${i}`}
                type="button"
                className={i === selectedIndex ? 'shot-chip active' : 'shot-chip'}
                onClick={() => loadSelectedIntoDraft(i)}
              >
                #{i + 1} · t={k.t.toFixed(2)}
              </button>
            ))}
          </div>

          <div className="tuner-actions">
            <button type="button" className="tuner-primary" onClick={() => captureShot()} title="C">
              Capture shot
            </button>
            <button type="button" onClick={updateSelected} title="U">
              Update selected
            </button>
            <button type="button" onClick={deleteSelected}>
              Delete
            </button>
          </div>
          <div className="tuner-actions">
            <button type="button" onClick={redistributeTimes}>
              Even spacing
            </button>
            <button type="button" onClick={confirmBlank}>
              Start from current
            </button>
            <button type="button" onClick={confirmReset}>
              Reload chapter
            </button>
            <button type="button" className="tuner-primary" onClick={copy}>
              Copy path
            </button>
          </div>

          <pre className="tuner-snippet">{snippet}</pre>
          <p className="tuner-hint">Shortcuts: T toggle · C capture · U update · Esc done</p>
        </div>
      )}
    </div>
  )
}
