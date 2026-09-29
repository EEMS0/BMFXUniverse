'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { buttonClasses } from '@/components/ui/Button'
import { AlertIcon, Spinner } from '@/components/ui/Icons'
import { merch } from '@/content/merch'

/** The parts of Shopify's Buy Button SDK used here. */
interface BuyButtonUI {
  createComponent(type: 'collection', config: Record<string, unknown>): Promise<unknown>
}
interface ShopifyBuyGlobal {
  buildClient(config: { domain: string; storefrontAccessToken: string }): unknown
  UI: { onReady(client: unknown): Promise<BuyButtonUI> }
}

declare global {
  interface Window {
    ShopifyBuy?: ShopifyBuyGlobal
  }
}

let sdk: Promise<ShopifyBuyGlobal> | null = null

function loadSdk(): Promise<ShopifyBuyGlobal> {
  if (window.ShopifyBuy?.UI) return Promise.resolve(window.ShopifyBuy)
  sdk ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = merch.shopify.sdkUrl
    script.async = true
    script.onload = () => (window.ShopifyBuy ? resolve(window.ShopifyBuy) : reject(new Error('Shopify SDK missing')))
    script.onerror = () => {
      sdk = null
      reject(new Error('Shopify SDK failed to load'))
    }
    document.head.appendChild(script)
  })
  return sdk
}

// Site palette for Shopify's product, cart and toggle frames.
/** The shop section's background (ink-950), repeated inside Shopify's frame. */
const shopBackground = '#060509'
const ink = '#100e15'
const paper = '#f3eee6'
const haze = '#cdc6d9'
const smoke = '#a59eb4'
const line = '#3d374a'
const acid = '#9dfb58'
const acidHover = '#b3ff7d'
const font = "'Space Grotesk', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

const buttonBase = {
  'background-color': acid,
  color: '#060509',
  'font-family': font,
  'font-weight': '700',
  'letter-spacing': '0.08em',
  'text-transform': 'uppercase',
  'border-radius': '999px',
  ':hover': { 'background-color': acidHover, color: '#060509' },
  ':focus': { 'background-color': acidHover, color: '#060509' },
}
const acidButton = { ...buttonBase, 'padding-left': '26px', 'padding-right': '26px' }

// Media queries run inside Shopify's frame, so they match the width of the shop area.
// Shopify writes each media block before the matching base rule, so a property
// that changes with width must only appear in the media blocks, never in the base.
const phone = '@media (max-width: 600px)'
const wide = '@media (min-width: 601px)'

function collectionOptions(onRendered: () => void) {
  return {
    product: {
      styles: {
        // Two products per row on phones, three on wider screens.
        product: {
          'text-align': 'left',
          [phone]: {
            'min-width': '0',
            width: 'calc(50% - 12px)',
            'max-width': 'calc(50% - 12px)',
            'margin-left': '12px',
            'margin-bottom': '36px',
          },
          [wide]: {
            'max-width': 'calc(33.333% - 24px)',
            'margin-left': '24px',
            'margin-bottom': '48px',
            width: 'calc(33.333% - 24px)',
          },
        },
        title: {
          color: paper,
          'font-family': font,
          'font-weight': '700',
          [phone]: { 'font-size': '14px', 'letter-spacing': '0.03em' },
          [wide]: { 'font-size': '17px', 'letter-spacing': '0.04em' },
        },
        price: { color: acid, 'font-family': font, 'font-weight': '600', [phone]: { 'font-size': '15px' }, [wide]: { 'font-size': '16px' } },
        compareAt: { color: smoke, 'font-family': font },
        unitPrice: { color: smoke, 'font-family': font },
        button: {
          ...buttonBase,
          [phone]: { width: '100%', 'font-size': '13px', 'padding-left': '12px', 'padding-right': '12px' },
          [wide]: { 'font-size': '15px', 'padding-left': '26px', 'padding-right': '26px' },
        },
      },
      text: { button: 'Add to cart' },
    },
    productSet: {
      events: { afterRender: onRendered },
      styles: {
        // An opaque dark backing, so the light text stays readable even where a
        // browser paints a white backdrop behind the frame (see globals.css).
        productSet: { 'background-color': shopBackground },
        products: { [phone]: { 'margin-left': '-12px' }, [wide]: { 'margin-left': '-24px' } },
        paginationButton: { ...acidButton, 'background-color': 'transparent', color: paper, border: `1px solid ${line}` },
      },
    },
    option: {
      styles: {
        label: { color: haze, 'font-family': font, 'font-size': '13px', 'letter-spacing': '0.08em', 'text-transform': 'uppercase' },
        select: { 'background-color': ink, color: paper, 'border-color': line, 'font-family': font, 'border-radius': '10px', width: '100%' },
        selectIcon: { fill: haze },
      },
    },
    modalProduct: {
      contents: { img: false, imgWithCarousel: true, button: false, buttonWithQuantity: true },
      styles: {
        title: { color: paper, 'font-family': font },
        price: { color: acid, 'font-family': font },
        description: { color: haze, 'font-family': font },
        button: acidButton,
        quantityInput: { color: paper, 'border-color': line, 'background-color': ink },
        quantityButton: { color: paper, 'border-color': line },
      },
      text: { button: 'Add to cart' },
    },
    modal: {
      styles: {
        modal: { 'background-color': ink },
        close: { color: paper, ':hover': { color: acid } },
      },
    },
    cart: {
      popup: false,
      text: { total: 'Subtotal', button: 'Checkout' },
      styles: {
        cart: { 'background-color': ink, color: paper },
        header: { 'background-color': ink },
        title: { color: paper, 'font-family': font },
        close: { color: paper, ':hover': { color: acid } },
        footer: { 'background-color': ink },
        subtotalText: { color: paper, 'font-family': font },
        subtotal: { color: paper, 'font-family': font },
        notice: { color: smoke, 'font-family': font },
        empty: { color: haze, 'font-family': font },
        button: acidButton,
      },
    },
    lineItem: {
      styles: {
        itemTitle: { color: paper, 'font-family': font },
        variantTitle: { color: smoke, 'font-family': font },
        price: { color: paper, 'font-family': font },
        fullPrice: { color: paper, 'font-family': font },
        quantity: { color: paper },
        quantityInput: { color: paper, 'border-color': line, 'background-color': ink },
        quantityButton: { color: paper, 'border-color': line },
      },
    },
    toggle: {
      styles: {
        toggle: { 'background-color': acid, ':hover': { 'background-color': acidHover }, ':focus': { 'background-color': acidHover } },
        count: { color: '#060509', 'font-size': '14px', 'font-weight': '700' },
        iconPath: { fill: '#060509' },
      },
    },
  }
}

type Status = 'loading' | 'ready' | 'error'

const subscribeNever = () => () => {}

/**
 * The live "EEMS merch" collection from Shopify (products, colours, sizes,
 * prices and stock come straight from the store). Checkout happens on
 * Shopify; this site never handles payment details.
 */
export function ShopifyCollection() {
  const nodeRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [attempt, setAttempt] = useState(0)
  // False in the server HTML, so visitors without JavaScript never see a spinner that can't finish.
  const hydrated = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  )
  const loading = hydrated && status === 'loading'

  useEffect(() => {
    const node = nodeRef.current
    // Shopify renders into this node once per attempt (guards React's development double-run).
    if (!node || node.dataset.attempt === String(attempt)) return
    node.dataset.attempt = String(attempt)
    node.replaceChildren()

    const timer = window.setTimeout(() => setStatus((current) => (current === 'ready' ? current : 'error')), 25_000)
    const onRendered = () => {
      window.clearTimeout(timer)
      setStatus('ready')
    }
    loadSdk()
      .then((ShopifyBuy) => {
        const client = ShopifyBuy.buildClient({ domain: merch.shopify.domain, storefrontAccessToken: merch.shopify.storefrontAccessToken })
        return ShopifyBuy.UI.onReady(client).then((ui) =>
          ui.createComponent('collection', {
            id: merch.shopify.collectionId,
            node,
            moneyFormat: merch.shopify.moneyFormat,
            options: collectionOptions(onRendered),
          }),
        )
      })
      .catch(() => {
        window.clearTimeout(timer)
        setStatus('error')
      })
  }, [attempt])

  return (
    <div aria-busy={loading}>
      {loading ? (
        <p role="status" className="flex items-center gap-3 py-10 text-haze">
          <Spinner className="size-5 animate-spin text-acid motion-reduce:animate-none" />
          Loading the merch from the shop…
        </p>
      ) : null}
      {status === 'error' ? (
        <div role="alert" className="my-6 flex flex-col items-start gap-4 rounded-xl border border-ember/60 bg-ember/[0.08] p-5">
          <p className="flex items-center gap-2 font-semibold text-paper">
            <AlertIcon className="size-5 text-ember" />
            The merch shop couldn’t load.
          </p>
          <p className="text-sm text-haze">Check your connection and try again.</p>
          <button
            type="button"
            onClick={() => {
              setStatus('loading')
              setAttempt((count) => count + 1)
            }}
            className={buttonClasses('outline-acid', 'sm')}
          >
            Try again
          </button>
        </div>
      ) : null}
      <noscript>
        <p className="py-6 text-haze">Please turn on JavaScript to choose colours and sizes and shop the merch.</p>
      </noscript>
      <div ref={nodeRef} id="eems-merch-collection" />
    </div>
  )
}
