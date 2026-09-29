'use client'

import type { ReactNode } from 'react'

import { useViewerLink } from './WorkCard'

/** Any content as a link that opens a project in the viewer (or its page without JavaScript). */
export function ViewerLink({
  slug,
  list,
  className,
  children,
  label,
}: {
  slug: string
  list?: string[]
  className?: string
  children: ReactNode
  /** Accessible name when the visible content is only an image. */
  label?: string
}) {
  const link = useViewerLink(slug, list)
  return (
    <a {...link} aria-label={label} className={className}>
      {children}
    </a>
  )
}
