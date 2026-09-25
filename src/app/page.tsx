import { CollageHero } from '@/components/hero/CollageHero'
import { AboutSection } from '@/components/sections/AboutSection'
import { ArtSection } from '@/components/sections/ArtSection'
import { BmfxSection } from '@/components/sections/BmfxSection'
import { ContactSection } from '@/components/sections/ContactSection'
import { MusicSection } from '@/components/sections/MusicSection'
import { PairedPanels } from '@/components/sections/PairedPanels'
import { ProjectsSection } from '@/components/sections/ProjectsSection'
import { FeaturedWorkStrip } from '@/components/work/FeaturedWorkStrip'
import { ProjectViewerProvider } from '@/components/work/ProjectViewer'

export default function HomePage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <ProjectViewerProvider>
        <CollageHero />
        <FeaturedWorkStrip />
        <PairedPanels />
        <MusicSection />
        <BmfxSection />
        <ArtSection />
        <ProjectsSection />
        <AboutSection />
        <ContactSection />
      </ProjectViewerProvider>
    </main>
  )
}
