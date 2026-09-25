import { SectionTear } from '@/components/decor/Torn'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ProjectsGallery } from '@/components/work/ProjectsGallery'
import { copy } from '@/content/site'

export function ProjectsSection() {
  return (
    <section id="projects" aria-labelledby="projects-title" className="section bg-ink-950">
      <SectionTear seed={404} from="ink-900" />
      <div className="shell">
        <SectionHeading id="projects-title" title={copy.projects.heading} tone="violet" className="reveal">
          <p>{copy.projects.body}</p>
        </SectionHeading>
        <div className="mt-10">
          <ProjectsGallery />
        </div>
      </div>
    </section>
  )
}
