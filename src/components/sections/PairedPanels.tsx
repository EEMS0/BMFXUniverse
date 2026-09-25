import { ArtImage } from '@/components/ui/ArtImage'
import { ButtonLink } from '@/components/ui/Button'
import { ENQUIRY_SECTION, sectionHref } from '@/content/navigation'
import { copy } from '@/content/site'

/** The two sides at a glance: EEMS music and BMFX design/video. */
export function PairedPanels() {
  const { music, bmfx } = copy.panels
  return (
    <section aria-labelledby="sides-title" className="bg-ink-950 pb-14 sm:pb-20">
      <h2 id="sides-title" className="sr-only">
        Two sides: music and design
      </h2>
      <div className="shell grid gap-4 lg:grid-cols-2">
        <article
          aria-labelledby="panel-music-title"
          className="reveal relative isolate overflow-hidden rounded-xl border border-eems-blue/35 bg-ink-850 p-6 sm:p-8"
        >
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(90%_120%_at_100%_100%,rgb(74_116_230/0.22),transparent_60%)]" />
          <div className="grid items-center gap-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
            <div>
              <h3 id="panel-music-title" className="font-marker text-[3.2rem] leading-none text-eems-yellow [text-shadow:0_0_26px_rgb(74_116_230/0.6)]">
                {music.heading}
              </h3>
              <p className="mt-3 max-w-xs text-haze">{music.body}</p>
              <ButtonLink href={sectionHref('music')} variant="outline-yellow" size="sm" className="mt-6">
                {music.cta}
              </ButtonLink>
            </div>
            {/* Fanned stack of real EEMS artwork (decorative here; each piece is described in its own section). */}
            <div aria-hidden="true" className="relative mx-auto h-44 w-full max-w-[19rem] sm:h-48">
              <ArtImage id="eemsAtmosphere" decorative sizes="150px" className="absolute top-3 left-0 aspect-square w-[46%] -rotate-9 rounded-md object-cover shadow-card" />
              <ArtImage id="merchArtwork" decorative sizes="150px" className="absolute top-0 right-0 aspect-square w-[46%] rotate-8 rounded-md object-cover shadow-card" />
              <ArtImage id="symptoms" decorative sizes="190px" className="absolute top-4 left-[22%] aspect-square w-[56%] -rotate-1 rounded-md object-cover shadow-lift ring-1 ring-white/15" />
            </div>
          </div>
        </article>

        <article
          aria-labelledby="panel-bmfx-title"
          className="reveal relative isolate overflow-hidden rounded-xl border border-orbit/35 bg-ink-850 p-6 sm:p-8"
        >
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(90%_120%_at_100%_100%,rgb(157_251_88/0.14),transparent_60%)]" />
          <div className="grid items-center gap-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
            <div>
              <h3 id="panel-bmfx-title" className="font-marker text-[3.2rem] leading-none text-orbit [text-shadow:0_0_26px_rgb(255_138_61/0.4)]">
                {bmfx.heading}
              </h3>
              <p className="mt-3 max-w-xs text-haze">{bmfx.body}</p>
              <ButtonLink href={sectionHref(ENQUIRY_SECTION)} variant="outline-orbit" size="sm" className="mt-6">
                {bmfx.cta}
              </ButtonLink>
            </div>
            <div aria-hidden="true" className="relative mx-auto h-44 w-full max-w-[19rem] sm:h-48">
              <ArtImage id="swagBag" decorative sizes="170px" className="absolute top-2 left-0 aspect-square w-[54%] -rotate-6 rounded-md object-cover shadow-lift ring-1 ring-white/15" />
              <ArtImage
                id="bmfxLogo"
                decorative
                sizes="200px"
                className="absolute right-0 bottom-0 h-auto w-[64%] rotate-3 [filter:drop-shadow(0_12px_18px_rgb(0_0_0/0.8))]"
              />
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
