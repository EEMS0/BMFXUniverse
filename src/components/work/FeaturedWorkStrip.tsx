import { featuredWork } from '@/content/projects'
import { WorkCard } from './WorkCard'

/** Six supplied pieces directly under the hero. Swipeable row on phones, grid above. */
export function FeaturedWorkStrip() {
  const list = featuredWork.map((item) => item.slug)
  return (
    <section aria-labelledby="featured-title" className="relative bg-ink-950 pt-5 pb-8 sm:pb-10">
      <div className="shell mb-4 flex items-center justify-between gap-4">
        <h2 id="featured-title" className="eyebrow flex items-center gap-2 text-haze">
          <span aria-hidden="true" className="h-0.5 w-6 rounded-full bg-acid" />
          Featured work
        </h2>
        <p aria-hidden="true" className="text-xs font-semibold tracking-label text-smoke uppercase md:hidden">
          Swipe for more →
        </p>
      </div>
      <ul className="shell relative flex snap-x snap-mandatory scroll-px-(--gutter) gap-3 overflow-x-auto pb-3 [scrollbar-color:var(--color-ink-500)_transparent] [scrollbar-width:thin] md:grid md:grid-cols-3 md:overflow-visible md:pb-0 xl:grid-cols-6">
        {featuredWork.map((item) => (
          <li key={item.slug} className="w-[74%] shrink-0 snap-start min-[480px]:w-[46%] md:w-auto">
            <WorkCard
              slug={item.slug}
              title={item.title}
              meta={item.meta}
              list={list}
              frame="landscape"
              sizes="(min-width: 1280px) 16vw, (min-width: 768px) 31vw, (min-width: 480px) 46vw, 74vw"
              className="h-full"
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
