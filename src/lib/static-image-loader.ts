'use client'

/**
 * Image loader for the static GitHub Pages preview only (see next.config.ts).
 * Static hosting can't resize images on request, so `npm run art:variants`
 * pre-renders each artwork master at these widths into public/art-sizes/.
 * Keep WIDTHS in sync with scripts/build-image-variants.mjs and next.config.ts.
 */
const WIDTHS = [96, 160, 320, 480, 640, 960, 1280, 1920]
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '')

export default function staticImageLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  // Static imports resolve to e.g. /_next/static/media/eems-portrait.12b8gz-zzg070.webp
  const file = src.split('?')[0].split('/').pop() ?? ''
  const match = file.match(/^([a-z0-9-]+)\.[^.]+\.webp$/i)
  if (!match) return src
  const size = WIDTHS.find((candidate) => candidate >= width) ?? WIDTHS[WIDTHS.length - 1]
  return `${BASE_PATH}/art-sizes/${match[1]}-${size}.webp`
}
