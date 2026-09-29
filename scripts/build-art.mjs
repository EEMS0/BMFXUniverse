#!/usr/bin/env node
/**
 * Builds web derivatives of the supplied original artwork.
 *
 * - Originals are read-only inputs. Nothing in the source folder is modified.
 * - Each source file is checked against ASSET_MANIFEST.json (when present) so a
 *   silently swapped or corrupted original is reported.
 * - Outputs:
 *     src/assets/art/*.webp        optimised masters imported by the site
 *     src/assets/art/derivatives.json   provenance record (source -> output)
 *     src/app/icon.png, apple-icon.png, favicon.ico
 *     public/og-image.jpg          social preview built only from supplied art
 *     src/assets/textures/*.png    procedural grain / crumple tiles (not artwork)
 *
 * Usage:
 *   npm run art
 *   npm run art -- --source "D:/path/to/original-assets"
 *   ART_SOURCE_DIR="D:/path/to/original-assets" npm run art
 */
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(import.meta.dirname, '..')
const argIndex = process.argv.indexOf('--source')
const sourceDir = path.resolve(
  (argIndex > -1 && process.argv[argIndex + 1]) ||
    process.env.ART_SOURCE_DIR ||
    path.join(root, '..', 'EEMS_BMFX_Website_Build_Pack', 'original-assets'),
)
const manifestPath = path.join(sourceDir, '..', 'ASSET_MANIFEST.json')
const artDir = path.join(root, 'src', 'assets', 'art')
const appDir = path.join(root, 'src', 'app')
const publicDir = path.join(root, 'public')
const textureDir = path.join(root, 'src', 'assets', 'textures')

const OPAQUE_WEBP = { quality: 86, effort: 6, smartSubsample: true }
const ALPHA_WEBP = { quality: 88, alphaQuality: 92, effort: 6, smartSubsample: true }

/**
 * One entry per derivative. `max` is the longest edge in pixels (never upscaled).
 * `trimAlpha` crops to the visible (alpha) bounds plus `pad` pixels.
 */
const JOBS = [
  { out: 'eems-wordmark.webp', src: 'wallpaper.png', custom: buildWordmark },
  { out: 'eems-portrait.webp', src: 'EEMS-ghoul.png', max: 1174 },
  { out: 'merch-artwork.webp', src: 'BACK-MERCH.png', max: 2048 },
  { out: 'eems-characters.webp', src: 'Untitled45.png', max: 1600, alpha: true },
  { out: 'swag-bag.webp', src: 'swagbag-s3.png', max: 1600 },
  { out: 'eems-atmosphere.webp', src: 'eems.png', max: 1800 },
  { out: 'symptoms.webp', src: 'Symptoms-album-art.png', max: 1600 },
  { out: 'eemoji-smirk.webp', src: 'Eemsojis_20240801120211.png', max: 900, alpha: true, trimAlpha: true, pad: 16 },
  { out: 'eemoji-annoyed.webp', src: 'Eemsojis_20240801120149.png', max: 900, alpha: true, trimAlpha: true, pad: 16 },
  { out: 'eemoji-worried.webp', src: 'Eemsojis_20240801120204.png', max: 900, alpha: true, trimAlpha: true, pad: 16 },
  { out: 'eemoji-grin.webp', src: '5.PNG', max: 900, alpha: true, trimAlpha: true, pad: 16 },
  // "5.gif" is PNG data with a .gif extension (one opaque frame); libvips sniffs the real format.
  { out: 'character-portrait.webp', src: '5.gif', max: 1400 },
]

async function main() {
  console.log(`Source artwork: ${sourceDir}`)
  if (!existsSync(sourceDir)) {
    console.error(`Source folder not found. Pass --source <dir> or set ART_SOURCE_DIR.`)
    process.exit(1)
  }
  await Promise.all([artDir, publicDir, textureDir].map((d) => mkdir(d, { recursive: true })))

  const manifest = existsSync(manifestPath) ? JSON.parse(await readFile(manifestPath, 'utf8')) : null
  const expected = new Map((manifest?.assets ?? []).map((a) => [a.original_filename, a.sha256]))

  const record = []
  const missing = []
  for (const job of JOBS) {
    const srcPath = path.join(sourceDir, job.src)
    if (!existsSync(srcPath)) {
      missing.push(job.src)
      console.warn(`  MISSING  ${job.src} -> ${job.out} skipped`)
      continue
    }
    const input = await readFile(srcPath)
    const sha256 = createHash('sha256').update(input).digest('hex')
    const want = expected.get(job.src)
    const checksum = want ? (want === sha256 ? 'verified' : 'MISMATCH') : 'not-in-manifest'
    if (checksum === 'MISMATCH') console.warn(`  WARNING  ${job.src} does not match ASSET_MANIFEST.json`)

    const meta = await sharp(input).metadata()
    const pipeline = job.custom ? await job.custom(input) : await standard(input, job)
    const outPath = path.join(artDir, job.out)
    const info = await pipeline.toFile(outPath)
    record.push({
      output: `src/assets/art/${job.out}`,
      source: job.src,
      sourceFormat: meta.format,
      sourceSize: `${meta.width}x${meta.height}`,
      sourceSha256: sha256,
      checksum,
      outputSize: `${info.width}x${info.height}`,
      outputBytes: info.size,
    })
    console.log(`  ${checksum.padEnd(15)} ${job.src.padEnd(30)} -> ${job.out} (${info.width}x${info.height}, ${kb(info.size)})`)
  }

  await writeFile(
    path.join(artDir, 'derivatives.json'),
    JSON.stringify({ generatedBy: 'scripts/build-art.mjs', sourceDir: path.relative(root, sourceDir), missing, derivatives: record }, null, 2) + '\n',
  )

  if (existsSync(path.join(artDir, 'eems-wordmark.webp'))) await buildIcons()
  if (['eems-wordmark.webp', 'eems-portrait.webp', 'merch-artwork.webp'].every((f) => existsSync(path.join(artDir, f)))) {
    await buildSocialPreview()
  }
  await buildGrain()
  await buildCrumple()

  if (missing.length) {
    console.warn(`\nMissing source files (not generated): ${missing.join(', ')}`)
    process.exitCode = 2
  }
}

/** Resize (and optionally alpha-trim) a single original into a WebP master. */
async function standard(input, job) {
  let img = sharp(input, { failOn: 'error' }).rotate()
  if (job.trimAlpha) {
    const box = await alphaBounds(input, 2)
    const meta = await sharp(input).metadata()
    const left = Math.max(0, box.left - job.pad)
    const top = Math.max(0, box.top - job.pad)
    const right = Math.min(meta.width, box.right + job.pad)
    const bottom = Math.min(meta.height, box.bottom + job.pad)
    img = img.extract({ left, top, width: right - left, height: bottom - top })
  }
  img = img.resize({ width: job.max, height: job.max, fit: 'inside', withoutEnlargement: true })
  if (!job.alpha) img = img.removeAlpha()
  return img.webp(job.alpha ? ALPHA_WEBP : OPAQUE_WEBP)
}

/**
 * The EEMS wordmark sits on a grainy near-black background in the original.
 * For the header and hero we crop around the lettering and its glow, then derive
 * alpha from brightness ("unmultiply" against black, with a black point that
 * drops the background grain) and feather the crop edges. Composited over the
 * site's near-black surfaces it reproduces the original lettering and glow.
 */
const WORDMARK_CROP = { left: 120, top: 0, width: 1800, height: 1080 }
const WORDMARK_WIDTH = 1400
// Yellow lettering bounds measured in wallpaper.png (x 308-1746, y 184-900), plus a small margin.
const LETTERING = { left: 272, top: 148, right: 1782, bottom: 936 }

async function buildWordmark(input) {
  const crop = WORDMARK_CROP
  const { data, info } = await sharp(input).extract(crop).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height } = info
  const out = Buffer.alloc(width * height * 4)
  const blackPoint = 32 / 255
  const featherX = 160
  const featherY = 150
  const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t))
  for (let y = 0; y < height; y++) {
    const fy = smooth(Math.min(y, height - 1 - y) / featherY)
    for (let x = 0; x < width; x++) {
      const fx = smooth(Math.min(x, width - 1 - x) / featherX)
      const i = (y * width + x) * 3
      const o = (y * width + x) * 4
      const r = Math.max(0, (data[i] / 255 - blackPoint) / (1 - blackPoint))
      const g = Math.max(0, (data[i + 1] / 255 - blackPoint) / (1 - blackPoint))
      const b = Math.max(0, (data[i + 2] / 255 - blackPoint) / (1 - blackPoint))
      const a = Math.max(r, g, b)
      if (a > 0) {
        out[o] = Math.round((r / a) * 255)
        out[o + 1] = Math.round((g / a) * 255)
        out[o + 2] = Math.round((b / a) * 255)
      }
      out[o + 3] = Math.round(a * fx * fy * 255)
    }
  }
  return sharp(out, { raw: { width, height, channels: 4 } })
    .resize({ width: WORDMARK_WIDTH })
    .webp(ALPHA_WEBP)
}

/** Bounding box of pixels whose alpha exceeds `threshold`. */
async function alphaBounds(input, threshold) {
  const { data, info } = await sharp(input).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true })
  let left = info.width
  let top = info.height
  let right = 0
  let bottom = 0
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[y * info.width + x] > threshold) {
        if (x < left) left = x
        if (x > right) right = x
        if (y < top) top = y
        if (y > bottom) bottom = y
      }
    }
  }
  return { left, top, right: right + 1, bottom: bottom + 1 }
}

/** Favicon (ICO with embedded PNGs), icon.png and apple-icon.png from the wordmark. */
async function buildIcons() {
  const wordmark = path.join(artDir, 'eems-wordmark.webp')
  // Icons are tiny, so crop to the lettering and keep only the glow closest to it.
  const scale = WORDMARK_WIDTH / WORDMARK_CROP.width
  const letters = {
    left: Math.round((LETTERING.left - WORDMARK_CROP.left) * scale),
    top: Math.round((LETTERING.top - WORDMARK_CROP.top) * scale),
    width: Math.round((LETTERING.right - LETTERING.left) * scale),
    height: Math.round((LETTERING.bottom - LETTERING.top) * scale),
  }
  const tile = async (size, padRatio) => {
    const inner = Math.round(size * (1 - padRatio * 2))
    const mark = await sharp(wordmark).extract(letters).resize({ width: inner, height: inner, fit: 'inside' }).toBuffer()
    return sharp({ create: { width: size, height: size, channels: 4, background: '#0b0a0f' } })
      .composite([{ input: mark, gravity: 'centre' }])
      .png({ compressionLevel: 9 })
      .toBuffer()
  }
  const png32 = await tile(32, 0.02)
  const png16 = await tile(16, 0.02)
  const png48 = await tile(48, 0.03)
  await writeFile(path.join(appDir, 'icon.png'), png32)
  await writeFile(path.join(appDir, 'apple-icon.png'), await tile(180, 0.08))
  await writeFile(path.join(appDir, 'favicon.ico'), toIco([[16, png16], [32, png32], [48, png48]]))
  console.log('  icons    src/app/icon.png, apple-icon.png, favicon.ico')
}

/** Minimal ICO container that stores PNG-compressed images (supported since Windows Vista). */
function toIco(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  const entries = []
  let offset = 6 + images.length * 16
  for (const [size, png] of images) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0)
    entry.writeUInt8(size >= 256 ? 0 : size, 1)
    entry.writeUInt8(0, 2)
    entry.writeUInt8(0, 3)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(png.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += png.length
    entries.push(entry)
  }
  return Buffer.concat([header, ...entries, ...images.map(([, png]) => png)])
}

/** 1200x630 social preview composed only from the supplied wordmark, portrait and merch artwork. */
async function buildSocialPreview() {
  const W = 1200
  const H = 630
  const wordmark = await sharp(path.join(artDir, 'eems-wordmark.webp')).resize({ width: 640 }).toBuffer()
  const portraitSize = 360
  const portraitCore = await sharp(path.join(artDir, 'eems-portrait.webp')).resize(portraitSize, portraitSize).toBuffer()
  const portrait = await sharp({ create: { width: portraitSize + 20, height: portraitSize + 20, channels: 4, background: '#efe9df' } })
    .composite([{ input: portraitCore, left: 10, top: 10 }])
    .png()
    .toBuffer()
  const portraitTilted = await sharp(portrait).rotate(-4, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer()
  const merchCore = await sharp(path.join(artDir, 'merch-artwork.webp')).resize(270, 360).toBuffer()
  const merchPoster = await sharp({ create: { width: 286, height: 376, channels: 4, background: '#efe9df' } })
    .composite([{ input: merchCore, left: 8, top: 8 }])
    .png()
    .toBuffer()
  const merchTilted = await sharp(merchPoster).rotate(5, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer()
  await sharp({ create: { width: W, height: H, channels: 4, background: '#0b0a0f' } })
    .composite([
      { input: wordmark, left: -10, top: 120 },
      { input: portraitTilted, left: 520, top: 90 },
      { input: merchTilted, left: 870, top: 150 },
    ])
    .flatten({ background: '#0b0a0f' })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(publicDir, 'og-image.jpg'))
  console.log('  social   public/og-image.jpg (1200x630)')
}

/** Small tileable monochrome grain (deterministic, so builds are reproducible). */
async function buildGrain() {
  const size = 160
  const buf = Buffer.alloc(size * size * 2)
  let seed = 1337
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
  for (let i = 0; i < size * size; i++) {
    const v = rand()
    buf[i * 2] = v > 0.5 ? 255 : 0
    buf[i * 2 + 1] = Math.round(Math.abs(v - 0.5) * 2 * 24)
  }
  await sharp(buf, { raw: { width: size, height: size, channels: 2 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(textureDir, 'grain.png'))
  console.log('  texture  src/assets/textures/grain.png')
}

/**
 * Tileable crumpled-paper shading (grayscale, mid-grey = flat). Blended over the
 * torn paper scraps with background-blend-mode. Built from periodic Worley noise
 * (F2 - F1), which gives angular facets with creases along the cell borders,
 * lit from the top left.
 */
async function buildCrumple() {
  const size = 384
  let seed = 90210
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
  const octaves = [
    { cells: 6, weight: 1 },
    { cells: 13, weight: 0.35 },
  ].map((o) => ({ ...o, points: Array.from({ length: o.cells * o.cells }, () => [rand(), rand()]) }))
  const worley = ({ cells, points }, u, v) => {
    const fx = u * cells
    const fy = v * cells
    const cx = Math.floor(fx)
    const cy = Math.floor(fy)
    let f1 = Infinity
    let f2 = Infinity
    for (let j = -1; j <= 1; j++) {
      for (let i = -1; i <= 1; i++) {
        const gx = cx + i
        const gy = cy + j
        const [px, py] = points[(((gy % cells) + cells) % cells) * cells + (((gx % cells) + cells) % cells)]
        const d = Math.hypot(gx + px - fx, gy + py - fy)
        if (d < f1) {
          f2 = f1
          f1 = d
        } else if (d < f2) f2 = d
      }
    }
    return f2 - f1
  }
  const height = new Float32Array(size * size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let h = 0
      for (const o of octaves) h += o.weight * worley(o, x / size, y / size)
      height[y * size + x] = h
    }
  }
  const h = (x, y) => height[(((y + size) % size) * size) + ((x + size) % size)]
  const light = [-0.55, -0.75, 0.9]
  const len = Math.hypot(...light)
  const [lx, ly, lz] = light.map((c) => c / len)
  const out = Buffer.alloc(size * size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (h(x + 1, y) - h(x - 1, y)) * 16
      const dy = (h(x, y + 1) - h(x, y - 1)) * 16
      const nl = Math.hypot(dx, dy, 1)
      const shade = (-dx * lx - dy * ly + lz) / nl
      out[y * size + x] = Math.max(0, Math.min(255, Math.round(128 + (shade - lz) * 150)))
    }
  }
  await sharp(out, { raw: { width: size, height: size, channels: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(textureDir, 'crumple.png'))
  console.log('  texture  src/assets/textures/crumple.png')
}

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
