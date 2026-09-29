import type { CSSProperties } from 'react'

import { CrossBox, Crown, Heart, Smiley, Sparkle, Starburst, SwoopArrow, Tape } from '@/components/decor/Doodles'
import { PaperScrap, TornEdge, TornFrame } from '@/components/decor/Torn'
import { EemojiSticker } from '@/components/eemoji/EemojiSticker'
import { ArtImage } from '@/components/ui/ArtImage'
import { ButtonLink } from '@/components/ui/Button'
import { BagIcon, Headphones } from '@/components/ui/Icons'
import { configuredSocialLinks, listenNowTarget } from '@/content/links'
import { merchHref, sectionHref } from '@/content/navigation'
import { copy, site } from '@/content/site'
import { PointerStage } from './PointerStage'

/** "Listen now" goes to the Music section unless a confirmed platform is selected in links.ts. */
function listenNowLink(): { href: string; external: boolean } {
  if (listenNowTarget.type === 'platform') {
    const platform = listenNowTarget.platform
    const link = configuredSocialLinks((item) => item.platform === platform)[0]
    if (link) return { href: link.url, external: true }
  }
  return { href: sectionHref('music'), external: false }
}

const delay = (seconds: number) => ({ '--intro-delay': `${seconds}s` }) as CSSProperties

/**
 * EEMS identity (left), torn-paper portrait (centre) and the merch artwork as a
 * poster that links to the shop (right). Collage pieces drop in on load and
 * drift with the pointer; below xl the portrait and poster overlap in one
 * simpler collage, and on phones the intro and calls to action come first.
 */
export function CollageHero() {
  const listen = listenNowLink()
  return (
    <section id="home" aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <PointerStage className="relative">
        {/* Backdrop: torn sheets and a low violet haze. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -bottom-24 -left-24 size-[34rem] rounded-full bg-[radial-gradient(closest-side,rgb(90_40_160/0.45),transparent)]" />
          <div className="parallax absolute inset-0 [--depth:-8]">
            <PaperScrap
              seed={4}
              tone="violet"
              className="top-[62%] right-[-8%] h-[36%] w-[92%] rotate-[-4deg] md:top-[6%] md:right-[-4%] md:h-[88%] md:w-[52%] xl:top-[-3%] xl:w-[40%]"
            />
            <PaperScrap
              seed={9}
              tone="ink"
              depth={2.4}
              className="top-[54%] left-[-4%] hidden h-[40%] w-[64%] rotate-[3deg] md:top-[10%] md:left-[44%] md:block md:h-[74%] md:w-[28%] xl:top-[5%] xl:left-[34.5%] xl:h-[86%] xl:w-[27%]"
            />
          </div>
        </div>

        <div className="shell relative grid gap-y-10 pt-6 pb-16 sm:pt-8 md:grid-cols-2 md:items-center md:gap-x-6 md:pb-20 xl:min-h-[clamp(30rem,33vw,38rem)] xl:grid-cols-[minmax(0,0.98fr)_minmax(0,1.96fr)] xl:pt-0 xl:pb-14">
          {/* Zone 1: EEMS identity + calls to action */}
          <div className="relative z-10 flex flex-col items-start">
            <h1 id="hero-title" className="intro-glow -ml-[12%] w-[118%] max-w-[44rem] sm:-ml-[10.8%] sm:w-[104%] md:-ml-[11.2%] md:w-[108%] xl:-ml-[10%] xl:w-[96%]">
              <ArtImage
                id="eemsWordmark"
                loading="eager"
                fetchPriority="high"
                quality={85}
                sizes="(min-width: 1280px) 31vw, (min-width: 768px) 54vw, 118vw"
                className="h-auto w-full"
              />
            </h1>
            <p className="font-hand -mt-[11%] -rotate-2 text-[clamp(1.55rem,2.6vw,2.05rem)] leading-tight text-violet sm:-mt-[9.5%] md:-mt-[10%] xl:-mt-[8.8%]">
              {site.tagline}
            </p>
            <p className="mt-4 max-w-[27rem] text-[1.0625rem] leading-relaxed text-haze sm:text-lg">{site.intro}</p>
            <div className="mt-7 flex w-full flex-col gap-3 min-[420px]:w-auto min-[420px]:flex-row min-[420px]:flex-wrap">
              <ButtonLink
                href={listen.href}
                external={listen.external}
                variant="acid"
                className="pl-2"
                icon={
                  <span className="grid size-8 place-items-center rounded-full bg-ink-950 text-acid">
                    <Headphones className="size-4" />
                  </span>
                }
              >
                Listen now
              </ButtonLink>
              <ButtonLink href={merchHref()} variant="outline-violet" className="pl-4" icon={<BagIcon className="size-5" />}>
                Shop merch
              </ButtonLink>
            </div>
            <p className="font-hand mt-6 flex -rotate-2 items-center gap-2 text-[1.6rem] leading-none text-lilac">
              <SwoopArrow className="draw-on w-12 shrink-0 text-violet" style={delay(1.1)} />
              {site.annotation}
              <Smiley className="draw-on w-8 shrink-0 text-violet" style={delay(1.4)} />
            </p>
          </div>

          {/* Zones 2 + 3: portrait and merch poster. One overlapping collage below xl. */}
          <div className="relative pb-[18%] md:pb-[26%] xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] xl:items-center xl:gap-x-2 xl:pb-0">
            {/* Portrait */}
            <div className="parallax relative w-[78%] max-w-[31rem] [--depth:10] md:w-[80%] xl:w-[92%] xl:max-w-none xl:justify-self-center">
              <div className="intro-drop [--drop-rotate:-10deg]" style={delay(0.1)}>
                <TornFrame seed={21} className="aspect-[0.93] -rotate-[2.5deg]">
                  <ArtImage
                    id="eemsPortrait"
                    fill
                    loading="eager"
                    quality={85}
                    sizes="(min-width: 1280px) 28vw, (min-width: 768px) 40vw, 78vw"
                    className="object-cover"
                  />
                </TornFrame>
              </div>
              <Crown
                className="draw-on absolute top-[3%] left-[-4%] w-[17%] -rotate-12 text-[#ff4f6e] [filter:drop-shadow(0_0_6px_rgb(255_79_110/0.55))]"
                style={delay(0.8)}
              />
              <CrossBox className="draw-on absolute bottom-[6%] left-[5%] hidden w-[27%] -rotate-[9deg] text-paper/90 xl:block" style={delay(1)} />
              <Heart
                className="draw-on absolute right-[-3%] bottom-[36%] w-[15%] rotate-[8deg] text-pink [filter:drop-shadow(0_0_6px_rgb(255_109_184/0.6))]"
                style={delay(1.2)}
              />
            </div>

            {/* Merch poster: the supplied merch artwork, linking to the shop. */}
            <div className="parallax absolute right-0 bottom-0 w-[46%] max-w-[17rem] [--depth:22] md:w-[48%] xl:relative xl:w-[66%] xl:max-w-none xl:justify-self-center">
              <div className="intro-drop [--drop-rotate:12deg]" style={delay(0.35)}>
                <a
                  href={merchHref()}
                  aria-label="Shop EEMS merch"
                  className="group relative block rotate-[5deg] transition-transform duration-300 ease-snap hover:rotate-[2deg] hover:scale-[1.03]"
                >
                  <span className="scrap-paper block p-[5%] pb-[7%] shadow-lift [filter:drop-shadow(0_26px_30px_rgb(0_0_0/0.65))]">
                    <span className="relative block aspect-[3/4] overflow-hidden bg-ink-700">
                      <ArtImage id="merchArtwork" decorative fill loading="eager" sizes="(min-width: 1280px) 18vw, 46vw" className="object-cover" />
                    </span>
                  </span>
                  <Tape className="top-[-3%] left-[18%] -rotate-6" />
                  <Tape className="top-[-2%] right-[10%] rotate-[8deg]" />
                  <span className="intro-pop absolute -top-[9%] -left-[14%] grid size-[42%] min-w-20 place-items-center" style={delay(0.9)}>
                    <Starburst className="absolute inset-0 text-eems-yellow [filter:drop-shadow(0_6px_10px_rgb(0_0_0/0.6))]" />
                    <span className="font-marker relative -rotate-12 text-[clamp(0.95rem,1.6vw,1.35rem)] leading-none text-ink-950">Merch</span>
                  </span>
                </a>
              </div>
              <p className="font-hand absolute -bottom-[12%] left-[8%] hidden -rotate-[5deg] text-[1.55rem] leading-none text-paper/85 xl:block">
                {copy.hero.posterNote} <Sparkle className="inline w-6 align-middle text-eems-yellow" />
              </p>
            </div>

            {/* Tap-to-change Eemsoji sticker. */}
            <div className="intro-pop absolute bottom-[-4%] left-[-2%] z-10 w-[26%] max-w-[7.5rem] xl:bottom-[-6%] xl:left-[38%] xl:w-[18%]" style={delay(1.1)}>
              <EemojiSticker sizes="(min-width: 1280px) 9vw, 26vw" />
              <p aria-hidden="true" className="font-hand pointer-events-none absolute -top-6 left-[82%] flex -rotate-6 items-end gap-1 text-xl whitespace-nowrap text-bubblegum [text-shadow:0_1px_6px_rgb(0_0_0/0.95)]">
                {copy.hero.stickerHint}
              </p>
            </div>
          </div>
        </div>
      </PointerStage>

      <TornEdge seed={7} className="absolute inset-x-0 -bottom-px" fill="var(--color-ink-950)" fibre="#7d5bc4" />
    </section>
  )
}
