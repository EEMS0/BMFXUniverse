import { expect, test } from '@playwright/test'

test.describe('navigation', () => {
  test('desktop nav links reach real sections below the sticky header', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'desktop navigation')
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Main' })
    const expected = [
      ['Music', 'music'],
      ['GFX / VFX (BMFX)', 'bmfx'],
      ['Art', 'art'],
      ['Projects', 'projects'],
      ['About', 'about'],
      ['Hire me', 'hire-me'],
      ['Home', 'home'],
    ]
    for (const [label, id] of expected) {
      await nav.getByRole('link', { name: label, exact: true }).click()
      await expect(page).toHaveURL(new RegExp(`#${id}$`))
      const header = await page.locator('header').boundingBox()
      await expect
        .poll(async () => (await page.locator(`#${id}`).boundingBox())?.y ?? -1, { timeout: 5000 })
        .toBeGreaterThanOrEqual((header?.height ?? 0) - 2)
      await expect
        .poll(async () => (await page.locator(`#${id}`).boundingBox())?.y ?? 9999, { timeout: 5000 })
        .toBeLessThan(140)
    }
  })

  test('"Get a quote" leads to the enquiry form', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Get a quote' }).first().click()
    await expect(page).toHaveURL(/#hire-me$/)
    await expect(page.locator('#enquiry-form')).toBeInViewport()
  })
})

test.describe('mobile menu', () => {
  test('opens as a modal, closes with Escape and returns focus; links close it and move focus', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile menu')
    await page.goto('/')
    const toggle = page.getByRole('button', { name: 'Open menu' })
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await toggle.click()
    const menu = page.getByRole('dialog', { name: 'Menu' })
    await expect(menu).toBeVisible()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('button', { name: 'Close menu' })).toBeFocused()

    // Focus stays inside the modal menu.
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press('Tab')
      const inside = await page.evaluate(() => Boolean(document.activeElement?.closest('#site-menu')) || document.activeElement === document.body)
      expect(inside).toBe(true)
    }

    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await expect(toggle).toBeFocused()

    await toggle.click()
    await menu.getByRole('link', { name: 'Projects' }).click()
    await expect(menu).toBeHidden()
    await expect(page).toHaveURL(/#projects$/)
    await expect(page.locator('#projects')).toBeFocused()
  })
})

test.describe('project viewer', () => {
  test('opens from a card, supports arrows, contains focus, closes on Escape and returns focus', async ({ page }) => {
    await page.goto('/')
    const card = page.locator('section[aria-labelledby="featured-title"] a[href="/work/swag-bag"]')
    await card.click()
    const viewer = page.getByRole('dialog', { name: 'SWAG BAG' })
    await expect(viewer).toBeVisible()
    await expect(page.getByRole('button', { name: 'Close viewer' })).toBeFocused()
    await expect(viewer.getByRole('img')).toHaveAttribute('alt', /SWAG BAG lettering/)
    await expect(viewer).toContainText('2 / 6')

    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('dialog', { name: 'EEMS' })).toBeVisible()
    await page.keyboard.press('ArrowLeft')
    await expect(page.getByRole('dialog', { name: 'SWAG BAG' })).toBeVisible()

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      const inside = await page.evaluate(() => Boolean(document.activeElement?.closest('dialog[open]')) || document.activeElement === document.body)
      expect(inside).toBe(true)
    }

    await page.keyboard.press('Escape')
    await expect(viewer).toBeHidden()
    await expect(card).toBeFocused()
    await expect(page).toHaveURL(/\/$/)
  })

  test('shows every image of a multi-image project', async ({ page }) => {
    await page.goto('/')
    await page.locator('#art a[href="/work/eemsojis"]').click()
    const viewer = page.getByRole('dialog', { name: 'Eemsojis' })
    await expect(viewer).toBeVisible()
    const thumbs = viewer.getByRole('button', { name: /Show image \d of 4/ })
    await expect(thumbs).toHaveCount(4)
    await thumbs.nth(2).click()
    await expect(thumbs.nth(2)).toHaveAttribute('aria-pressed', 'true')
    await expect(viewer.getByRole('img').first()).toHaveAttribute('alt', /worried/)
  })

  test('the card link also works as a real project page', async ({ page }) => {
    await page.goto('/work/symptoms')
    await expect(page.getByRole('heading', { level: 1, name: 'SYMPTOMS' })).toBeVisible()
    await expect(page.getByRole('img', { name: /SYMPTOMS artwork/ })).toBeVisible()
    await page.getByRole('link', { name: 'All projects' }).click()
    await expect(page).toHaveURL(/\/#projects$/)
  })
})

test.describe('projects gallery', () => {
  test('filters by category and only offers categories with entries', async ({ page }) => {
    await page.goto('/')
    const group = page.getByRole('group', { name: 'Filter projects by category' })
    const labels = (await group.getByRole('button').allInnerTexts()).map((text) => text.replace(/\s+\d+$/, '').trim())
    expect(labels).toEqual(['ALL', 'DESIGN', 'VISUALS', 'ILLUSTRATION', 'MUSIC ARTWORK', 'MERCH ARTWORK'])
    const grid = page.locator('#projects ul').last()
    await expect(grid.locator('li')).toHaveCount(10)

    await group.getByRole('button', { name: /Illustration/ }).click()
    await expect(group.getByRole('button', { name: /Illustration/ })).toHaveAttribute('aria-pressed', 'true')
    await expect(grid.locator('li')).toHaveCount(4)
    await expect(page.locator('#projects [aria-live]')).toHaveText('Showing 4 Illustration projects')

    await group.getByRole('button', { name: /Merch artwork/ }).click()
    await expect(grid.locator('li')).toHaveCount(1)
    await expect(grid).toContainText('EEMS merch artwork')
  })
})

test.describe('service preselection', () => {
  test('"Enquire about" links preselect the matching service', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Enquire about video editing' }).click()
    await expect(page.getByRole('checkbox', { name: 'Video editing' })).toBeChecked()
    await expect(page.locator('#enquiry-form')).toBeFocused()
    await expect(page.locator('#enquiry-form')).toBeInViewport()

    await page.getByRole('link', { name: 'Enquire about visual effects' }).click()
    await expect(page.getByRole('checkbox', { name: 'Visual effects' })).toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'Video editing' })).toBeChecked()
  })

  test('deep links with ?service= preselect on load', async ({ page }) => {
    await page.goto('/?service=graphic-design#enquiry-form')
    await expect(page.getByRole('checkbox', { name: 'Graphic design' })).toBeChecked()
  })
})
