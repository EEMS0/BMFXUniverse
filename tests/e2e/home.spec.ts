import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'

import { expect, test } from './fixtures'

async function walkPage(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 40))
    }
    window.scrollTo(0, 0)
  })
}

test.describe('home page', () => {
  test('is EEMS-only: identity, merch, music, art and about, without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    page.on('pageerror', (error) => errors.push(error.message))

    await page.goto('/')
    await expect(page).toHaveTitle(/EEMS/)
    await expect(page.getByRole('heading', { level: 1, name: 'EEMS' })).toBeVisible()
    await expect(page.getByText('Music. Visuals. Ideas. No Limits.').first()).toBeVisible()
    await expect(page.getByText('Music, artwork and merch from EEMS. Welcome to my creative world.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Listen now' })).toHaveAttribute('href', '/#music')
    await expect(page.getByRole('main').getByRole('link', { name: 'Shop merch', exact: true })).toHaveAttribute('href', '/merch')
    for (const name of ['Merch', 'Music', 'Art']) {
      await expect(page.getByRole('heading', { level: 2, name, exact: true })).toBeAttached()
    }
    await expect(page.locator('body')).not.toContainText(/BMFX|Hire me|enquir/i)

    await walkPage(page)
    expect(errors, errors.join('\n')).toEqual([])
  })

  test('loads every image (no broken artwork)', async ({ page }) => {
    await page.goto('/')
    await walkPage(page)
    await page.waitForLoadState('networkidle')
    const broken = await page.evaluate(() =>
      [...document.images]
        .filter((img) => img.checkVisibility() && img.complete && img.naturalWidth === 0)
        .map((img) => img.currentSrc || img.src),
    )
    expect(broken).toEqual([])
  })

  test('loads no player, audio or video until someone presses play', async ({ page }) => {
    const soundcloud: string[] = []
    page.on('request', (request) => {
      if (request.url().includes('soundcloud.com')) soundcloud.push(request.url())
    })
    await page.goto('/')
    await walkPage(page)
    await expect(page.locator('audio, video, iframe')).toHaveCount(0)
    await expect(page.getByText(/\d:\d\d\s*\/\s*\d:\d\d/)).toHaveCount(0)
    expect(soundcloud).toEqual([])
  })

  test('only links to configured external destinations, opening safely in a new tab', async ({ page }) => {
    await page.goto('/')
    const external = await page.locator('a[href^="http"]').evaluateAll((links) =>
      links.map((link) => ({ href: link.getAttribute('href') ?? '', target: link.getAttribute('target'), rel: link.getAttribute('rel') })),
    )
    const allowed = /^https:\/\/(www\.instagram\.com\/eems420\/|www\.tiktok\.com\/@eems\.co|soundcloud\.com\/eems420(\/[a-z0-9-]+)?)$/
    expect(external.length).toBeGreaterThan(0)
    for (const link of external) {
      expect(link.href).toMatch(allowed)
      expect(link.target).toBe('_blank')
      expect(link.rel).toContain('noopener')
    }
    await expect(page.locator('a[href="#"], a[href=""]')).toHaveCount(0)
    await expect(page.locator('a[href*="spotify"], a[href*="youtube"], a[href^="mailto:"]')).toHaveCount(0)
  })

  test('shows the current year in the footer', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('footer')).toContainText(`© ${new Date().getFullYear()} EEMS`)
  })

  test('skip link moves focus to the main content', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Skip to content' })
    await expect(skip).toBeFocused()
    await expect(skip).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(page.locator('main#main')).toBeFocused()
  })

  test('passes an axe WCAG 2 A/AA scan', async ({ page }) => {
    await page.goto('/')
    await walkPage(page)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    const summary = results.violations.map((violation) => `${violation.id} (${violation.nodes.length}): ${violation.nodes.map((node) => node.target.join(' ')).slice(0, 3).join(' | ')}`)
    expect(summary, summary.join('\n')).toEqual([])
  })
})

test.describe('responsive layout', () => {
  for (const path of ['/', '/merch']) {
    for (const width of [360, 390, 768, 1024, 1440, 1920]) {
      test(`no horizontal scrolling on ${path} at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await page.goto(path)
        await walkPage(page)
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        expect(overflow).toBeLessThanOrEqual(0)
      })
    }
  }
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('content is fully visible and decorative animation is off', async ({ page }) => {
    await page.goto('/')
    const states = await page.locator('.reveal, .intro-drop, .intro-pop, .marquee-track').evaluateAll((elements) =>
      elements.map((element) => ({ opacity: getComputedStyle(element).opacity, animation: getComputedStyle(element).animationName })),
    )
    expect(states.length).toBeGreaterThan(8)
    for (const state of states) {
      expect(state.opacity).toBe('1')
      expect(state.animation).toBe('none')
    }
    const tilt = await page.locator('.tilt').first().evaluate((element) => getComputedStyle(element).transform)
    expect(tilt).toBe('none')
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto')
  })
})
