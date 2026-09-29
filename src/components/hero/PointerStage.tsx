'use client'

import { type PointerEvent, type ReactNode, useRef } from 'react'

/**
 * Tracks the pointer over its area and exposes it as CSS variables
 * (--mx / --my, from -1 to 1). Child elements with the `parallax` class and a
 * `--depth` value drift with it. The CSS only applies the effect for fine
 * pointers without reduced motion, so this is purely decorative.
 */
export function PointerStage({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty('--mx', x.toFixed(3))
      el.style.setProperty('--my', y.toFixed(3))
    })
  }

  const onPointerLeave = () => {
    cancelAnimationFrame(frame.current)
    ref.current?.style.setProperty('--mx', '0')
    ref.current?.style.setProperty('--my', '0')
  }

  return (
    <div ref={ref} className={className} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      {children}
    </div>
  )
}
