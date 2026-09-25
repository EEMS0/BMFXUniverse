import type { Metadata, Viewport } from 'next'
import { Covered_By_Your_Grace, Permanent_Marker, Space_Grotesk } from 'next/font/google'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { site } from '@/content/site'
import { IS_STATIC_PREVIEW } from '@/lib/paths'
import { getSiteUrl } from '@/lib/site-url'
import './globals.css'

// Openly licensed Google Fonts, self-hosted by next/font at build time.
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk', display: 'swap' })
const marker = Permanent_Marker({ subsets: ['latin'], weight: '400', variable: '--font-marker-face', display: 'swap' })
const hand = Covered_By_Your_Grace({ subsets: ['latin'], weight: '400', variable: '--font-hand-face', display: 'swap' })

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: { default: site.title, template: `%s · ${site.name} / ${site.studio}` },
  description: site.description,
  applicationName: `${site.name} / ${site.studio}`,
  openGraph: {
    type: 'website',
    siteName: `${site.name} / ${site.studio}`,
    title: site.title,
    description: site.description,
    locale: 'en_GB',
  },
  // The GitHub Pages preview is a copy for review: keep it out of search results.
  ...(IS_STATIC_PREVIEW ? { robots: { index: false, follow: false } } : {}),
  // Canonical URLs and the social preview image need the real domain. They are
  // only emitted once NEXT_PUBLIC_SITE_URL is set, never with localhost.
  ...(siteUrl
    ? {
        metadataBase: siteUrl,
        ...(IS_STATIC_PREVIEW ? {} : { alternates: { canonical: '/' } }),
        openGraph: {
          type: 'website',
          url: '/',
          siteName: `${site.name} / ${site.studio}`,
          title: site.title,
          description: site.description,
          locale: 'en_GB',
          images: [
            {
              url: '/og-image.jpg',
              width: 1200,
              height: 630,
              alt: 'The yellow EEMS wordmark beside a portrait of EEMS and the BMFX logo on a CRT screen',
            },
          ],
        },
        twitter: { card: 'summary_large_image', title: site.title, description: site.description, images: ['/og-image.jpg'] },
      }
    : {}),
}

export const viewport: Viewport = {
  themeColor: '#0b0a0f',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en-GB" data-scroll-behavior="smooth" className={`${grotesk.variable} ${marker.variable} ${hand.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only-focusable fixed top-3 left-3 z-[100] rounded-full bg-acid px-5 py-3 text-sm font-semibold text-ink-950 shadow-lift"
        >
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  )
}
