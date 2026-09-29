import type { Metadata } from 'next'
import type { CSSProperties } from 'react'

import { Sparkle, Starburst } from '@/components/decor/Doodles'
import { Marquee } from '@/components/decor/Marquee'
import { PaperScrap, TornEdge } from '@/components/decor/Torn'
import { EemojiSticker } from '@/components/eemoji/EemojiSticker'
import { ArtworkZoom } from '@/components/merch/ArtworkZoom'
import { ShopifyCollection } from '@/components/merch/ShopifyCollection'
import { buttonClasses } from '@/components/ui/Button'
import { ArrowRight } from '@/components/ui/Icons'
import { merch } from '@/content/merch'
import { copy } from '@/content/site'
import { getSiteUrl } from '@/lib/site-url'

export const metadata: Metadata = {
  title: 'Merch',
  description: 'EEMS merch: tees, hoodies and sweatpants featuring EEMS artwork. Secure checkout with Shopify.',
  ...(getSiteUrl() ? { alternates: { canonical: '/merch' } } : {}),
}

/**
 * The EEMS merch shop. A full page load (every link here is a plain link), so
 * Shopify's cart and scripts only ever live on this page.
 */
export default function MerchPage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <section aria-labelledby="merch-page-title" className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-[-10%] right-[-10%] size-[40rem] rounded-full bg-[radial-gradient(closest-side,rgb(224_67_210/0.28),transparent)]" />
          <PaperScrap seed={211} tone="violet" className="top-[4%] right-[-6%] h-[92%] w-[56%] rotate-2 max-lg:top-[48%] max-lg:h-[52%] max-lg:w-[96%]" />
        </div>

        <div className="shell grid items-center gap-12 pt-10 pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div className="relative">
            <p className="eyebrow">{merch.eyebrow}</p>
            <h1
              id="merch-page-title"
              className="intro-drop font-marker mt-2 text-[clamp(5rem,16vw,11rem)] leading-[0.8] text-pink [--drop-rotate:-4deg] [text-shadow:0_0_48px_rgb(224_67_210/0.5)]"
            >
              {merch.heading}
              <Sparkle aria-hidden="true" className="ml-2 inline w-[0.28em] -translate-y-[0.7em] align-baseline text-eems-yellow" />
            </h1>
            <p className="mt-6 max-w-xl text-xl text-haze">{merch.intro}</p>
            <p className="mt-3 text-sm text-smoke">{merch.checkoutNote}</p>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="In the collection">
              {copy.merchFeature.kinds.map((kind, i) => (
                <li
                  key={kind}
                  className={`rounded-full border px-4 py-1.5 text-sm font-semibold tracking-nav uppercase ${
                    ['border-pink/60 text-pink', 'border-eems-yellow/60 text-eems-yellow', 'border-acid/60 text-acid'][i % 3]
                  }`}
                >
                  {kind}
                </li>
              ))}
            </ul>
            <a href="#shop" className={buttonClasses('acid', 'md', 'mt-9 min-h-14 px-8')}>
              {merch.collectionHeading}
              <ArrowRight className="size-4 rotate-90" />
            </a>
            <div className="intro-pop absolute right-[2%] bottom-[-4%] hidden w-28 xl:block" style={{ '--intro-delay': '0.8s' } as CSSProperties}>
              <EemojiSticker sizes="112px" />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[28rem] lg:max-w-[30rem]">
            <ArtworkZoom
              id={merch.artwork}
              sizes="(min-width: 1024px) 30rem, 92vw"
              caption={merch.artworkContext}
              frameClassName="scrap-paper rotate-[2deg] p-[4%] pb-[5%] shadow-lift"
            />
            <span aria-hidden="true" className="intro-pop absolute -top-8 -left-8 grid size-32 place-items-center" style={{ '--intro-delay': '0.5s' } as CSSProperties}>
              <Starburst className="absolute inset-0 text-eems-yellow [filter:drop-shadow(0_8px_12px_rgb(0_0_0/0.6))]" />
              <span className="font-marker relative -rotate-12 text-center text-lg leading-tight text-ink-950">
                Look
                <br />
                closer
              </span>
            </span>
          </div>
        </div>
        <TornEdge seed={31} className="absolute inset-x-0 -bottom-px" fill="var(--color-ink-950)" fibre="#b04fa6" />
      </section>

      <Marquee words={[...copy.merchFeature.kinds, 'EEMS merch']} />

      <section id="shop" aria-labelledby="shop-title" className="section bg-ink-950 pt-12">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="shop-title" className="font-marker text-[clamp(2.4rem,5vw,3.6rem)] leading-none text-eems-yellow [text-shadow:0_0_26px_rgb(74_116_230/0.5)]">
              {merch.collectionHeading}
            </h2>
            <p className="text-sm text-smoke">{merch.checkoutNote}</p>
          </div>
          <div className="mt-10">
            <ShopifyCollection />
          </div>
        </div>
      </section>
    </main>
  )
}
