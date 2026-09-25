#!/usr/bin/env node
/**
 * Pre-renders every artwork master in src/assets/art at fixed widths for the
 * static GitHub Pages preview, which has no image optimiser. Output goes to
 * public/art-sizes/ (generated, not committed). Never upscales: widths larger
 * than a master reuse the master's own size.
 *
 *   npm run art:variants
 */
import { readdir, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

// Keep in sync with src/lib/static-image-loader.ts and next.config.ts.
const WIDTHS = [96, 160, 320, 480, 640, 960, 1280, 1920]

const root = path.resolve(import.meta.dirname, '..')
const artDir = path.join(root, 'src', 'assets', 'art')
const outDir = path.join(root, 'public', 'art-sizes')

await rm(outDir, { recursive: true, force: true })
await mkdir(outDir, { recursive: true })

const masters = (await readdir(artDir)).filter((file) => file.endsWith('.webp'))
let count = 0
for (const file of masters) {
  const name = path.basename(file, '.webp')
  const input = path.join(artDir, file)
  const { width: masterWidth, hasAlpha } = await sharp(input).metadata()
  for (const width of WIDTHS) {
    await sharp(input)
      .resize({ width: Math.min(width, masterWidth), withoutEnlargement: true })
      .webp(hasAlpha ? { quality: 80, alphaQuality: 90, effort: 4 } : { quality: 78, effort: 4 })
      .toFile(path.join(outDir, `${name}-${width}.webp`))
    count++
  }
}
console.log(`Wrote ${count} image variants for ${masters.length} artworks to ${path.relative(root, outDir)}`)
