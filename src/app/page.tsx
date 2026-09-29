import { Marquee } from '@/components/decor/Marquee'
import { CollageHero } from '@/components/hero/CollageHero'
import { MerchFeature } from '@/components/merch/MerchFeature'
import { AboutSection } from '@/components/sections/AboutSection'
import { ArtSection } from '@/components/sections/ArtSection'
import { MusicSection } from '@/components/sections/MusicSection'
import { ProjectViewerProvider } from '@/components/work/ProjectViewer'
import { site } from '@/content/site'

export default function HomePage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <ProjectViewerProvider>
        <CollageHero />
        <Marquee words={site.marquee} />
        <MerchFeature />
        <MusicSection />
        <ArtSection />
        <AboutSection />
      </ProjectViewerProvider>
    </main>
  )
}
