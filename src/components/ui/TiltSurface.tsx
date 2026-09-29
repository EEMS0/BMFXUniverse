'use client'

import { type PointerEvent, type ReactNode, useRef } from 'react'

import { cn } from '@/lib/cn'

/**
 * Tilts towards the pointer and moves a soft spotlight with it (mouse only;
 * the CSS disables it for touch and reduced motion). Purely decorative.
 */
export function TiltSurface({ children, className, max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el || event.pointerType !== 'mouse') return
    const rect = el.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height
    el.style.setProperty('--ry', `${((px - 0.5) * 2 * max).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${((0.5 - py) * 2 * max).toFixed(2)}deg`)
    el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`)
    el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`)
  }

  const onPointerLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <div ref={ref} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} className={cn('tilt spotlight', className)}>
      {children}
    </div>
  )
}
