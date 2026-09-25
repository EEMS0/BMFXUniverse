import { Sparkle } from '@/components/decor/Doodles'
import { SectionTear } from '@/components/decor/Torn'
import { ButtonLink } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { StickerSheetCard } from '@/components/work/StickerSheetCard'
import { WorkCard } from '@/components/work/WorkCard'
import { merchShopUrl } from '@/content/links'
import { copy } from '@/content/site'

const artList = ['eems-merch-artwork', 'eems-characters', 'eemsojis', 'pink-haired-character']

/**
 * Art & merch showcase. The merch design is shown as artwork only: there are
 * no products, prices or checkout until a real shop link is configured.
 */
export function ArtSection() {
  return (
    <section id="art" aria-labelledby="art-title" className="section overflow-hidden">
      <SectionTear seed={303} from="ink-950" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_15%_30%,rgb(224_67_210/0.13),transparent_70%)]" />
      <div className="shell relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading id="art-title" eyebrow={copy.art.eyebrow} title={copy.art.heading} tone="pink" className="reveal">
            <p>{copy.art.body}</p>
          </SectionHeading>
          <Sparkle aria-hidden="true" className="hidden w-14 rotate-12 text-bubblegum/70 md:block" />
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-12 md:gap-5">
          <div className="reveal md:col-span-5">
            <WorkCard
              slug="eems-merch-artwork"
              title="EEMS merch artwork"
              meta={copy.art.merchCaption}
              list={artList}
              frame="portrait"
              sizes="(min-width: 768px) 40vw, 92vw"
            />
          </div>
          <div className="reveal md:col-span-7">
            <WorkCard
              slug="eems-characters"
              meta="Illustration"
              list={artList}
              frame="fill"
              matte="bg-[radial-gradient(circle_at_50%_45%,#3b2a52,#140f1b_78%)]"
              sizes="(min-width: 768px) 55vw, 92vw"
            />
          </div>
          <div className="reveal md:col-span-8">
            <StickerSheetCard slug="eemsojis" list={artList} meta="Character expressions" />
          </div>
          <div className="reveal md:col-span-4">
            <WorkCard slug="pink-haired-character" meta="Illustration" list={artList} frame="landscape" sizes="(min-width: 768px) 32vw, 92vw" />
          </div>
        </div>

        {merchShopUrl ? (
          <ButtonLink href={merchShopUrl} external variant="outline-violet" className="mt-10">
            Visit the merch shop
          </ButtonLink>
        ) : null}
      </div>
    </section>
  )
}
