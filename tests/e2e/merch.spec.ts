import AxeBuilder from '@axe-core/playwright'

import { expect, test } from './fixtures'

test.describe('merch page', () => {
  test('loads the EEMS collection from Shopify with the store’s public settings', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/merch')
    await expect(page).toHaveTitle('Merch · EEMS')
    await expect(page.getByRole('heading', { level: 1, name: 'Merch' })).toBeVisible()
    await expect(page.getByText('Secure checkout with Shopify. Shipping is calculated at checkout.').first()).toBeVisible()

    await expect(page.getByText('Stub product: EEMS tee')).toBeVisible()
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0)
    const shopify = await page.evaluate(() => (window as unknown as { __shopifyStub: unknown }).__shopifyStub)
    expect(shopify).toEqual({
      client: { domain: 'rfrjfs-u0.myshopify.com', storefrontAccessToken: expect.stringMatching(/^[0-9a-f]{32}$/) },
      components: [{ type: 'collection', id: '695390503244', moneyFormat: '%C2%A3%7B%7Bamount%7D%7D', background: '#060509' }],
    })
    expect(errors).toEqual([])
  })

  test('keeps the shop’s light text on a dark background in every browser', async ({ page }) => {
    await page.goto('/merch')
    // A frame whose colour scheme differs from the (dark) page gets an opaque
    // white backdrop in Safari, which made the product text unreadable on iPhones.
    const frame = page.locator('.shopify-buy-frame iframe')
    await expect(frame).toHaveCSS('color-scheme', 'normal')
    await expect(page.locator('#shop')).toHaveCSS('background-color', 'rgb(6, 5, 9)')
  })

  test('"Shop the collection" jumps to the products', async ({ page }) => {
    await page.goto('/merch')
    await page.getByRole('link', { name: 'Shop the collection' }).click()
    await expect(page).toHaveURL(/#shop$/)
    await expect(page.getByRole('heading', { level: 2, name: 'Shop the collection' })).toBeInViewport()
  })

  test('explains a failed shop load and can try again', async ({ page, shopify }) => {
    shopify.mode = 'fail'
    await page.goto('/merch')
    const alert = page.getByRole('alert').filter({ hasText: 'The merch shop couldn’t load.' })
    await expect(alert).toBeVisible()

    shopify.mode = 'stub'
    await alert.getByRole('button', { name: 'Try again' }).click()
    await expect(page.getByText('Stub product: EEMS tee')).toBeVisible()
    await expect(alert).toHaveCount(0)
  })

  test('the artwork can be zoomed and explored with the keyboard', async ({ page }) => {
    await page.goto('/merch')
    const zoom = page.getByRole('button', { name: 'Zoom in' })
    await zoom.click()
    const button = page.getByRole('button', { name: 'Zoom out' })
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    const view = page.getByRole('group', { name: /Zoomed-in artwork/ })
    await expect(view).toBeFocused()
    const before = await view.evaluate((element) => getComputedStyle(element).getPropertyValue('--ox'))
    await page.keyboard.press('ArrowRight')
    await expect.poll(() => view.evaluate((element) => getComputedStyle(element).getPropertyValue('--ox'))).not.toBe(before)
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'Zoom in' })).toHaveAttribute('aria-pressed', 'false')
  })

  test('passes an axe WCAG 2 A/AA scan', async ({ page }) => {
    await page.goto('/merch')
    await expect(page.getByText('Stub product: EEMS tee')).toBeVisible()
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    const summary = results.violations.map((violation) => `${violation.id} (${violation.nodes.length}): ${violation.nodes.map((node) => node.target.join(' ')).slice(0, 3).join(' | ')}`)
    expect(summary, summary.join('\n')).toEqual([])
  })
})
