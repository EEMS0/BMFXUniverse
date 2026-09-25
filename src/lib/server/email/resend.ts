import 'server-only'

/**
 * Minimal Resend adapter (REST API: POST https://api.resend.com/emails).
 * Uses fetch directly, so there is no SDK dependency and tests can inject a fake.
 * Success is reported only when Resend answers 2xx with an email id.
 */

export interface OutgoingEmail {
  from: string
  to: string[]
  /** The visitor's validated address. It is never used as the sender. */
  replyTo: string
  subject: string
  text: string
  html: string
}

export type SendFailureReason = 'rejected' | 'rate_limited' | 'unavailable' | 'network'

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; reason: SendFailureReason; status?: number; providerCode?: string }

export interface SendOptions {
  apiKey: string
  /** Resend de-duplicates requests with the same key for 24 hours (max 256 chars). */
  idempotencyKey?: string
  fetchImpl?: typeof fetch
  timeoutMs?: number
}

export type EmailSender = (email: OutgoingEmail, options: SendOptions) => Promise<SendResult>

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

export const sendWithResend: EmailSender = async (email, { apiKey, idempotencyKey, fetchImpl = fetch, timeoutMs = 10_000 }) => {
  let response: Response
  try {
    response = await fetchImpl(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey.slice(0, 256) } : {}),
      },
      body: JSON.stringify({
        from: email.from,
        to: email.to,
        reply_to: email.replyTo,
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
      signal: AbortSignal.timeout(timeoutMs),
      cache: 'no-store',
    })
  } catch {
    return { ok: false, reason: 'network' }
  }

  const body = (await response.json().catch(() => null)) as { id?: unknown; name?: unknown } | null

  if (response.ok) {
    if (body && typeof body.id === 'string' && body.id) return { ok: true, id: body.id }
    // A 2xx without an id is not treated as a confirmed submission.
    return { ok: false, reason: 'unavailable', status: response.status }
  }

  const providerCode = body && typeof body.name === 'string' ? body.name : undefined
  if (response.status === 429) return { ok: false, reason: 'rate_limited', status: 429, providerCode }
  if (response.status >= 500) return { ok: false, reason: 'unavailable', status: response.status, providerCode }
  return { ok: false, reason: 'rejected', status: response.status, providerCode }
}
