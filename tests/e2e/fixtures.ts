import { test as base, expect, type Page } from '@playwright/test'

/**
 * Tests never talk to the real SoundCloud or Shopify: that would stream real
 * tracks (counting as plays) and depend on the live store. Both are replaced
 * with small stand-ins that behave like the parts of their APIs the site uses.
 */

const soundcloudApiStub = `(() => {
  const Events = { READY: 'ready', PLAY: 'play', PAUSE: 'pause', FINISH: 'finish', ERROR: 'error' };
  const widgets = [];
  function Widget(iframe) {
    const listeners = {};
    const widget = {
      iframe,
      loads: [],
      toggles: 0,
      playing: false,
      bind(event, fn) { (listeners[event] = listeners[event] || []).push(fn); },
      emit(event) {
        if (event === 'play') widget.playing = true;
        if (event === 'pause' || event === 'finish') widget.playing = false;
        (listeners[event] || []).forEach((fn) => fn());
      },
      play() { widget.emit('play'); },
      pause() { widget.emit('pause'); },
      toggle() { widget.toggles += 1; widget.emit(widget.playing ? 'pause' : 'play'); },
      load(url, options) { widget.loads.push({ url, autoPlay: Boolean(options && options.auto_play) }); },
    };
    widgets.push(widget);
    return widget;
  }
  Widget.Events = Events;
  window.SC = { Widget };
  window.__scStub = { widgets };
})();`

const shopifyStub = `(() => {
  window.__shopifyStub = { components: [] };
  window.ShopifyBuy = {
    buildClient(config) { window.__shopifyStub.client = config; return {}; },
    UI: {
      onReady() {
        return Promise.resolve({
          createComponent(type, config) {
            window.__shopifyStub.components.push({ type, id: config.id, moneyFormat: config.moneyFormat });
            const product = document.createElement('p');
            product.textContent = 'Stub product: EEMS tee';
            config.node.appendChild(product);
            setTimeout(() => config.options.productSet.events.afterRender(), 50);
            return Promise.resolve({});
          },
        });
      },
    },
  };
})();`

export type ShopifyMode = 'stub' | 'fail'

async function stubThirdParties(page: Page, shopify: { mode: ShopifyMode }) {
  await page.route('https://w.soundcloud.com/**', (route) => {
    const url = new URL(route.request().url())
    if (url.pathname.endsWith('/api.js')) return route.fulfill({ contentType: 'text/javascript', body: soundcloudApiStub })
    return route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Player</title><p>SoundCloud player stand-in</p>' })
  })
  await page.route('https://sdks.shopifycdn.com/**', (route) =>
    shopify.mode === 'fail' ? route.abort() : route.fulfill({ contentType: 'text/javascript', body: shopifyStub }),
  )
}

export const test = base.extend<{ shopify: { mode: ShopifyMode } }>({
  shopify: [
    async ({ page }, use) => {
      const shopify = { mode: 'stub' as ShopifyMode }
      await stubThirdParties(page, shopify)
      await use(shopify)
    },
    { auto: true },
  ],
})

/** Sends a SoundCloud widget event (play, pause, finish…) from the stand-in player. */
export async function emitPlayerEvent(page: Page, event: 'play' | 'pause' | 'finish' | 'error') {
  await page.evaluate((name) => (window as unknown as StubWindow).__scStub.widgets[0].emit(name), event)
}

export async function playerCalls(page: Page) {
  return page.evaluate(() => {
    const widget = (window as unknown as StubWindow).__scStub?.widgets[0]
    return widget ? { loads: widget.loads, toggles: widget.toggles, widgets: (window as unknown as StubWindow).__scStub.widgets.length } : null
  })
}

interface StubWindow {
  __scStub: { widgets: { emit(event: string): void; loads: { url: string; autoPlay: boolean }[]; toggles: number }[] }
}

export { expect }
