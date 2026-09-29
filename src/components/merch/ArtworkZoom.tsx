'use client'

import { getImageProps } from 'next/image'
import { type KeyboardEvent, type PointerEvent, useRef, useState } from 'react'

import { ArtImage } from '@/components/ui/ArtImage'
import { ZoomIcon } from '@/components/ui/Icons'
import { artwork } from '@/content/artwork'
import type { ArtworkId } from '@/content/types'
import { cn } from '@/lib/cn'

const ZOOM = 2.6
const LENS = 180

/**
 * Artwork you can look into: a magnifying lens follows the mouse, and the Zoom
 * button enlarges the artwork in place (drag, move the mouse or use the arrow
 * keys to look around; Escape zooms out). Positions are CSS variables, so
 * moving the pointer never re-renders React.
 */
export function ArtworkZoom({
  id,
  sizes,
  caption,
  frameClassName,
}: {
  id: ArtworkId
  sizes: string
  caption?: string
  /** Classes for the frame around the artwork (e.g. a paper mount). The caption sits outside it. */
  frameClassName?: string
}) {
  const art = artwork[id]
  const frameRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const origin = useRef({ x: 50, y: 35 })
  const [zoomed, setZoomed] = useState(false)
  const { props: large } = getImageProps({ src: art.src, alt: '', width: 1600, quality: 85 })

  const setOrigin = (x: number, y: number) => {
    origin.current = { x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) }
    frameRef.current?.style.setProperty('--ox', `${origin.current.x}%`)
    frameRef.current?.style.setProperty('--oy', `${origin.current.y}%`)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const frame = frameRef.current
    if (!frame) return
    const rect = frame.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    if (zoomed) {
      if (event.pointerType === 'mouse') setOrigin((x / rect.width) * 100, (y / rect.height) * 100)
      else if (drag.current) {
        // Dragging moves the view the opposite way, like sliding the artwork.
        const dx = ((event.clientX - drag.current.x) / rect.width) * 100
        const dy = ((event.clientY - drag.current.y) / rect.height) * 100
        setOrigin(drag.current.ox - dx, drag.current.oy - dy)
      }
      return
    }
    if (event.pointerType !== 'mouse') return
    frame.dataset.lens = 'on'
    frame.style.setProperty('--lx', `${x - LENS / 2}px`)
    frame.style.setProperty('--ly', `${y - LENS / 2}px`)
    frame.style.setProperty('--bw', `${rect.width * ZOOM}px`)
    frame.style.setProperty('--bh', `${rect.height * ZOOM}px`)
    frame.style.setProperty('--bx', `${-(x * ZOOM - LENS / 2)}px`)
    frame.style.setProperty('--by', `${-(y * ZOOM - LENS / 2)}px`)
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!zoomed || event.pointerType === 'mouse') return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { x: event.clientX, y: event.clientY, ox: origin.current.x, oy: origin.current.y }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!zoomed) return
    const step = 6
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    if (event.key === 'Escape') {
      event.preventDefault()
      setZoomed(false)
    } else if (moves[event.key]) {
      event.preventDefault()
      setOrigin(origin.current.x + moves[event.key][0], origin.current.y + moves[event.key][1])
    }
  }

  const toggle = () => {
    setZoomed((value) => !value)
    if (frameRef.current) frameRef.current.dataset.lens = 'off'
    requestAnimationFrame(() => frameRef.current?.focus({ preventScroll: true }))
  }

  return (
    <figure className="relative">
      <div className={frameClassName}>
        <div
          ref={frameRef}
          tabIndex={zoomed ? 0 : -1}
          role={zoomed ? 'group' : undefined}
          aria-label={zoomed ? 'Zoomed-in artwork. Use the arrow keys to look around and Escape to zoom out.' : undefined}
          onPointerMove={onPointerMove}
          onPointerDown={onPointerDown}
          onPointerUp={() => {
            drag.current = null
          }}
          onPointerLeave={() => {
            if (frameRef.current) frameRef.current.dataset.lens = 'off'
          }}
          onKeyDown={onKeyDown}
          className={cn(
            'group/zoom relative aspect-[3/4] overflow-hidden rounded-[3px] bg-ink-700 outline-offset-4 [--ox:50%] [--oy:35%]',
            zoomed ? 'cursor-grab touch-none active:cursor-grabbing' : 'cursor-crosshair',
          )}
        >
          <ArtImage
            id={id}
            fill
            loading="eager"
            sizes={sizes}
            className="object-cover transition-transform duration-500 ease-snap [transform-origin:var(--ox)_var(--oy)]"
            style={zoomed ? { transform: `scale(${ZOOM})` } : undefined}
          />
          {/* Magnifying lens (mouse only, hidden while zoomed). */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 hidden rounded-full border-2 border-paper/90 bg-no-repeat shadow-[0_18px_40px_-10px_rgb(0_0_0/0.9)] [background-position:var(--bx)_var(--by)] [background-size:var(--bw)_var(--bh)] [translate:var(--lx)_var(--ly)] group-data-[lens=on]/zoom:block"
            style={{ width: LENS, height: LENS, backgroundImage: `url("${large.src}")` }}
          />
        </div>
      </div>
      <figcaption className="relative mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-ink-950/90 py-2 pr-2 pl-4">
        {caption ? <span className="text-sm text-haze">{caption}</span> : null}
        <button
          type="button"
          onClick={toggle}
          aria-pressed={zoomed}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-semibold tracking-nav text-paper uppercase transition-colors hover:border-acid hover:text-acid"
        >
          <ZoomIcon className="size-4" />
          {zoomed ? 'Zoom out' : 'Zoom in'}
        </button>
      </figcaption>
    </figure>
  )
}
