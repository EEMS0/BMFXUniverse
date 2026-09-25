import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ButtonLink } from '@/components/ui/Button'
import { AlertIcon, CheckIcon } from '@/components/ui/Icons'
import { ENQUIRY_MESSAGES } from '@/lib/enquiry/messages'
import { type EnquiryOutcome, outcomeSlugs } from '@/lib/enquiry/types'

/**
 * Result pages for the enquiry form when JavaScript is unavailable: the form
 * posts directly to /api/enquiry, which redirects here with the outcome.
 */
export const dynamicParams = false

export const metadata: Metadata = {
  title: 'Enquiry',
  robots: { index: false, follow: false },
}

const bySlug = Object.fromEntries(Object.entries(outcomeSlugs).map(([outcome, slug]) => [slug, outcome as EnquiryOutcome]))

export function generateStaticParams() {
  return Object.values(outcomeSlugs).map((status) => ({ status }))
}

export default async function EnquiryStatusPage({ params }: PageProps<'/enquiry/[status]'>) {
  const { status } = await params
  const outcome = bySlug[status]
  if (!outcome) notFound()
  const sent = outcome === 'submitted'

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <div className="shell grid min-h-[60vh] place-items-center py-20">
        <div className="max-w-xl rounded-2xl border border-white/10 bg-ink-850 p-8 text-center sm:p-12">
          <span className={`mx-auto grid size-14 place-items-center rounded-full ${sent ? 'bg-acid text-ink-950' : 'bg-ember/15 text-ember'}`}>
            {sent ? <CheckIcon className="size-7" /> : <AlertIcon className="size-7" />}
          </span>
          <h1 className={`font-marker mt-6 text-4xl ${sent ? 'text-acid' : 'text-paper'}`}>{sent ? 'Enquiry submitted' : 'Enquiry not sent'}</h1>
          <p className="mt-4 text-lg text-haze">
            {sent ? 'Thanks — your enquiry was submitted. Any reply will go to the email address you entered.' : ENQUIRY_MESSAGES[outcome as Exclude<EnquiryOutcome, 'submitted'>]}
          </p>
          {!sent ? (
            <p className="mt-3 text-sm text-smoke">Use your browser’s back button to return to the form — your text should still be there.</p>
          ) : null}
          <ButtonLink href="/#hire-me" clientNav variant={sent ? 'outline-acid' : 'acid'} className="mt-8">
            {sent ? 'Back to the site' : 'Back to the form'}
          </ButtonLink>
        </div>
      </div>
    </main>
  )
}
