/**
 * Deterministic "torn paper" shapes. Seeded, so the server and the browser
 * always produce the same outline (no hydration mismatch, no layout jitter).
 */

function seeded(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Edge = 'top' | 'right' | 'bottom' | 'left'

interface TornOptions {
  /** Maximum inward tear, in percent of the box. */
  depth?: number
  /** Points per torn edge. */
  steps?: number
  edges?: Edge[]
}

const fmt = (n: number) => `${Math.round(n * 100) / 100}%`

/** CSS `polygon()` with irregular edges, for `clip-path`. */
export function tornPolygon(seed: number, { depth = 2.2, steps = 22, edges = ['top', 'right', 'bottom', 'left'] }: TornOptions = {}): string {
  const rand = seeded(seed)
  // Mostly shallow nicks with the occasional deeper tear.
  const tear = () => {
    const r = rand()
    return depth * (r > 0.86 ? 0.75 + rand() * 0.25 : r * 0.55)
  }
  const points: string[] = []
  const edge = (name: Edge, point: (t: number, d: number) => [number, number]) => {
    const torn = edges.includes(name)
    const count = torn ? steps : 1
    for (let i = 0; i < count; i++) {
      const [x, y] = point(i / count, torn ? tear() : 0)
      points.push(`${fmt(x)} ${fmt(y)}`)
    }
  }
  edge('top', (t, d) => [t * 100, d])
  edge('right', (t, d) => [100 - d, t * 100])
  edge('bottom', (t, d) => [100 - t * 100, 100 - d])
  edge('left', (t, d) => [d, 100 - t * 100])
  return `polygon(${points.join(', ')})`
}

/**
 * SVG path for a horizontal torn strip in a 1000 x `height` viewBox.
 * The top edge is torn; the strip is filled down to the bottom.
 */
export function tornStripPath(seed: number, { height = 40, amplitude = 16, steps = 70 } = {}): string {
  const rand = seeded(seed)
  let d = `M0 ${height} L0 ${amplitude * rand()}`
  for (let i = 1; i <= steps; i++) {
    const x = (i / steps) * 1000
    const y = rand() > 0.82 ? amplitude * (0.7 + rand() * 0.3) : amplitude * rand() * 0.6
    d += ` L${Math.round(x * 10) / 10} ${Math.round(y * 10) / 10}`
  }
  return `${d} L1000 ${height} Z`
}
