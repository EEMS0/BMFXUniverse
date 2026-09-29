import { emitPlayerEvent, expect, playerCalls, test } from './fixtures'

test.describe('navigation', () => {
  test('desktop nav links reach real sections below the sticky header, and Merch opens its page', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'desktop navigation')
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Main' })
    await expect(nav.getByRole('link')).toHaveText(['Home', 'Music', 'Merch', 'Art', 'About'])
    for (const [label, id] of [
      ['Music', 'music'],
      ['Art', 'art'],
      ['About', 'about'],
      ['Home', 'home'],
    ]) {
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

    await nav.getByRole('link', { name: 'Merch', exact: true }).click()
    await expect(page).toHaveURL(/\/merch$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Merch' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Merch', exact: true })).toHaveAttribute('aria-current', 'page')
  })

  test('the header "Shop merch" button leads to the shop', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('banner').getByRole('link', { name: 'Shop merch' }).click()
    await expect(page).toHaveURL(/\/merch$/)
    await expect(page.getByText('Stub product: EEMS tee')).toBeVisible()
  })

  test('the old /merch.html address redirects to the merch page', async ({ page }) => {
    await page.goto('/merch.html')
    await expect(page).toHaveURL(/\/merch\/?$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Merch' })).toBeVisible()
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
    await expect(menu.getByRole('link', { name: 'Merch', exact: true })).toHaveAttribute('href', '/merch')

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
    await menu.getByRole('link', { name: 'Art', exact: true }).click()
    await expect(menu).toBeHidden()
    await expect(page).toHaveURL(/#art$/)
    await expect(page.locator('#art')).toBeFocused()
  })
})

test.describe('SoundCloud player', () => {
  test('loads the official player on demand and follows its play, pause and finish events', async ({ page }) => {
    await page.goto('/')
    const deck = page.locator('#music [data-playing]').first()
    await expect(page.locator('#music iframe')).toHaveCount(0)
    await expect(deck).toContainText('Pick a track')
    await expect(page.getByRole('link', { name: /Open Hunger on SoundCloud/ })).toHaveAttribute('href', 'https://soundcloud.com/eems420/hunger')

    await page.getByRole('button', { name: 'Play Hunger' }).click()
    const player = page.locator('#music iframe')
    await expect(player).toHaveAttribute('title', 'Hunger by EEMS — SoundCloud player')
    await expect(player).toHaveAttribute('src', /tracks%2F2328380321/)
    await expect(player).toHaveAttribute('src', /auto_play=true/)
    await expect.poll(async () => (await playerCalls(page))?.widgets).toBe(1)
    await expect(deck).toContainText('Loading the SoundCloud player…')

    await emitPlayerEvent(page, 'play')
    await expect(deck).toHaveAttribute('data-playing', 'true')
    await expect(deck).toContainText('Playing')
    await page.getByRole('button', { name: 'Pause Hunger' }).click()
    await expect(page.getByRole('button', { name: 'Play Hunger' })).toBeVisible()
    await expect(deck).toHaveAttribute('data-playing', 'false')
    expect((await playerCalls(page))?.toggles).toBe(1)

    // Another track reuses the same player; the frame's name follows the track.
    await page.getByRole('button', { name: 'Play Made of Glass' }).click()
    expect((await playerCalls(page))?.loads.at(-1)).toEqual({ url: 'https://api.soundcloud.com/tracks/2180221011', autoPlay: true })
    await expect(player).toHaveAttribute('title', 'Made of Glass by EEMS — SoundCloud player')
    await emitPlayerEvent(page, 'play')
    await expect(page.getByRole('button', { name: 'Pause Made of Glass' })).toBeVisible()

    // When a track ends, the next one starts.
    await emitPlayerEvent(page, 'finish')
    await expect.poll(async () => (await playerCalls(page))?.loads.at(-1)?.url).toBe('https://api.soundcloud.com/tracks/1856574195')
    await expect(deck).toContainText('I Don’t Mind')
    await expect(page.locator('#music [aria-current="true"]')).toContainText('I Don’t Mind')
  })

  test('a mini player keeps the controls on screen after scrolling away', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Play Frantic' }).click()
    await expect.poll(async () => (await playerCalls(page))?.widgets).toBe(1)
    await emitPlayerEvent(page, 'play')

    const mini = page.getByRole('region', { name: 'Now playing' })
    await expect(mini).toBeHidden()
    await page.locator('#about').scrollIntoViewIfNeeded()
    // Pinned to the screen (not carried off by an animated ancestor).
    await expect(mini).toBeInViewport({ ratio: 1 })
    await expect(mini).toContainText('Frantic')
    // Frantic is the last track, so there is no "next" button.
    await expect(mini.getByRole('button', { name: /Next track/ })).toHaveCount(0)

    await mini.getByRole('button', { name: 'Pause', exact: true }).click()
    await expect(mini.getByRole('button', { name: 'Play', exact: true })).toBeVisible()
    await expect(mini).toBeInViewport({ ratio: 1 })
    expect((await playerCalls(page))?.toggles).toBe(1)
    // Keyboard works too.
    await mini.getByRole('button', { name: 'Hide the mini player' }).focus()
    await page.keyboard.press('Enter')
    await expect(mini).toBeHidden()
  })

  test('says so when the browser blocks the player from starting by itself', async ({ page }) => {
    await page.clock.install()
    await page.goto('/')
    await page.getByRole('button', { name: 'Play Hunger' }).click()
    const deck = page.locator('#music [data-playing]').first()
    await expect(deck).toContainText('Loading the SoundCloud player…')
    await page.clock.fastForward(9000)
    await expect(deck).toContainText('Press play in the SoundCloud player below')
  })
})

test.describe('Eemsoji sticker', () => {
  test('changes expression on each press and cycles back', async ({ page }) => {
    await page.goto('/')
    const sticker = page.getByRole('button', { name: /Eemsoji character/ })
    await expect(sticker).toHaveAccessibleName(/currently smirking/)
    for (const mood of ['grinning', 'worried', 'annoyed', 'smirking']) {
      await sticker.click()
      await expect(sticker).toHaveAccessibleName(new RegExp(`currently ${mood}`))
    }
  })
})

test.describe('project viewer', () => {
  test('opens from a card, supports arrows, contains focus, closes on Escape and returns focus', async ({ page }) => {
    await page.goto('/')
    const card = page.locator('#art a[href="/work/swag-bag"]')
    await card.click()
    const viewer = page.getByRole('dialog', { name: 'SWAG BAG' })
    await expect(viewer).toBeVisible()
    await expect(page.getByRole('button', { name: 'Close viewer' })).toBeFocused()
    await expect(viewer.getByRole('img')).toHaveAttribute('alt', /SWAG BAG lettering/)
    await expect(viewer).toContainText('2 / 9')
    await expect(viewer.getByRole('link', { name: 'Listen to EEMS' })).toHaveAttribute('href', '/#music')

    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('dialog', { name: 'EEMS' })).toBeVisible()
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    const merchViewer = page.getByRole('dialog', { name: 'EEMS merch artwork' })
    await expect(merchViewer).toBeVisible()
    await expect(merchViewer.getByRole('link', { name: 'Shop the merch' })).toHaveAttribute('href', '/merch')
    await page.keyboard.press('ArrowRight')
    await expect(viewer).toBeVisible()

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
    await expect(page.getByRole('link', { name: 'Listen to EEMS' })).toHaveAttribute('href', '/#music')
    await page.getByRole('link', { name: 'All art' }).click()
    await expect(page).toHaveURL(/\/#art$/)
  })

  test('merch artwork pages point to the shop', async ({ page }) => {
    await page.goto('/work/eems-merch-artwork')
    await expect(page.getByRole('heading', { level: 1, name: 'EEMS merch artwork' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Shop the merch' })).toHaveAttribute('href', '/merch')
  })
})

test.describe('art gallery', () => {
  test('filters by category and only offers categories with entries', async ({ page }) => {
    await page.goto('/')
    const group = page.getByRole('group', { name: 'Filter the art by category' })
    const labels = (await group.getByRole('button').allInnerTexts()).map((text) => text.replace(/\s+\d+$/, '').trim())
    expect(labels).toEqual(['ALL', 'DESIGN', 'VISUALS', 'ILLUSTRATION', 'MUSIC ARTWORK', 'MERCH ARTWORK'])
    const grid = page.locator('#art ul').last()
    await expect(grid.locator('li')).toHaveCount(9)

    await group.getByRole('button', { name: /Illustration/ }).click()
    await expect(group.getByRole('button', { name: /Illustration/ })).toHaveAttribute('aria-pressed', 'true')
    await expect(grid.locator('li')).toHaveCount(4)
    await expect(page.locator('#art [aria-live]')).toHaveText('Showing 4 Illustration pieces')

    await group.getByRole('button', { name: /Merch artwork/ }).click()
    await expect(grid.locator('li')).toHaveCount(1)
    await expect(grid).toContainText('EEMS merch artwork')
  })
})
