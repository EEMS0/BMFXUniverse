import { describe, expect, it, vi } from 'vitest'

import { composeEnquiryEmail } from '@/lib/server/email/compose'
import { sendWithResend } from '@/lib/server/email/resend'

const email = {
  from: 'BMFX enquiries <enquiries@example.com>',
  to: ['owner@example.com'],
  replyTo: 'visitor@example.com',
  subject: 'New enquiry',
  text: 'text',
  html: '<p>html</p>',
}

describe('sendWithResend (simulated provider responses)', () => {
  it('posts to the Resend API with the visitor only in reply_to, and returns the email id', async () => {
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      void init
      return Response.json({ id: 'email_123' })
    })
    const result = await sendWithResend(email, { apiKey: 're_key', idempotencyKey: 'enquiry-abc', fetchImpl })
    expect(result).toEqual({ ok: true, id: 'email_123' })
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://api.resend.com/emails')
    const headers = init?.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer re_key')
    expect(headers['Idempotency-Key']).toBe('enquiry-abc')
    const body = JSON.parse(String(init?.body))
    expect(body).toMatchObject({ from: email.from, to: email.to, reply_to: 'visitor@example.com', subject: 'New enquiry' })
  })

  it('does not report success for a 2xx response without an id', async () => {
    const result = await sendWithResend(email, { apiKey: 'k', fetchImpl: async () => Response.json({}) })
    expect(result.ok).toBe(false)
  })

  it.each([
    [429, 'rate_limited'],
    [422, 'rejected'],
    [403, 'rejected'],
    [500, 'unavailable'],
    [503, 'unavailable'],
  ] as const)('maps HTTP %i to %s', async (status, reason) => {
    const result = await sendWithResend(email, {
      apiKey: 'k',
      fetchImpl: async () => Response.json({ statusCode: status, name: 'some_error', message: 'x' }, { status }),
    })
    expect(result).toMatchObject({ ok: false, reason, status })
  })

  it('reports network failures', async () => {
    const result = await sendWithResend(email, {
      apiKey: 'k',
      fetchImpl: async () => {
        throw new TypeError('fetch failed')
      },
    })
    expect(result).toEqual({ ok: false, reason: 'network' })
  })
})

describe('composeEnquiryEmail', () => {
  const data = {
    name: 'Mallory <script>',
    email: 'visitor@example.com',
    services: ['graphic-design', 'other'] as ('graphic-design' | 'other')[],
    details: 'Line one\n<b>bold?</b> & more',
    budget: '',
    timeframe: 'ASAP',
    references: 'https://example.com/ref',
  }

  it('escapes visitor input in the HTML version', () => {
    const { html } = composeEnquiryEmail(data, new Date('2026-01-02T03:04:05Z'))
    expect(html).not.toContain('<script>')
    expect(html).toContain('Mallory &lt;script&gt;')
    expect(html).toContain('&lt;b&gt;bold?&lt;/b&gt; &amp; more')
  })

  it('includes every field and readable service names', () => {
    const { subject, text } = composeEnquiryEmail(data, new Date('2026-01-02T03:04:05Z'))
    expect(subject).toBe('New enquiry: Graphic design, Something else / not sure — Mallory <script>')
    expect(subject).not.toMatch(/[\r\n]/)
    expect(text).toContain('Budget: Not provided')
    expect(text).toContain('Deadline / timeframe: ASAP')
    expect(text).toContain('Reference links: https://example.com/ref')
    expect(text).toContain('Submitted 2026-01-02T03:04:05.000Z')
  })
})
