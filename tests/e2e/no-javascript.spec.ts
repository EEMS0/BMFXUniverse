import { expect, test } from './fixtures'

test.describe('without JavaScript', () => {
  // Reduced motion turns off CSS smooth scrolling, which otherwise fights
  // Playwright's own scroll-into-view retries when page scripts are disabled.
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' })

  test('content, SoundCloud links and project pages still work', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1, name: 'EEMS' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Music', level: 2 })).toBeAttached()
    await expect(page.getByRole('link', { name: /Open Follow Me Down on SoundCloud/ })).toHaveAttribute('href', 'https://soundcloud.com/eems420/followmedownos')
    // Playwright's text locators skip <noscript>, so these checks use CSS selectors.
    await expect(page.locator('#music noscript > p')).toHaveText(/Turn on JavaScript to play the tracks here/)
    await page.locator('#art a[href="/work/symptoms"]').click()
    await expect(page).toHaveURL(/\/work\/symptoms$/)
    await expect(page.getByRole('heading', { level: 1, name: 'SYMPTOMS' })).toBeVisible()
  })

  test('the merch page explains that the shop needs JavaScript, without a stuck spinner', async ({ page }) => {
    await page.goto('/merch')
    await expect(page.getByRole('heading', { level: 1, name: 'Merch' })).toBeVisible()
    const message = page.locator('#shop noscript > p')
    await expect(message).toBeVisible()
    await expect(message).toHaveText('Please turn on JavaScript to choose colours and sizes and shop the merch.')
    await expect(page.getByText('Loading the merch from the shop…')).toHaveCount(0)
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0)
  })
})
