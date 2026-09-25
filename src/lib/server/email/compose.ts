import 'server-only'

import { serviceName } from '@/content/services'
import type { EnquiryData } from '@/lib/enquiry/validation'

export interface ComposedEmail {
  subject: string
  text: string
  html: string
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)

/** Builds the notification email. All visitor input is escaped for HTML. */
export function composeEnquiryEmail(data: EnquiryData, submittedAt: Date): ComposedEmail {
  const services = data.services.map(serviceName).join(', ')
  const subject = `New enquiry: ${services} — ${data.name}`.slice(0, 160)
  const rows: [string, string][] = [
    ['Name', data.name],
    ['Email', data.email],
    ['Services', services],
    ['Budget', data.budget || 'Not provided'],
    ['Deadline / timeframe', data.timeframe || 'Not provided'],
    ['Reference links', data.references || 'None provided'],
  ]

  const text = [
    'New project enquiry from the EEMS / BMFX website.',
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'Project details:',
    data.details,
    '',
    '—',
    `Submitted ${submittedAt.toISOString()}. Reply to this email to answer the sender directly.`,
  ].join('\n')

  const cell = 'padding:6px 12px 6px 0;vertical-align:top;'
  const html = `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#111;line-height:1.5">
<p style="margin:0 0 16px">New project enquiry from the EEMS / BMFX website.</p>
<table role="presentation" style="border-collapse:collapse;margin-bottom:16px">
${rows
  .map(
    ([label, value]) =>
      `<tr><th align="left" style="${cell}color:#555;font-weight:600;white-space:nowrap">${escapeHtml(label)}</th><td style="${cell}white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
  )
  .join('\n')}
</table>
<p style="margin:0 0 4px;color:#555;font-weight:600">Project details</p>
<div style="white-space:pre-wrap;border-left:3px solid #9dfb58;padding-left:12px">${escapeHtml(data.details)}</div>
<p style="margin:24px 0 0;color:#777;font-size:12px">Submitted ${escapeHtml(submittedAt.toISOString())}. Reply to this email to answer the sender directly.</p>
</body></html>`

  return { subject, text, html }
}
