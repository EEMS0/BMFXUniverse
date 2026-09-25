import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

export type HeadingTone = 'yellow' | 'acid' | 'pink' | 'violet' | 'orbit' | 'paper'

const tones: Record<HeadingTone, string> = {
  yellow: 'text-eems-yellow [text-shadow:0_0_28px_rgb(74_116_230/0.55)]',
  acid: 'text-acid [text-shadow:0_0_26px_rgb(157_251_88/0.3)]',
  pink: 'text-pink [text-shadow:0_0_26px_rgb(224_67_210/0.4)]',
  violet: 'text-violet [text-shadow:0_0_26px_rgb(160_124_255/0.4)]',
  orbit: 'text-orbit [text-shadow:0_0_26px_rgb(255_138_61/0.35)]',
  paper: 'text-paper',
}

interface SectionHeadingProps {
  id: string
  title: ReactNode
  eyebrow?: string
  tone?: HeadingTone
  /** Short handwritten note beside the heading. */
  note?: string
  className?: string
  children?: ReactNode
}

/** Eyebrow label + hand-lettered heading (+ optional intro copy). */
export function SectionHeading({ id, title, eyebrow, tone = 'paper', note, className, children }: SectionHeadingProps) {
  return (
    <div className={cn('max-w-2xl', className)}>
      {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
      <h2 id={id} className={cn('font-marker text-[clamp(2.6rem,6vw,4.4rem)] leading-[0.95]', tones[tone])}>
        {title}
      </h2>
      {note ? <p className="font-hand mt-2 -rotate-2 text-2xl text-lilac">{note}</p> : null}
      {children ? <div className="mt-5 space-y-4 text-lg text-haze">{children}</div> : null}
    </div>
  )
}
