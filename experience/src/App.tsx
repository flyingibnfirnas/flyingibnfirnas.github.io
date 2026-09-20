import { ExperienceCanvas } from '@/components/experience/ExperienceCanvas'
import { ExperienceController } from '@/components/experience/ExperienceController'
import { ChapterContent } from '@/components/experience/ChapterContent'
import { ShotTunerProvider } from '@/components/experience/ShotTunerContext'
import '@/styles/experience.css'

export default function App() {
  return (
    <ExperienceController>
      <ShotTunerProvider>
        <ExperienceCanvas />
        <ChapterContent />
      </ShotTunerProvider>
    </ExperienceController>
  )
}
