import { connection } from 'next/server'

import { sendWithResend } from '@/lib/server/email/resend'
import { readEnquiryConfig } from '@/lib/server/enquiry-config'
import { handleEnquiryRequest } from '@/lib/server/enquiry-handler'
import { getRateLimiter } from '@/lib/server/rate-limit'

/** Whether email delivery is configured right now (no secrets, just a flag). */
export async function GET() {
  await connection()
  return Response.json({ configured: readEnquiryConfig().email !== null }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  const config = readEnquiryConfig()
  return handleEnquiryRequest(request, {
    config,
    limiter: getRateLimiter(config.rateLimit),
    send: sendWithResend,
  })
}
