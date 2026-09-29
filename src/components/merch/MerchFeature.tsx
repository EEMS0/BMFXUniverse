import { Sparkle, Starburst, Tape } from '@/components/decor/Doodles'
import { PaperScrap, SectionTear } from '@/components/decor/Torn'
import { ArtImage } from '@/components/ui/ArtImage'
import { ButtonLink } from '@/components/ui/Button'
import { BagIcon, ZoomIcon } from '@/components/ui/Icons'
import { TiltSurface } from '@/components/ui/TiltSurface'
import { ViewerLink } from '@/components/work/ViewerLink'
import { merchHref } from '@/content/navigation'
import { copy } from '@/content/site'

/** Big merch teaser right under the hero; the shop itself lives on /merch. */
export function MerchFeature() {
  const text = copy.merchFeature
  return (
    <section id="merch" aria-labelledby="merch-title" className="section overflow-hidden">
      <SectionTear seed={111} from="ink-950" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_55%_at_22%_45%,rgb(224_67_210/0.18),transparent_70%),radial-gradient(40%_40%_at_90%_80%,rgb(242_211_27/0.08),transparent_70%)]" />
      <PaperScrap seed={123} tone="violet" depth={2.6} className="top-[10%] left-[-6%] h-[78%] w-[48%] -rotate-3 opacity-70 max-lg:hidden" />

      <div className="shell relative grid items-center gap-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-20">
        <div className="reveal relative mx-auto w-full max-w-[30rem] lg:max-w-none">
          <TiltSurface className="rotate-[-2deg] rounded-[4px]">
            <ViewerLink slug="eems-merch-artwork" label="View the merch artwork larger" className="group block">
              <span className="scrap-paper block p-[4%] pb-[6%] shadow-lift">
                <span className="relative block aspect-[3/4] overflow-hidden bg-ink-700">
                  <ArtImage id="merchArtwork" decorative fill sizes="(min-width: 1024px) 40vw, 92vw" className="object-cover transition-transform duration-700 ease-snap group-hover:scale-[1.04]" />
                </span>
              </span>
            </ViewerLink>
          </TiltSurface>
          <Tape className="top-[-1.5%] left-[12%] -rotate-[8deg]" />
          <Tape className="top-[-1%] right-[14%] rotate-[6deg]" />
          <span aria-hidden="true" className="absolute -right-[6%] -bottom-[5%] grid size-32 place-items-center sm:size-40">
            <Starburst className="absolute inset-0 text-acid [filter:drop-shadow(0_8px_14px_rgb(0_0_0/0.6))]" />
            <span className="font-marker relative rotate-[-10deg] text-center text-xl leading-tight text-ink-950 sm:text-2xl">
              Wear
              <br />
              the art
            </span>
          </span>
        </div>

        <div className="reveal">
          <p className="eyebrow">{text.eyebrow}</p>
          <h2
            id="merch-title"
            className="font-marker mt-2 text-[clamp(4.5rem,13vw,9.5rem)] leading-[0.82] text-pink [text-shadow:0_0_40px_rgb(224_67_210/0.45)]"
          >
            {text.heading}
            <Sparkle aria-hidden="true" className="ml-3 inline w-[0.32em] -translate-y-[0.6em] align-baseline text-eems-yellow" />
          </h2>
          <p className="mt-6 max-w-lg text-xl text-haze">{text.body}</p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="In the collection">
            {text.kinds.map((kind, i) => (
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
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <ButtonLink href={merchHref()} variant="acid" className="min-h-14 px-8 text-sm" icon={<BagIcon className="size-5" />}>
              {text.cta}
            </ButtonLink>
            <ViewerLink
              slug="eems-merch-artwork"
              className="group/link inline-flex min-h-11 items-center gap-2 font-semibold text-lilac underline-offset-4 hover:underline"
            >
              <ZoomIcon className="size-5" />
              {text.artworkLink}
            </ViewerLink>
          </div>
          <p className="mt-6 text-sm text-smoke">{text.checkout}</p>
        </div>
      </div>
    </section>
  )
}
