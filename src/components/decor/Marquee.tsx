import { Fragment } from 'react'

import { Sparkle } from './Doodles'

/**
 * Two bands of big words that slide sideways as the page scrolls (and stay
 * still otherwise, or with reduced motion). Decorative only: every word here
 * is also a real heading or link elsewhere on the page.
 */
export function Marquee({ words }: { words: readonly string[] }) {
  // Enough repeats that the track is always wider than the screen while it moves.
  const run = Array.from({ length: 6 }, () => words).flat()
  return (
    <div aria-hidden="true" className="relative overflow-hidden border-y border-white/[0.08] bg-ink-950 py-4 select-none">
      <div className="marquee-track items-center" data-direction="left">
        {run.map((word, i) => (
          <Fragment key={`a${i}`}>
            <span className="font-marker px-5 text-[clamp(2rem,5vw,3.75rem)] leading-none text-eems-yellow uppercase [text-shadow:0_0_24px_rgb(74_116_230/0.5)]">
              {word}
            </span>
            <Sparkle className="w-7 shrink-0 text-pink" />
          </Fragment>
        ))}
      </div>
      <div className="marquee-track mt-2 items-center" data-direction="right">
        {run.map((word, i) => (
          <Fragment key={`b${i}`}>
            <span className="font-marker px-5 text-[clamp(1.6rem,3.8vw,2.9rem)] leading-none text-transparent uppercase [-webkit-text-stroke:1.5px_var(--color-violet)]">
              {word}
            </span>
            <span className="size-2 shrink-0 rounded-full bg-acid" />
          </Fragment>
        ))}
      </div>
    </div>
  )
}
