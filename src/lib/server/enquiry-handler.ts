import 'server-only'

import { ENQUIRY_MESSAGES } from '@/lib/enquiry/messages'
import { type EnquiryOutcome, type EnquiryResponse, outcomeSlugs } from '@/lib/enquiry/types'
import { HONEYPOT_FIELD, MAX_ENQUIRY_BYTES, validateEnquiry } from '@/lib/enquiry/validation'
import { withBase } from '@/lib/paths'
import { composeEnquiryEmail } from './email/compose'
import type { EmailSender } from './email/resend'
import type { EnquiryServerConfig } from './enquiry-config'
import type { RateLimitDecision, RateLimiter } from './rate-limit'
import { clientIp, isCrossSite, readBodyWithLimit } from './request'

export interface EnquiryLogger {
  info(message: string, meta?: Record<string, unknown>): void
  warn(message: string, meta?: Record<string, unknown>): void
  error(message: string, meta?: Record<string, unknown>): void
}

export interface EnquiryDeps {
  config: EnquiryServerConfig
  limiter: RateLimiter
  send: EmailSender
  now?: () => Date
  /** Receives outcomes only — never names, addresses or message text. */
  log?: EnquiryLogger
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function formFields(text: string): Record<string, unknown> {
  const params = new URLSearchParams(text)
  return {
    name: params.get('name'),
    email: params.get('email'),
    services: params.getAll('services'),
    details: params.get('details'),
    budget: params.get('budget'),
    timeframe: params.get('timeframe'),
    references: params.get('references'),
    [HONEYPOT_FIELD]: params.get(HONEYPOT_FIELD),
  }
}

/**
 * Handles POST /api/enquiry.
 * JSON requests (from the site's form script) get JSON responses. Plain HTML
 * form posts (JavaScript unavailable) get a 303 redirect to /enquiry/[status].
 */
export async function handleEnquiryRequest(request: Request, deps: EnquiryDeps): Promise<Response> {
  const log = deps.log ?? console
  const contentType = (request.headers.get('content-type') ?? '').toLowerCase()
  const isJson = contentType.includes('application/json')
  const isForm = contentType.includes('application/x-www-form-urlencoded')

  const respond = (
    outcome: EnquiryOutcome,
    httpStatus: number,
    extra: { errors?: Record<string, string>; retryAfterSeconds?: number } = {},
  ): Response => {
    const headers: Record<string, string> = { 'Cache-Control': 'no-store' }
    if (extra.retryAfterSeconds) headers['Retry-After'] = String(extra.retryAfterSeconds)
    // Only genuine HTML form posts are redirected to a result page.
    if (isForm && !isJson) {
      return new Response(null, { status: 303, headers: { ...headers, Location: withBase(`/enquiry/${outcomeSlugs[outcome]}`) } })
    }
    const payload: EnquiryResponse =
      outcome === 'submitted'
        ? { ok: true, status: 'submitted' }
        : { ok: false, status: outcome, message: ENQUIRY_MESSAGES[outcome], ...extra }
    return Response.json(payload, { status: httpStatus, headers })
  }

  if (!isJson && !isForm) return respond('rejected', 415)
  if (isCrossSite(request)) {
    log.warn('[enquiry] rejected: cross-site request')
    return respond('rejected', 403)
  }

  const body = await readBodyWithLimit(request, MAX_ENQUIRY_BYTES)
  if (!body.ok) return respond('too_large', 413)

  let fields: Record<string, unknown>
  if (isJson) {
    try {
      const parsed: unknown = JSON.parse(body.text)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return respond('rejected', 400)
      fields = parsed as Record<string, unknown>
    } catch {
      return respond('rejected', 400)
    }
  } else {
    fields = formFields(body.text)
  }

  const honeypot = fields[HONEYPOT_FIELD]
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    log.warn('[enquiry] rejected: spam trap field was filled')
    return respond('rejected', 400)
  }

  const validation = validateEnquiry(fields)
  if (!validation.ok) return respond('invalid', 400, { errors: validation.errors })

  const emailConfig = deps.config.email
  if (!emailConfig) {
    log.warn(`[enquiry] not sent: email delivery is not configured (missing ${deps.config.missing.join(', ')})`)
    return respond('not_configured', 503)
  }

  let decision: RateLimitDecision | null = null
  try {
    decision = await deps.limiter.check(`ip:${clientIp(request.headers)}`)
  } catch (error) {
    // Fail open so real enquiries are not lost while the limiter store is down.
    log.error('[enquiry] rate limiter unavailable; request allowed', { error: String(error) })
  }
  if (decision && !decision.allowed) {
    return respond('rate_limited', 429, { retryAfterSeconds: decision.retryAfterSeconds })
  }

  const composed = composeEnquiryEmail(validation.data, deps.now?.() ?? new Date())
  // Identical enquiries (e.g. a retry after a lost response) share a key, so
  // Resend sends them once. Changed content gets a new key.
  const idempotencyKey = `enquiry-${await sha256Hex(JSON.stringify(validation.data))}`
  const result = await deps.send(
    { from: emailConfig.from, to: emailConfig.to, replyTo: validation.data.email, ...composed },
    { apiKey: emailConfig.apiKey, idempotencyKey },
  )

  if (!result.ok) {
    log.error('[enquiry] delivery failed', { reason: result.reason, status: result.status, provider: result.providerCode })
    return respond('delivery_failed', 502)
  }

  log.info('[enquiry] submitted', { id: result.id, services: validation.data.services.length })
  return respond('submitted', 200)
}
