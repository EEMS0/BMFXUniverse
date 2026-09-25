import { expect, type Page, test } from '@playwright/test'

/**
 * Enquiry form states. The "not configured" test uses the real API route (the
 * test server runs without email credentials). Success / failure / network
 * tests replace the API response in the browser: they verify the UI's handling,
 * not real email delivery.
 */
async function fillValidEnquiry(page: Page) {
  await page.goto('/#hire-me')
  await page.getByRole('textbox', { name: 'Name' }).fill('Test Visitor')
  await page.getByRole('textbox', { name: 'Email' }).fill('visitor@example.com')
  await page.getByRole('checkbox', { name: 'Motion graphics' }).check()
  await page.getByRole('textbox', { name: 'Project details' }).fill('Animated logo intro for a music video, around ten seconds long.')
  await page.getByRole('textbox', { name: 'Budget' }).fill('Not sure yet')
}

async function expectTextPreserved(page: Page) {
  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('Test Visitor')
  await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue('visitor@example.com')
  await expect(page.getByRole('textbox', { name: 'Project details' })).toHaveValue(/Animated logo intro/)
  await expect(page.getByRole('checkbox', { name: 'Motion graphics' })).toBeChecked()
}

test.describe('enquiry form', () => {
  test('explains invalid fields, links to them and focuses the summary', async ({ page }) => {
    await page.goto('/#hire-me')
    await page.getByRole('textbox', { name: 'Email' }).fill('not-an-email')
    await page.getByRole('button', { name: 'Send enquiry' }).click()
    const summary = page.locator('[aria-labelledby="enquiry-invalid-title"]')
    await expect(summary).toBeFocused()
    await expect(summary).toContainText('Name: Please enter your name.')
    await expect(summary).toContainText('Email: Please enter a valid email address')
    await expect(summary).toContainText('Service(s): Choose at least one service')
    await expect(page.getByRole('textbox', { name: 'Name' })).toHaveAttribute('aria-invalid', 'true')
    await expect(page.locator('#enquiry-email-error')).toContainText('Error:')
  })

  test('says honestly that nothing was sent when email delivery is not configured (real API)', async ({ page }) => {
    await fillValidEnquiry(page)
    await expect(page.getByText('Online enquiries aren’t switched on yet.')).toBeVisible()
    await page.getByRole('button', { name: 'Send enquiry' }).click()
    const alert = page.locator('[aria-labelledby="enquiry-problem-title"]')
    await expect(alert).toBeFocused()
    await expect(alert).toContainText('Enquiry not sent: email isn’t set up yet')
    await expect(alert).toContainText('has not been sent')
    await expect(alert.getByRole('link', { name: /Message on Instagram/ })).toHaveAttribute('href', 'https://www.instagram.com/eems420/')
    await expectTextPreserved(page)
    await expect(page.getByText('Enquiry submitted')).toHaveCount(0)
  })

  test('shows a pending state, blocks duplicates and confirms only after a successful response (simulated)', async ({ page }) => {
    let posts = 0
    await page.route('**/api/enquiry', async (route) => {
      if (route.request().method() !== 'POST') return route.fulfill({ json: { configured: true } })
      posts++
      await new Promise((resolve) => setTimeout(resolve, 900))
      return route.fulfill({ status: 200, json: { ok: true, status: 'submitted' } })
    })
    await fillValidEnquiry(page)
    const submit = page.getByRole('button', { name: 'Send enquiry' })
    await submit.click()
    const pending = page.getByRole('button', { name: 'Sending…' })
    await expect(pending).toBeDisabled()
    await expect(page.locator('#enquiry-form')).toHaveAttribute('aria-busy', 'true')
    await page.getByRole('textbox', { name: 'Name' }).press('Enter')
    await expect(page.getByRole('heading', { name: 'Enquiry submitted' })).toBeVisible()
    await expect(page.locator('[aria-labelledby="enquiry-sent-title"]')).toBeFocused()
    await expect(page.locator('[aria-labelledby="enquiry-sent-title"]')).toContainText('visitor@example.com')
    expect(posts).toBe(1)

    await page.getByRole('button', { name: 'Send another enquiry' }).click()
    await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('')
  })

  test('reports a provider failure without claiming success (simulated)', async ({ page }) => {
    await page.route('**/api/enquiry', (route) =>
      route.request().method() === 'POST'
        ? route.fulfill({
            status: 502,
            json: { ok: false, status: 'delivery_failed', message: 'The email service didn’t accept your enquiry, so it has not been sent. Please try again later.' },
          })
        : route.fulfill({ json: { configured: true } }),
    )
    await fillValidEnquiry(page)
    await page.getByRole('button', { name: 'Send enquiry' }).click()
    await expect(page.locator('[aria-labelledby="enquiry-problem-title"]')).toContainText('has not been sent')
    await expect(page.getByText('Enquiry submitted')).toHaveCount(0)
    await expectTextPreserved(page)
  })

  test('explains rate limiting with a wait time (simulated)', async ({ page }) => {
    await page.route('**/api/enquiry', (route) =>
      route.request().method() === 'POST'
        ? route.fulfill({
            status: 429,
            json: { ok: false, status: 'rate_limited', message: 'Too many enquiries have come from this connection recently.', retryAfterSeconds: 600 },
          })
        : route.fulfill({ json: { configured: true } }),
    )
    await fillValidEnquiry(page)
    await page.getByRole('button', { name: 'Send enquiry' }).click()
    await expect(page.locator('[aria-labelledby="enquiry-problem-title"]')).toContainText('Try again in about 10 minute(s).')
  })

  test('handles a network failure and keeps the text (simulated)', async ({ page }) => {
    await page.route('**/api/enquiry', (route) => (route.request().method() === 'POST' ? route.abort('internetdisconnected') : route.fulfill({ json: { configured: true } })))
    await fillValidEnquiry(page)
    await page.getByRole('button', { name: 'Send enquiry' }).click()
    await expect(page.locator('[aria-labelledby="enquiry-problem-title"]')).toContainText('Couldn’t reach the server')
    await expectTextPreserved(page)
    await expect(page.getByRole('button', { name: 'Send enquiry' })).toBeEnabled()
  })
})
