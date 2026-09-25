import { describe, expect, it, vi } from 'vitest'

import { readEnquiryConfig } from '@/lib/server/enquiry-config'
import { createMemoryRateLimiter, createUpstashRateLimiter } from '@/lib/server/rate-limit'

describe('readEnquiryConfig', () => {
  it('reports every missing email setting without exposing values', () => {
    const config = readEnquiryConfig({})
    expect(config.email).toBeNull()
    expect(config.missing).toEqual(['RESEND_API_KEY', 'ENQUIRY_FROM_EMAIL', 'ENQUIRY_TO_EMAIL'])
  })

  it('builds the email config when everything is present', () => {
    const config = readEnquiryConfig({
      RESEND_API_KEY: 're_test',
      ENQUIRY_FROM_EMAIL: 'BMFX enquiries <enquiries@example.com>',
      ENQUIRY_TO_EMAIL: 'owner@example.com, backup@example.com',
    })
    expect(config.missing).toEqual([])
    expect(config.email).toEqual({
      provider: 'resend',
      apiKey: 're_test',
      from: 'BMFX enquiries <enquiries@example.com>',
      to: ['owner@example.com', 'backup@example.com'],
    })
  })

  it('treats a malformed recipient as missing', () => {
    const config = readEnquiryConfig({ RESEND_API_KEY: 'k', ENQUIRY_FROM_EMAIL: 'a@example.com', ENQUIRY_TO_EMAIL: 'not-an-email' })
    expect(config.email).toBeNull()
    expect(config.missing).toEqual(['ENQUIRY_TO_EMAIL'])
  })

  it('uses rate-limit defaults and only enables Upstash with both URL and token', () => {
    expect(readEnquiryConfig({}).rateLimit).toEqual({ max: 5, windowSeconds: 3600, upstash: null })
    const config = readEnquiryConfig({
      ENQUIRY_RATE_LIMIT_MAX: '3',
      ENQUIRY_RATE_LIMIT_WINDOW_SECONDS: '600',
      UPSTASH_REDIS_REST_URL: 'https://example.upstash.io/',
      UPSTASH_REDIS_REST_TOKEN: 'token',
    })
    expect(config.rateLimit).toEqual({ max: 3, windowSeconds: 600, upstash: { url: 'https://example.upstash.io', token: 'token' } })
    expect(readEnquiryConfig({ UPSTASH_REDIS_REST_URL: 'https://x.upstash.io' }).rateLimit.upstash).toBeNull()
  })
})

describe('memory rate limiter', () => {
  it('allows up to the limit per key, then blocks until the window resets', async () => {
    let now = 1_000_000
    const limiter = createMemoryRateLimiter({ max: 2, windowSeconds: 60, now: () => now })
    expect((await limiter.check('ip:a')).allowed).toBe(true)
    expect((await limiter.check('ip:a')).allowed).toBe(true)
    const third = await limiter.check('ip:a')
    expect(third).toMatchObject({ allowed: false, remaining: 0 })
    expect(third.retryAfterSeconds).toBeGreaterThan(0)
    expect((await limiter.check('ip:b')).allowed).toBe(true)
    now += 61_000
    expect((await limiter.check('ip:a')).allowed).toBe(true)
  })
})

describe('Upstash rate limiter (REST pipeline, simulated responses)', () => {
  it('sends SET NX + INCR + TTL and interprets the count', async () => {
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      void init
      return Response.json([{ result: 'OK' }, { result: 6 }, { result: 1200 }])
    })
    const limiter = createUpstashRateLimiter({ url: 'https://x.upstash.io', token: 't', max: 5, windowSeconds: 3600, fetchImpl })
    const decision = await limiter.check('ip:1.2.3.4')
    expect(decision).toEqual({ allowed: false, remaining: 0, retryAfterSeconds: 1200 })
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://x.upstash.io/pipeline')
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer t')
    expect(JSON.parse(String(init?.body))).toEqual([
      ['SET', 'eems:enquiry:ip:1.2.3.4', '0', 'EX', '3600', 'NX'],
      ['INCR', 'eems:enquiry:ip:1.2.3.4'],
      ['TTL', 'eems:enquiry:ip:1.2.3.4'],
    ])
  })

  it('throws on errors so the caller can decide how to fail', async () => {
    const failing = createUpstashRateLimiter({
      url: 'https://x.upstash.io',
      token: 't',
      max: 5,
      windowSeconds: 60,
      fetchImpl: async () => new Response('nope', { status: 401 }),
    })
    await expect(failing.check('k')).rejects.toThrow()
    const commandError = createUpstashRateLimiter({
      url: 'https://x.upstash.io',
      token: 't',
      max: 5,
      windowSeconds: 60,
      fetchImpl: async () => Response.json([{ result: 'OK' }, { error: 'ERR' }, { result: 5 }]),
    })
    await expect(commandError.check('k')).rejects.toThrow()
  })
})
