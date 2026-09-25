import { CrossBox, Crown, Heart, Smiley, Sparkle, SwoopArrow } from '@/components/decor/Doodles'
import { PaperScrap, TornEdge, TornFrame } from '@/components/decor/Torn'
import { ArtImage } from '@/components/ui/ArtImage'
import { ButtonLink } from '@/components/ui/Button'
import { Headphones } from '@/components/ui/Icons'
import { configuredSocialLinks, listenNowTarget } from '@/content/links'
import { ENQUIRY_SECTION, sectionHref } from '@/content/navigation'
import { site } from '@/content/site'

/** "Listen now" goes to the Music section unless a confirmed platform is selected in links.ts. */
function listenNowLink(): { href: string; external: boolean } {
  if (listenNowTarget.type === 'platform') {
    const platform = listenNowTarget.platform
    const link = configuredSocialLinks((item) => item.platform === platform)[0]
    if (link) return { href: link.url, external: true }
  }
  return { href: sectionHref('music'), external: false }
}

/**
 * Three connected zones: EEMS identity (left), torn-paper portrait (centre)
 * and the BMFX CRT artwork (right). Below xl the portrait and CRT overlap in
 * one simpler collage; on phones the intro and hiring action come first.
 */
export function CollageHero() {
  const listen = listenNowLink()
  return (
    <section id="home" aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      {/* Backdrop: torn sheets and a low violet haze. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -bottom-24 -left-24 size-[34rem] rounded-full bg-[radial-gradient(closest-side,rgb(90_40_160/0.45),transparent)]" />
        <PaperScrap seed={4} tone="violet" className="top-[64%] right-[-8%] h-[34%] w-[92%] rotate-[-4deg] md:top-[6%] md:right-[-4%] md:h-[88%] md:w-[52%] xl:top-[-3%] xl:w-[39%]" />
        <PaperScrap seed={9} tone="ink" depth={2.4} className="top-[54%] left-[-4%] hidden h-[40%] w-[64%] rotate-[3deg] md:top-[10%] md:left-[44%] md:block md:h-[74%] md:w-[28%] xl:top-[5%] xl:left-[34.5%] xl:h-[86%] xl:w-[27%]" />
      </div>

      <div className="shell relative grid gap-y-10 pt-6 pb-16 sm:pt-8 md:grid-cols-2 md:items-center md:gap-x-6 md:pb-20 xl:min-h-[clamp(30rem,33vw,38rem)] xl:grid-cols-[minmax(0,0.98fr)_minmax(0,1.96fr)] xl:pt-0 xl:pb-14">
        {/* Zone 1: EEMS identity + calls to action */}
        <div className="relative z-10 flex flex-col items-start">
          <h1 id="hero-title" className="-ml-[12%] w-[118%] max-w-[44rem] sm:-ml-[10.8%] sm:w-[104%] md:-ml-[11.2%] md:w-[108%] xl:-ml-[10%] xl:w-[96%]">
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
            <ButtonLink href={sectionHref(ENQUIRY_SECTION)} variant="outline-violet">
              Hire me
            </ButtonLink>
          </div>
          <p className="font-hand mt-6 flex -rotate-2 items-center gap-2 text-[1.6rem] leading-none text-lilac">
            <SwoopArrow className="w-12 shrink-0 text-violet" />
            {site.annotation}
            <Smiley className="w-8 shrink-0 text-violet" />
          </p>
        </div>

        {/* Zones 2 + 3: portrait and BMFX. One overlapping collage below xl, two zones at xl. */}
        <div className="relative pb-[16%] md:pb-[22%] xl:grid xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.1fr)] xl:items-center xl:gap-x-2 xl:pb-0">
          {/* Portrait */}
          <div className="relative w-[80%] max-w-[31rem] md:w-[82%] xl:w-[88%] xl:max-w-none xl:justify-self-center">
            <TornFrame seed={21} className="aspect-[0.93] -rotate-[2.5deg]">
              <ArtImage
                id="eemsPortrait"
                fill
                loading="eager"
                quality={85}
                sizes="(min-width: 1280px) 26vw, (min-width: 768px) 40vw, 80vw"
                className="object-cover"
              />
            </TornFrame>
            <Crown className="absolute top-[3%] left-[-4%] w-[17%] -rotate-12 text-[#ff4f6e] [filter:drop-shadow(0_0_6px_rgb(255_79_110/0.55))]" />
            <CrossBox className="absolute bottom-[6%] left-[5%] w-[27%] -rotate-[9deg] text-paper/90" />
            <Heart className="absolute right-[-3%] bottom-[18%] w-[15%] rotate-[8deg] text-pink [filter:drop-shadow(0_0_6px_rgb(255_109_184/0.6))]" />
          </div>

          {/* BMFX CRT: the artwork already includes its own television frame. */}
          <div className="absolute right-0 bottom-0 w-[58%] max-w-[23rem] md:w-[56%] xl:relative xl:w-full xl:max-w-none">
            <figure className="group relative xl:mr-[22%]">
              <div className="relative rotate-[2.5deg] [filter:drop-shadow(0_28px_36px_rgb(0_0_0/0.75))] xl:rotate-[1deg]">
                <ArtImage id="bmfxCrt" loading="eager" quality={85} sizes="(min-width: 1280px) 28vw, (min-width: 768px) 28vw, 58vw" className="h-auto w-full" />
                <div aria-hidden="true" className="absolute inset-[5%_5.5%_7.5%_5.5%] overflow-hidden rounded-[9%]">
                  <span className="crt-sweep" />
                </div>
              </div>
              <figcaption className="sr-only">BMFX, the GFX / VFX, design and video side of EEMS</figcaption>
            </figure>

            {/* Descriptor: vertical hand-written list at xl, hidden in the compact collage. */}
            <ul
              aria-label="BMFX services"
              className="font-hand absolute top-[4%] right-0 hidden -rotate-3 flex-col gap-0.5 text-[1.55rem] leading-tight text-lilac xl:flex"
            >
              {site.bmfxDescriptor.map((item) => (
                <li key={item}>{item}</li>
              ))}
              <li aria-hidden="true">
                <Sparkle className="mt-1 ml-3 w-9 text-paper/80" />
              </li>
            </ul>

            <p className="font-hand absolute bottom-[-9%] left-[6%] hidden -rotate-[5deg] text-[1.5rem] leading-none text-paper/85 xl:block">
              {site.crtAnnotation}
            </p>

            {/* Collage accent; the same artwork is presented (with its description) in Art & merch. */}
            <ArtImage
              id="eemsCharacters"
              decorative
              sizes="(min-width: 1280px) 15vw, 1px"
              className="pointer-events-none absolute right-[-3%] bottom-[-16%] hidden h-auto w-[46%] rotate-[4deg] [filter:drop-shadow(0_16px_20px_rgb(0_0_0/0.7))] xl:block"
            />
          </div>
        </div>
      </div>

      <TornEdge seed={7} className="absolute inset-x-0 -bottom-px" fill="var(--color-ink-950)" fibre="#7d5bc4" />
    </section>
  )
}
