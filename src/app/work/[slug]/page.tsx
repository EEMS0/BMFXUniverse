import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArtImage } from '@/components/ui/ArtImage'
import { ButtonLink } from '@/components/ui/Button'
import { ArrowLeft } from '@/components/ui/Icons'
import { ProjectMeta } from '@/components/work/ProjectMeta'
import { artwork } from '@/content/artwork'
import { getPublicProject, publicProjects } from '@/content/projects'
import { cn } from '@/lib/cn'
import { IS_STATIC_PREVIEW } from '@/lib/paths'
import { getSiteUrl } from '@/lib/site-url'

export const dynamicParams = false

export function generateStaticParams() {
  return publicProjects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: PageProps<'/work/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const project = getPublicProject(slug)
  if (!project) return {}
  return {
    title: project.title,
    description: `${project.title}: ${project.label}.`,
    ...(getSiteUrl() && !IS_STATIC_PREVIEW ? { alternates: { canonical: `/work/${project.slug}` } } : {}),
  }
}

/** Full page for a single project. Also the fallback when JavaScript is unavailable. */
export default async function WorkPage({ params }: PageProps<'/work/[slug]'>) {
  const { slug } = await params
  const project = getPublicProject(slug)
  if (!project) notFound()

  const index = publicProjects.findIndex((item) => item.slug === slug)
  const prev = publicProjects[(index - 1 + publicProjects.length) % publicProjects.length]
  const next = publicProjects[(index + 1) % publicProjects.length]

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <div className="shell py-10 sm:py-14">
        <Link href="/#projects" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-haze uppercase tracking-nav hover:text-acid">
          <ArrowLeft className="size-4" />
          All projects
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
          <div className="space-y-6">
            {project.images.map((id, imageIndex) => (
              <figure
                key={id}
                className={cn(
                  'overflow-hidden rounded-xl border border-white/10 bg-ink-850 p-2',
                  artwork[id].transparent && 'bg-[radial-gradient(circle_at_50%_42%,#4a2f49,#140f19_75%)] p-6 sm:p-10',
                )}
              >
                <ArtImage
                  id={id}
                  quality={85}
                  loading={imageIndex === 0 ? 'eager' : 'lazy'}
                  fetchPriority={imageIndex === 0 ? 'high' : undefined}
                  sizes="(min-width: 1024px) 58vw, 94vw"
                  className="mx-auto h-auto max-h-[85vh] w-auto max-w-full rounded-md object-contain"
                  style={{ objectPosition: 'center' }}
                />
              </figure>
            ))}
          </div>

          <div className="lg:sticky lg:top-[calc(var(--header-height)+2rem)]">
            <ProjectMeta project={project} as="h1" />
            <ButtonLink href="/#hire-me" clientNav variant="acid" className="mt-8">
              Enquire about a project
            </ButtonLink>
            <nav aria-label="More projects" className="mt-10 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 text-sm">
              <Link href={`/work/${prev.slug}`} className="group rounded-lg border border-white/10 p-3 hover:border-violet/60">
                <span className="eyebrow block">Previous</span>
                <span className="mt-1 block font-semibold text-paper group-hover:text-acid">{prev.title}</span>
              </Link>
              <Link href={`/work/${next.slug}`} className="group rounded-lg border border-white/10 p-3 text-right hover:border-violet/60">
                <span className="eyebrow block">Next</span>
                <span className="mt-1 block font-semibold text-paper group-hover:text-acid">{next.title}</span>
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </main>
  )
}
