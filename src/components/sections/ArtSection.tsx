import { Sparkle } from '@/components/decor/Doodles'
import { SectionTear } from '@/components/decor/Torn'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ProjectsGallery } from '@/components/work/ProjectsGallery'
import { copy } from '@/content/site'

/** Filterable gallery of the EEMS artwork. */
export function ArtSection() {
  return (
    <section id="art" aria-labelledby="art-title" className="section overflow-hidden">
      <SectionTear seed={303} from="ink-950" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_15%_20%,rgb(224_67_210/0.13),transparent_70%)]" />
      <div className="shell relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading id="art-title" eyebrow={copy.art.eyebrow} title={copy.art.heading} tone="pink" className="reveal">
            <p>{copy.art.body}</p>
          </SectionHeading>
          <Sparkle aria-hidden="true" className="hidden w-14 rotate-12 text-bubblegum/70 md:block" />
        </div>
        <div className="mt-10">
          <ProjectsGallery />
        </div>
      </div>
    </section>
  )
}
