#!/usr/bin/env node
/**
 * Builds the static GitHub Pages preview into ./out.
 *
 * Environment (set automatically by .github/workflows/deploy-pages.yml):
 *   NEXT_PUBLIC_BASE_PATH  sub-folder the site is served from, e.g. "/eems-bmfx-website"
 *   NEXT_PUBLIC_SITE_URL   full preview URL, used for social-preview image URLs
 *
 * The preview is static: no enquiry API (the form says so), and images come
 * from pre-sized files instead of the Next.js image optimiser. Note that this
 * replaces the .next build output; run `npm run build` again before `npm start`.
 */
import { spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const env = { ...process.env, NEXT_PUBLIC_DEPLOY_TARGET: 'static-preview' }

const nextCli = createRequire(import.meta.url).resolve('next/dist/bin/next')

/** Runs a Node script with the current Node binary (no shell, same on every OS). */
function runNode(args) {
  const result = spawnSync(process.execPath, args, { cwd: root, env, stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

runNode(['scripts/build-image-variants.mjs'])
runNode([nextCli, 'build'])
// Belt and braces: stop any Jekyll processing from hiding the _next folder.
writeFileSync(path.join(root, 'out', '.nojekyll'), '')
console.log(`\nStatic preview written to out/ (base path: ${env.NEXT_PUBLIC_BASE_PATH || '/'})`)
