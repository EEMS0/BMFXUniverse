import 'server-only'

/**
 * Server-only enquiry configuration, read from environment variables.
 * Secrets and the recipient address never reach the browser.
 */

export interface EmailConfig {
  provider: 'resend'
  apiKey: string
  /** Verified sender, e.g. "BMFX enquiries <enquiries@your-domain>". */
  from: string
  /** One or more recipient addresses. */
  to: string[]
}

export interface RateLimitConfig {
  max: number
  windowSeconds: number
  /** Persistent store shared by every server instance (Upstash Redis REST). */
  upstash: { url: string; token: string } | null
}

export interface EnquiryServerConfig {
  /** `null` when any required email setting is missing. */
  email: EmailConfig | null
  /** Names of the missing variables (safe to log; values are never logged). */
  missing: string[]
  rateLimit: RateLimitConfig
}

const ADDRESS = /[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+/

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export function readEnquiryConfig(env: Record<string, string | undefined> = process.env): EnquiryServerConfig {
  const apiKey = env.RESEND_API_KEY?.trim() ?? ''
  const from = env.ENQUIRY_FROM_EMAIL?.trim() ?? ''
  const to = (env.ENQUIRY_TO_EMAIL ?? '')
    .split(',')
    .map((address) => address.trim())
    .filter(Boolean)

  const missing: string[] = []
  if (!apiKey) missing.push('RESEND_API_KEY')
  if (!from || !ADDRESS.test(from)) missing.push('ENQUIRY_FROM_EMAIL')
  if (to.length === 0 || !to.every((address) => ADDRESS.test(address))) missing.push('ENQUIRY_TO_EMAIL')

  const upstashUrl = env.UPSTASH_REDIS_REST_URL?.trim()
  const upstashToken = env.UPSTASH_REDIS_REST_TOKEN?.trim()

  return {
    email: missing.length === 0 ? { provider: 'resend', apiKey, from, to } : null,
    missing,
    rateLimit: {
      max: positiveInt(env.ENQUIRY_RATE_LIMIT_MAX, 5),
      windowSeconds: positiveInt(env.ENQUIRY_RATE_LIMIT_WINDOW_SECONDS, 3600),
      upstash: upstashUrl && upstashToken ? { url: upstashUrl.replace(/\/+$/, ''), token: upstashToken } : null,
    },
  }
}

/** Whether enquiries can be delivered with the current environment. Safe to pass to the UI. */
export function isEnquiryDeliveryConfigured(): boolean {
  return readEnquiryConfig().email !== null
}
