import type { SVGProps } from 'react'

/**
 * Hand-drawn graffiti marks used around the collage. Purely decorative: hidden
 * from assistive technology and never interactive.
 */
type DoodleProps = SVGProps<SVGSVGElement>

function Doodle({ children, viewBox, ...props }: DoodleProps) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
      className={`pointer-events-none select-none ${props.className ?? ''}`}
    >
      {children}
    </svg>
  )
}

export const Crown = (props: DoodleProps) => (
  <Doodle viewBox="0 0 64 52" strokeWidth={3.2} {...props}>
    <path pathLength={1} d="M8 43 5.5 12.5 19.8 27 30.5 4.5l10.6 22.7L57 11.8 54.5 43.5Z" />
    <path pathLength={1} d="M7.5 42.2c14.8-1.6 31.4-1.8 47.6.6" opacity={0.8} />
    <path pathLength={1} d="M12 49c11-1.6 25-2 40-.8" strokeWidth={2.2} opacity={0.6} />
    <circle cx="5.5" cy="10.5" r="2" fill="currentColor" stroke="none" />
    <circle cx="30.5" cy="3" r="2" fill="currentColor" stroke="none" />
    <circle cx="57.5" cy="9.8" r="2" fill="currentColor" stroke="none" />
  </Doodle>
)

export const Heart = (props: DoodleProps) => (
  <Doodle viewBox="0 0 60 56" strokeWidth={3} {...props}>
    <path pathLength={1} d="M30.5 50C17 40.5 4.5 30.8 6 17.6 7.2 7.2 20.3 3.4 28 14.8c5.8-11.6 21-10.8 23.8.4 3 12.2-8.6 23.8-21.3 34.8Z" />
    <path pathLength={1} d="M27.4 14.4c1.2 2.2 2.3 4.7 2.9 7.8" strokeWidth={2.2} opacity={0.7} />
  </Doodle>
)

/** Box with three hand-drawn crosses, like a tally scrawled on the photo. */
export const CrossBox = (props: DoodleProps) => (
  <Doodle viewBox="0 0 96 50" strokeWidth={2.8} {...props}>
    <path pathLength={1} d="M4.5 6.5c29-2.6 58-2.8 87.5-.6.9 12.4.8 24.6-.4 37.4-29.2 1.8-58.6 1.9-87.4-.2-.8-12.4-.7-24.6.3-36.6Z" />
    <path pathLength={1} d="M17 15.5 31 35.5M31.5 14.5 16.5 36M41 15l14.5 20.5M55.8 14.2 40.5 36M65.5 15.5l14 20M79.8 14.5 64.8 35.8" />
  </Doodle>
)

export const Smiley = (props: DoodleProps) => (
  <Doodle viewBox="0 0 40 40" strokeWidth={2.4} {...props}>
    <path pathLength={1} d="M20.5 3.5c9.8.2 16.4 7.4 16 16.8-.4 9.4-7.6 16.4-17 16.2C10 36.3 3.3 29 3.6 19.6 3.9 10.2 11 3.3 20.5 3.5Z" />
    <path pathLength={1} d="M14.2 14.8v2.6M25.8 14.6v2.6" />
    <path pathLength={1} d="M11.8 23.2c4.6 5.4 11.8 5.6 16.6.2" />
  </Doodle>
)

export const SwoopArrow = (props: DoodleProps) => (
  <Doodle viewBox="0 0 80 36" strokeWidth={2.4} {...props}>
    <path pathLength={1} d="M3 28c14.6 6 32.4 3.6 45-6.4 7.6-6 13.8-12.4 26.8-15.2" />
    <path pathLength={1} d="M64.6 3.2 75.8 6 70 16.4" />
  </Doodle>
)

export const Sparkle = (props: DoodleProps) => (
  <Doodle viewBox="0 0 48 48" strokeWidth={2.4} {...props}>
    <path pathLength={1} d="M24 3.5c1.6 9.6 5.8 14.8 20.5 20.3-14.6 5.2-18.8 10.4-20.4 20.7-1.9-10.4-6.1-15.6-20.6-20.5C18.1 18.6 22.3 13.4 24 3.5Z" />
  </Doodle>
)

export const Squiggle = (props: DoodleProps) => (
  <Doodle viewBox="0 0 120 16" strokeWidth={2.6} {...props}>
    <path pathLength={1} d="M3 10.5c9-8 13.6 5.4 22.6-1.6s13.4 5.8 22.6-.8 13.6 5.6 22.8-1 13.2 5.6 22.4-.6 12.6 4.8 22.6-1.2" />
  </Doodle>
)

/** Points of a 16-point starburst in a 100 x 100 box (computed once). */
const burstPoints = Array.from({ length: 32 }, (_, i) => {
  const angle = (Math.PI * 2 * i) / 32 - Math.PI / 2
  const radius = i % 2 === 0 ? 49 : 38
  return `${(50 + radius * Math.cos(angle)).toFixed(2)},${(50 + radius * Math.sin(angle)).toFixed(2)}`
}).join(' ')

/** Filled starburst badge; put the label on top of it. */
export const Starburst = (props: DoodleProps) => (
  <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" {...props}>
    <polygon points={burstPoints} fill="currentColor" />
  </svg>
)

/** Strip of translucent tape for sticking artwork to the collage. */
export const Tape = ({ className }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={`pointer-events-none absolute block h-7 w-24 bg-[#efe9df]/55 [clip-path:polygon(3%_0,97%_4%,100%_100%,0_92%)] ${className ?? ''}`}
  />
)
