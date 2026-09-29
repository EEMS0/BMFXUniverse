'use client'

import { useRef, useState } from 'react'

import { ArtImage } from '@/components/ui/ArtImage'
import type { ArtworkId } from '@/content/types'
import { cn } from '@/lib/cn'

const moods: { id: ArtworkId; label: string }[] = [
  { id: 'eemojiSmirk', label: 'smirking' },
  { id: 'eemojiGrin', label: 'grinning' },
  { id: 'eemojiWorried', label: 'worried' },
  { id: 'eemojiAnnoyed', label: 'annoyed' },
]

/**
 * The Eemsoji character as a sticker: each press switches to the next
 * expression from the supplied set. A small bit of play, fully keyboard
 * accessible, and it never moves on its own.
 */
export function EemojiSticker({ className, sizes = '160px' }: { className?: string; sizes?: string }) {
  const [index, setIndex] = useState(0)
  const faceRef = useRef<HTMLSpanElement>(null)
  const mood = moods[index]
  const next = moods[(index + 1) % moods.length]

  const onClick = () => {
    setIndex((index + 1) % moods.length)
    // Restart the little bounce without remounting the images.
    const face = faceRef.current
    if (face) {
      face.classList.remove('boop')
      void face.offsetWidth
      face.classList.add('boop')
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Eemsoji character, currently ${mood.label}. Press to make them ${next.label}.`}
      className={cn(
        'relative block w-full cursor-pointer rounded-full p-1 transition-transform duration-200 hover:-rotate-6 active:scale-95',
        className,
      )}
    >
      <span
        ref={faceRef}
        className="relative block aspect-[0.92] w-full [filter:drop-shadow(3px_0_0_#f3eee6)_drop-shadow(-3px_0_0_#f3eee6)_drop-shadow(0_3px_0_#f3eee6)_drop-shadow(0_-3px_0_#f3eee6)_drop-shadow(0_14px_16px_rgb(0_0_0/0.6))]"
      >
        {moods.map((item, i) => (
          <ArtImage
            key={item.id}
            id={item.id}
            decorative
            fill
            sizes={sizes}
            loading="eager"
            className={cn('object-contain', i === index ? 'opacity-100' : 'opacity-0')}
          />
        ))}
      </span>
    </button>
  )
}
