import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { EmailSender } from '@/lib/server/email/resend'
import { readEnquiryConfig } from '@/lib/server/enquiry-config'
import { type EnquiryDeps, type EnquiryLogger, handleEnquiryRequest } from '@/lib/server/enquiry-handler'
import type { RateLimiter } from '@/lib/server/rate-limit'

/**
 * Route-level tests with a simulated email provider. These prove the handler's
 * behaviour; they do not prove real delivery (that needs real Resend credentials).
 */
const URL_ = 'http://localhost:3000/api/enquiry'
const ORIGIN = 'http://localhost:3000'

const enquiry = {
  name: 'Test Visitor',
  email: 'visitor@example.com',
  services: ['motion-graphics'],
  details: 'Animated logo intro for a music video.',
  budget: '',
  timeframe: '',
  references: '',
}

function jsonRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request(URL_, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: ORIGIN, 'x-forwarded-for': '203.0.113.7', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

function formRequest(fields: Record<string, string | string[]>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(fields)) for (const item of [value].flat()) params.append(key, item)
  return new Request(URL_, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', origin: ORIGIN },
    body: params.toString(),
  })
}

const configured = readEnquiryConfig({
  RESEND_API_KEY: 're_test',
  ENQUIRY_FROM_EMAIL: 'BMFX enquiries <enquiries@example.com>',
  ENQUIRY_TO_EMAIL: 'owner@example.com',
})

let send: ReturnType<typeof vi.fn<EmailSender>>
let log: { [K in keyof EnquiryLogger]: ReturnType<typeof vi.fn<EnquiryLogger[K]>> }
let limiter: RateLimiter

function deps(overrides: Partial<EnquiryDeps> = {}): EnquiryDeps {
  return { config: configured, limiter, send, log, now: () => new Date('2026-09-25T12:00:00Z'), ...overrides }
}

beforeEach(() => {
  send = vi.fn<EmailSender>(async () => ({ ok: true, id: 'email_1' }))
  log = { info: vi.fn<EnquiryLogger['info']>(), warn: vi.fn<EnquiryLogger['warn']>(), error: vi.fn<EnquiryLogger['error']>() }
  limiter = { kind: 'memory', check: vi.fn(async () => ({ allowed: true, remaining: 4, retryAfterSeconds: 0 })) }
})

describe('POST /api/enquiry (JSON)', () => {
  it('submits only after the provider accepts, with the visitor as reply-to', async () => {
    const response = await handleEnquiryRequest(jsonRequest(enquiry), deps())
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true, status: 'submitted' })
    expect(send).toHaveBeenCalledTimes(1)
    const [message, options] = send.mock.calls[0]
    expect(message).toMatchObject({ from: 'BMFX enquiries <enquiries@example.com>', to: ['owner@example.com'], replyTo: 'visitor@example.com' })
    expect(message.subject).toContain('Motion graphics')
    expect(options.apiKey).toBe('re_test')
    expect(options.idempotencyKey).toMatch(/^enquiry-[0-9a-f]{64}$/)
  })

  it('uses the same idempotency key for an identical retry and a new one for changed content', async () => {
    await handleEnquiryRequest(jsonRequest(enquiry), deps())
    await handleEnquiryRequest(jsonRequest(enquiry), deps())
    await handleEnquiryRequest(jsonRequest({ ...enquiry, details: `${enquiry.details} Updated.` }), deps())
    const keys = send.mock.calls.map(([, options]) => options.idempotencyKey)
    expect(keys[0]).toBe(keys[1])
    expect(keys[2]).not.toBe(keys[0])
  })

  it('never logs names, addresses or message text', async () => {
    await handleEnquiryRequest(jsonRequest(enquiry), deps())
    const logged = JSON.stringify([log.info.mock.calls, log.warn.mock.calls, log.error.mock.calls])
    expect(logged).not.toContain('Test Visitor')
    expect(logged).not.toContain('visitor@example.com')
    expect(logged).not.toContain('Animated logo')
  })

  it('returns field errors for invalid input and sends nothing', async () => {
    const response = await handleEnquiryRequest(jsonRequest({ ...enquiry, email: 'nope', services: [] }), deps())
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.status).toBe('invalid')
    expect(Object.keys(body.errors).sort()).toEqual(['email', 'services'])
    expect(send).not.toHaveBeenCalled()
  })

  it('reports "not configured" honestly when email settings are missing', async () => {
    const response = await handleEnquiryRequest(jsonRequest(enquiry), deps({ config: readEnquiryConfig({}) }))
    expect(response.status).toBe(503)
    expect(await response.json()).toMatchObject({ ok: false, status: 'not_configured' })
    expect(send).not.toHaveBeenCalled()
  })

  it('reports a provider failure as not sent', async () => {
    send.mockResolvedValueOnce({ ok: false, reason: 'rejected', status: 403, providerCode: 'validation_error' })
    const response = await handleEnquiryRequest(jsonRequest(enquiry), deps())
    expect(response.status).toBe(502)
    expect(await response.json()).toMatchObject({ ok: false, status: 'delivery_failed' })
  })

  it('rate limits with Retry-After and sends nothing', async () => {
    limiter.check = vi.fn(async () => ({ allowed: false, remaining: 0, retryAfterSeconds: 900 }))
    const response = await handleEnquiryRequest(jsonRequest(enquiry), deps())
    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBe('900')
    expect(await response.json()).toMatchObject({ status: 'rate_limited', retryAfterSeconds: 900 })
    expect(limiter.check).toHaveBeenCalledWith('ip:203.0.113.7')
    expect(send).not.toHaveBeenCalled()
  })

  it('fails open (and logs) if the rate-limit store is unavailable', async () => {
    limiter.check = vi.fn(async () => {
      throw new Error('store down')
    })
    const response = await handleEnquiryRequest(jsonRequest(enquiry), deps())
    expect(response.status).toBe(200)
    expect(log.error).toHaveBeenCalled()
  })

  it('rejects a filled honeypot without sending', async () => {
    const response = await handleEnquiryRequest(jsonRequest({ ...enquiry, extra_notes: 'buy now' }), deps())
    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({ status: 'rejected' })
    expect(send).not.toHaveBeenCalled()
  })

  it('rejects oversized bodies (declared and streamed)', async () => {
    const big = jsonRequest({ ...enquiry, details: 'x'.repeat(40_000) })
    expect((await handleEnquiryRequest(big, deps())).status).toBe(413)

    const encoder = new TextEncoder()
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (let i = 0; i < 10; i++) controller.enqueue(encoder.encode('y'.repeat(5_000)))
        controller.close()
      },
    })
    const streamed = new Request(URL_, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: ORIGIN },
      body: stream,
      duplex: 'half',
    } as RequestInit)
    expect((await handleEnquiryRequest(streamed, deps())).status).toBe(413)
    expect(send).not.toHaveBeenCalled()
  })

  it('rejects malformed JSON, unsupported types and cross-site requests', async () => {
    expect((await handleEnquiryRequest(jsonRequest('{not json'), deps())).status).toBe(400)
    expect((await handleEnquiryRequest(jsonRequest('[1,2]'), deps())).status).toBe(400)
    const textPlain = new Request(URL_, { method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'hi' })
    expect((await handleEnquiryRequest(textPlain, deps())).status).toBe(415)
    expect((await handleEnquiryRequest(jsonRequest(enquiry, { origin: 'https://evil.example' }), deps())).status).toBe(403)
    expect((await handleEnquiryRequest(jsonRequest(enquiry, { 'sec-fetch-site': 'cross-site' }), deps())).status).toBe(403)
    expect(send).not.toHaveBeenCalled()
  })
})

describe('POST /api/enquiry (plain HTML form, no JavaScript)', () => {
  it('redirects to the result page after a submission', async () => {
    const response = await handleEnquiryRequest(formRequest({ ...enquiry, services: ['video-editing', 'other'] }), deps())
    expect(response.status).toBe(303)
    expect(response.headers.get('Location')).toBe('/enquiry/sent')
    expect(send.mock.calls[0][0].subject).toContain('Video editing, Something else / not sure')
  })

  it('redirects to explanatory pages for problems', async () => {
    const invalid = await handleEnquiryRequest(formRequest({ ...enquiry, email: '' }), deps())
    expect(invalid.headers.get('Location')).toBe('/enquiry/invalid')
    const notConfigured = await handleEnquiryRequest(formRequest(enquiry), deps({ config: readEnquiryConfig({}) }))
    expect(notConfigured.headers.get('Location')).toBe('/enquiry/not-configured')
  })
})
