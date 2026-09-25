import { expect, test } from '@playwright/test'

test.describe('without JavaScript', () => {
  // Reduced motion turns off CSS smooth scrolling, which otherwise fights
  // Playwright's own scroll-into-view retries when page scripts are disabled.
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' })

  test('content, links and project pages still work', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1, name: 'EEMS' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Projects', level: 2 })).toBeAttached()
    await page.locator('section[aria-labelledby="featured-title"] a[href="/work/symptoms"]').click()
    await expect(page).toHaveURL(/\/work\/symptoms$/)
    await expect(page.getByRole('heading', { level: 1, name: 'SYMPTOMS' })).toBeVisible()
  })

  test('the enquiry form posts to the server and shows an honest result page', async ({ page }) => {
    await page.goto('/#hire-me')
    await page.locator('#enquiry-name').fill('Test Visitor')
    await page.locator('#enquiry-email').fill('visitor@example.com')
    await page.locator('#enquiry-services-video-editing').check()
    await page.locator('#enquiry-details').fill('Short music video edit, roughly three minutes.')
    await page.locator('#enquiry-form button[type="submit"]').click()
    // The test server has no email credentials, so the real outcome is "not configured".
    await expect(page).toHaveURL(/\/enquiry\/not-configured$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Enquiry not sent' })).toBeVisible()
  })
})
