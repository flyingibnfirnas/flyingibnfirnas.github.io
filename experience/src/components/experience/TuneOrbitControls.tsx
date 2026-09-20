import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useShotTuner } from './ShotTunerContext'

/**
 * Free-look orbit while authoring shots.
 * Live camera pose is written into draft (rAF-throttled) so Capture never grabs a stale pose.
 */
export function TuneOrbitControls() {
  const { enabled, freeLook, previewMode, draft, setDraft, selectedIndex } = useShotTuner()
  const { camera } = useThree()
  const controls = useRef<OrbitControlsImpl>(null)
  const draftRef = useRef(draft)
  draftRef.current = draft
  const syncing = useRef(false)
  const raf = useRef(0)

  useEffect(() => {
    if (!enabled || !freeLook || previewMode) return
    const d = draftRef.current
    syncing.current = true
    camera.position.set(...d.position)
    if (controls.current) {
      controls.current.target.set(...d.lookAt)
      controls.current.update()
    }
    syncing.current = false
  }, [enabled, freeLook, previewMode, selectedIndex, camera])

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  if (!enabled || !freeLook || previewMode) return null

  const pullDraftFromCamera = () => {
    if (syncing.current) return
    const c = controls.current
    if (!c) return
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      setDraft((s) => ({
        ...s,
        position: [camera.position.x, camera.position.y, camera.position.z],
        lookAt: [c.target.x, c.target.y, c.target.z],
      }))
    })
  }

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      onChange={pullDraftFromCamera}
      onEnd={pullDraftFromCamera}
    />
  )
}
