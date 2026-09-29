'use client'

import type { MouseEvent, PointerEvent } from 'react'

import { artwork } from '@/content/artwork'
import { getPublicProject } from '@/content/projects'
import { ArtImage } from '@/components/ui/ArtImage'
import { ArrowUpRight } from '@/components/ui/Icons'
import { cn } from '@/lib/cn'
import { workHref } from '@/lib/paths'
import { useProjectViewer } from './ProjectViewer'

const frames = {
  landscape: 'aspect-[4/3]',
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  wide: 'aspect-[16/10]',
  /** Wide on phones; fills the remaining height of a stretched grid cell from md up. */
  fill: 'aspect-[16/10] md:aspect-auto md:min-h-56 md:flex-1',
}

export interface WorkCardProps {
  slug: string
  /** Caption title; defaults to the project title. */
  title?: string
  /** Caption meta (category); defaults to the project label. */
  meta?: string
  /** Order used by the viewer's previous/next buttons. */
  list?: string[]
  sizes: string
  frame?: keyof typeof frames
  /** Tailwind classes for the matte behind transparent artwork. */
  matte?: string
  loading?: 'eager' | 'lazy'
  /** Unique view-transition name, so the card glides when a gallery re-orders. */
  transitionName?: string
  className?: string
}

/**
 * Props for a link that shows a project. It is a real link to /work/[slug]
 * (works without JavaScript); with JavaScript it opens the viewer instead.
 */
export function useViewerLink(slug: string, list?: string[]) {
  const viewer = useProjectViewer()
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!viewer || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    viewer.open(slug, list, event.currentTarget)
  }
  return { href: workHref(slug), onClick, 'aria-haspopup': viewer ? ('dialog' as const) : undefined }
}

/** Tilt towards the mouse and move the card's spotlight (CSS ignores it for touch / reduced motion). */
function trackPointer(event: PointerEvent<HTMLElement>) {
  if (event.pointerType !== 'mouse') return
  const el = event.currentTarget
  const rect = el.getBoundingClientRect()
  const px = (event.clientX - rect.left) / rect.width
  const py = (event.clientY - rect.top) / rect.height
  el.style.setProperty('--ry', `${((px - 0.5) * 10).toFixed(2)}deg`)
  el.style.setProperty('--rx', `${((0.5 - py) * 10).toFixed(2)}deg`)
  el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`)
  el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`)
}

function resetPointer(event: PointerEvent<HTMLElement>) {
  event.currentTarget.style.setProperty('--rx', '0deg')
  event.currentTarget.style.setProperty('--ry', '0deg')
}

/** Artwork tile with a caption that opens the project viewer. */
export function WorkCard({ slug, title, meta, list, sizes, frame = 'landscape', matte, loading, transitionName, className }: WorkCardProps) {
  const link = useViewerLink(slug, list)
  const project = getPublicProject(slug)
  if (!project) return null
  const art = artwork[project.images[0]]

  return (
    <a
      {...link}
      onPointerMove={trackPointer}
      onPointerLeave={resetPointer}
      style={transitionName ? { viewTransitionName: transitionName } : undefined}
      className={cn(
        'tilt spotlight group block rounded-lg border border-white/10 bg-ink-850 p-1.5 shadow-card transition-[border-color,box-shadow] duration-300 ease-snap',
        'hover:border-violet/60 hover:shadow-violet focus-visible:border-acid',
        frame === 'fill' && 'md:flex md:h-full md:flex-col',
        className,
      )}
    >
      <span
        className={cn(
          'relative block overflow-hidden rounded-[5px] bg-ink-700',
          frames[frame],
          art.transparent && (matte ?? 'bg-[radial-gradient(circle_at_50%_40%,#43304f,#15111b_75%)]'),
        )}
      >
        <ArtImage
          id={project.images[0]}
          decorative
          fill
          sizes={sizes}
          loading={loading}
          className={cn(
            'transition-transform duration-500 ease-snap group-hover:scale-[1.05]',
            art.transparent ? 'object-contain p-[8%]' : 'object-cover',
          )}
        />
      </span>
      <span className="flex min-h-11 items-center gap-x-3 px-2 pt-2 pb-1">
        <span className="min-w-0">
          <span className="sr-only">View </span>
          <span className="block text-[0.8125rem] leading-snug font-semibold tracking-nav text-paper uppercase">{title ?? project.title}</span>
          <span className="block text-[0.75rem] leading-snug tracking-nav text-smoke uppercase">{meta ?? project.label}</span>
        </span>
        <ArrowUpRight className="ml-auto size-4 shrink-0 text-smoke transition group-hover:text-acid" />
      </span>
    </a>
  )
}
