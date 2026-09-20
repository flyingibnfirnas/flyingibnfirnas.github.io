import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import { sampleCameraPath } from '@/lib/cameraPath'
import { scrollProgress } from '@/lib/scrollStore'
import { careerChapters, chapterProgressBounds } from '@/data/careerChapters'
import { useShotTuner } from './ShotTunerContext'

/**
 * Scroll-driven camera rig.
 * Reads mutable scrollProgress every frame (no React re-render per scroll tick).
 */
export function CameraRig() {
  const { enabled: tuning, freeLook, previewMode, activeSample } = useShotTuner()
  const lookTarget = useMemo(() => new THREE.Vector3(), [])

  useFrame((state) => {
    const cam = state.camera as THREE.PerspectiveCamera

    if (tuning && freeLook && !previewMode) {
      if (activeSample && Math.abs(cam.fov - activeSample.fov) > 0.01) {
        cam.fov = activeSample.fov
        cam.updateProjectionMatrix()
      }
      return
    }

    if (tuning && activeSample) {
      cam.position.set(...activeSample.position)
      lookTarget.set(...activeSample.lookAt)
      cam.lookAt(lookTarget)
      if (Math.abs(cam.fov - activeSample.fov) > 0.01) {
        cam.fov = activeSample.fov
        cam.updateProjectionMatrix()
      }
      return
    }

    const progress = scrollProgress.current

    const chapterIndex = (() => {
      for (let i = 0; i < careerChapters.length; i++) {
        const { start, end } = chapterProgressBounds(i)
        if (progress <= end || i === careerChapters.length - 1) {
          if (progress >= start) return i
        }
      }
      return 0
    })()

    const chapter = careerChapters[chapterIndex]
    if (!chapter?.camera?.length) return

    const { start, end } = chapterProgressBounds(chapterIndex)
    const span = end - start || 1
    const local = Math.min(1, Math.max(0, (progress - start) / span))

    const sample = sampleCameraPath(chapter.camera, local, chapter.subjectYaw ?? 0)
    const [ox, oy, oz] = chapter.subjectOffset ?? [0, 0, 0]

    cam.position.set(sample.position[0] + ox, sample.position[1] + oy, sample.position[2] + oz)
    lookTarget.set(sample.lookAt[0] + ox, sample.lookAt[1] + oy, sample.lookAt[2] + oz)
    cam.lookAt(lookTarget)
    if (Math.abs(cam.fov - sample.fov) > 0.01) {
      cam.fov = sample.fov
      cam.updateProjectionMatrix()
    }
  })

  return null
}
