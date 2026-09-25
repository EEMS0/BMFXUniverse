'use client'

import { getPublicProject } from '@/content/projects'
import { ArtImage } from '@/components/ui/ArtImage'
import { ArrowUpRight } from '@/components/ui/Icons'
import { cn } from '@/lib/cn'
import { useViewerLink } from './WorkCard'

/** A multi-image project shown as a sheet of stickers (e.g. the Eemsojis). */
export function StickerSheetCard({
  slug,
  list,
  meta,
  className,
}: {
  slug: string
  list?: string[]
  meta: string
  className?: string
}) {
  const link = useViewerLink(slug, list)
  const project = getPublicProject(slug)
  if (!project) return null
  return (
    <a
      {...link}
      className={cn(
        'group relative flex h-full flex-col rounded-lg border border-white/10 bg-ink-850 p-1.5 shadow-card transition duration-300 ease-snap',
        'hover:-translate-y-0.5 hover:border-pink/60 hover:shadow-[0_0_0_1px_rgb(255_109_184/0.5),0_10px_30px_-12px_rgb(255_109_184/0.55)]',
        className,
      )}
    >
      <span className="grid flex-1 grid-cols-2 content-center gap-1 rounded-[5px] bg-[radial-gradient(circle_at_50%_40%,#5a3354,#1a111c_80%)] p-2 md:grid-cols-4 md:p-4">
        {project.images.map((id, index) => (
          <span key={id} className="relative block aspect-square">
            <ArtImage
              id={id}
              decorative
              fill
              sizes="(min-width: 768px) 15vw, 44vw"
              className={cn(
                'object-contain transition-transform duration-500 ease-snap group-hover:scale-105',
                index % 2 ? 'rotate-3' : '-rotate-3',
              )}
            />
          </span>
        ))}
      </span>
      <span className="flex min-h-11 items-center gap-x-3 px-2 pt-2 pb-1">
        <span className="min-w-0">
          <span className="sr-only">View </span>
          <span className="block text-[0.8125rem] leading-snug font-semibold tracking-nav text-paper uppercase">{project.title}</span>
          <span className="block text-[0.75rem] leading-snug tracking-nav text-smoke uppercase">{meta}</span>
        </span>
        <ArrowUpRight className="ml-auto size-4 shrink-0 text-smoke transition group-hover:text-pink" />
      </span>
    </a>
  )
}
