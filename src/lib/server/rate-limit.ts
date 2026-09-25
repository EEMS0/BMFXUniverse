import 'server-only'

import type { RateLimitConfig } from './enquiry-config'

/**
 * Fixed-window rate limiting for enquiries.
 *
 * - `upstash`: counters live in Upstash Redis (REST API), shared by every server
 *   or serverless instance. Use this in production.
 * - `memory`: counters live in this process only. Fine for local development and
 *   a single long-running server, but NOT sufficient on serverless platforms,
 *   where each instance has its own memory and instances come and go.
 */

export interface RateLimitDecision {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

export interface RateLimiter {
  readonly kind: 'memory' | 'upstash'
  check(key: string): Promise<RateLimitDecision>
}

interface WindowOptions {
  max: number
  windowSeconds: number
}

export function createMemoryRateLimiter({ max, windowSeconds, now = Date.now }: WindowOptions & { now?: () => number }): RateLimiter {
  const windows = new Map<string, { count: number; resetAt: number }>()
  let lastSweep = 0

  return {
    kind: 'memory',
    async check(key) {
      const time = now()
      if (time - lastSweep > 60_000) {
        for (const [entryKey, entry] of windows) if (entry.resetAt <= time) windows.delete(entryKey)
        lastSweep = time
      }
      let entry = windows.get(key)
      if (!entry || entry.resetAt <= time) {
        entry = { count: 0, resetAt: time + windowSeconds * 1000 }
        windows.set(key, entry)
      }
      entry.count += 1
      const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - time) / 1000))
      return { allowed: entry.count <= max, remaining: Math.max(0, max - entry.count), retryAfterSeconds }
    },
  }
}

export function createUpstashRateLimiter({
  url,
  token,
  max,
  windowSeconds,
  fetchImpl = fetch,
  prefix = 'eems:enquiry:',
}: WindowOptions & { url: string; token: string; fetchImpl?: typeof fetch; prefix?: string }): RateLimiter {
  return {
    kind: 'upstash',
    async check(key) {
      const redisKey = `${prefix}${key}`
      // SET NX starts the window with an expiry; INCR counts; TTL tells us when it resets.
      const response = await fetchImpl(`${url}/pipeline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([
          ['SET', redisKey, '0', 'EX', String(windowSeconds), 'NX'],
          ['INCR', redisKey],
          ['TTL', redisKey],
        ]),
        signal: AbortSignal.timeout(3_000),
        cache: 'no-store',
      })
      if (!response.ok) throw new Error(`Upstash responded ${response.status}`)
      const results = (await response.json()) as { result?: unknown; error?: string }[]
      const count = Number(results?.[1]?.result)
      const ttl = Number(results?.[2]?.result)
      if (!Number.isFinite(count) || results.some((item) => item?.error)) throw new Error('Unexpected Upstash response')
      return {
        allowed: count <= max,
        remaining: Math.max(0, max - count),
        retryAfterSeconds: Number.isFinite(ttl) && ttl > 0 ? ttl : windowSeconds,
      }
    },
  }
}

let shared: { signature: string; limiter: RateLimiter } | null = null

/** One limiter per process, rebuilt only if the configuration changes. */
export function getRateLimiter(config: RateLimitConfig): RateLimiter {
  const signature = JSON.stringify([config.max, config.windowSeconds, config.upstash?.url ?? null])
  if (shared?.signature === signature) return shared.limiter
  const limiter = config.upstash
    ? createUpstashRateLimiter({ ...config.upstash, max: config.max, windowSeconds: config.windowSeconds })
    : createMemoryRateLimiter({ max: config.max, windowSeconds: config.windowSeconds })
  shared = { signature, limiter }
  return limiter
}
