import Image, { type ImageProps } from 'next/image'

import { artwork } from '@/content/artwork'
import type { ArtworkId } from '@/content/types'

type ArtImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  id: ArtworkId
  /** Use when nearby text already names the artwork (e.g. inside a labelled link). */
  decorative?: boolean
  /** Overrides the registry description, e.g. a logo used as a heading ("BMFX"). */
  alt?: string
}

/** next/image for a registered artwork: correct alt text, focal point and placeholder. */
export function ArtImage({ id, decorative = false, alt, style, placeholder, ...rest }: ArtImageProps) {
  const art = artwork[id]
  return (
    <Image
      src={art.src}
      alt={decorative ? '' : (alt ?? art.alt)}
      placeholder={placeholder ?? (art.transparent ? 'empty' : 'blur')}
      style={art.focal ? { objectPosition: art.focal, ...style } : style}
      {...rest}
    />
  )
}
