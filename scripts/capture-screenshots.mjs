#!/usr/bin/env node
/**
 * Captures verification screenshots with the locally installed Chrome
 * (Playwright `channel: 'chrome'`, so no browser download is needed).
 *
 *   npm run build && npm run start -- -p 3100    (in another terminal)
 *   node scripts/capture-screenshots.mjs [baseUrl] [outDir]
 *
 * Full-page shots use reduced motion so scroll-driven reveals don't hide
 * content that is below the fold.
 */
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'

const baseUrl = process.argv[2] ?? 'http://localhost:3100'
const outDir = path.resolve(process.argv[3] ?? 'verification/screenshots')
const widths = [360, 390, 768, 1024, 1440, 1920]

await mkdir(outDir, { recursive: true })
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? 'chrome' })

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready
    // Trigger lazy images by walking the page, then return to the top.
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 60))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(400)
}

// Reference-comparison shot at the mockup's size (1536 x 1024), above the fold only.
{
  const context = await browser.newContext({ viewport: { width: 1536, height: 1024 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await settle(page)
  await page.screenshot({ path: path.join(outDir, 'desktop-1536x1024-fold.png') })
  await context.close()
}

for (const width of widths) {
  const height = width < 768 ? 844 : width < 1280 ? 1024 : 1000
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    ...(width < 768 ? { isMobile: true, hasTouch: true } : {}),
  })
  const page = await context.newPage()
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await settle(page)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  await page.screenshot({ path: path.join(outDir, `home-${width}-fold.png`) })
  await page.screenshot({ path: path.join(outDir, `home-${width}-full.png`), fullPage: true })
  console.log(`${width}px: saved (horizontal overflow: ${overflow}px)`)
  await context.close()
}

await browser.close()
console.log(`Screenshots in ${outDir}`)
