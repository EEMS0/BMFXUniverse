import type { CSSProperties, ReactNode } from 'react'

import { cn } from '@/lib/cn'
import { tornPolygon, tornStripPath } from '@/lib/torn'

interface TornFrameProps {
  /** Changes the tear pattern; keep it stable so the outline never shifts. */
  seed: number
  className?: string
  /** Paper colour showing around the torn picture. */
  paper?: 'paper' | 'ink' | 'violet'
  children: ReactNode
}

const paperClass = { paper: 'scrap-paper', ink: 'scrap-ink', violet: 'scrap-violet' }

/**
 * A picture pasted onto a torn scrap: an outer torn sheet with the picture
 * clipped by a second, slightly smaller torn edge on top of it.
 */
export function TornFrame({ seed, className, paper = 'paper', children }: TornFrameProps) {
  return (
    <div className={cn('relative [filter:drop-shadow(0_26px_34px_rgb(0_0_0/0.7))]', className)}>
      <div aria-hidden="true" className={cn('absolute inset-0', paperClass[paper])} style={{ clipPath: tornPolygon(seed, { depth: 1.7, steps: 28 }) }} />
      <div className="absolute inset-[2.6%] overflow-hidden" style={{ clipPath: tornPolygon(seed + 101, { depth: 2.4, steps: 32 }) }}>
        {children}
      </div>
    </div>
  )
}

interface PaperScrapProps {
  seed: number
  className?: string
  tone?: 'violet' | 'ink' | 'paper'
  depth?: number
  style?: CSSProperties
}

/** Decorative torn sheet placed behind collage elements. */
export function PaperScrap({ seed, className, tone = 'violet', depth = 3, style }: PaperScrapProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute', paperClass[tone], className)}
      style={{ clipPath: tornPolygon(seed, { depth, steps: 26 }), ...style }}
    />
  )
}

const tearTones = {
  'ink-950': 'bg-ink-950',
  'ink-900': 'bg-ink-900 grain',
}

/**
 * Torn transition at the top of a section: a strip of the previous section's
 * paper tearing down into this one. Sits inside the section's own box, so it
 * is never clipped by overflow rules.
 */
export function SectionTear({ seed, from }: { seed: number; from: keyof typeof tearTones }) {
  const clipPath = tornPolygon(seed, { edges: ['bottom'], depth: 72, steps: 70 })
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-6 sm:h-8">
      <div className="absolute inset-0 translate-y-[2px] bg-violet/30" style={{ clipPath }} />
      <div className={cn('absolute inset-0', tearTones[from])} style={{ clipPath }} />
    </div>
  )
}

interface TornEdgeProps {
  seed: number
  className?: string
  /** Fill of the torn strip. */
  fill?: string
  /** Colour of the thin paper-fibre line along the tear. */
  fibre?: string
  flip?: boolean
}

/** Full-width torn strip used to break sections apart. */
export function TornEdge({ seed, className, fill = '#2f1658', fibre = '#b99cf0', flip = false }: TornEdgeProps) {
  const path = tornStripPath(seed, { height: 40, amplitude: 18 })
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1000 40"
      preserveAspectRatio="none"
      className={cn('pointer-events-none block h-7 w-full sm:h-9', flip && 'rotate-180', className)}
    >
      <path d={path} fill={fibre} opacity={0.55} transform="translate(0 -2.2)" />
      <path d={path} fill={fill} />
    </svg>
  )
}
