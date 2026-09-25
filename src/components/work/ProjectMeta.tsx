import { categoryLabels } from '@/content/projects'
import type { PublicProject } from '@/content/types'
import { cn } from '@/lib/cn'

/** Title, label, categories and confirmed context — shared by the viewer and /work pages. */
export function ProjectMeta({
  project,
  headingId,
  as: Heading = 'h2',
  className,
}: {
  project: PublicProject
  headingId?: string
  as?: 'h1' | 'h2'
  className?: string
}) {
  return (
    <div className={className}>
      <Heading id={headingId} className="font-marker text-[clamp(2rem,4vw,3rem)] leading-none text-paper">
        {project.title}
      </Heading>
      <p className="mt-3 text-lg text-haze">{project.label}</p>
      {project.context ? <p className="mt-3 text-base text-haze">{project.context}</p> : null}
      <ul className="mt-5 flex flex-wrap gap-2" aria-label="Categories">
        {project.categories.map((category) => (
          <li
            key={category}
            className={cn('rounded-full border border-white/15 px-3 py-1 text-[0.75rem] font-semibold uppercase tracking-label text-haze')}
          >
            {categoryLabels[category]}
          </li>
        ))}
      </ul>
    </div>
  )
}
