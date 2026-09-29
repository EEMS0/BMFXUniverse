import type { Metadata, Viewport } from 'next'
import { Covered_By_Your_Grace, Permanent_Marker, Space_Grotesk } from 'next/font/google'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { site } from '@/content/site'
import { getSiteUrl } from '@/lib/site-url'
import './globals.css'

// Openly licensed Google Fonts, self-hosted by next/font at build time.
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk', display: 'swap' })
const marker = Permanent_Marker({ subsets: ['latin'], weight: '400', variable: '--font-marker-face', display: 'swap' })
const hand = Covered_By_Your_Grace({ subsets: ['latin'], weight: '400', variable: '--font-hand-face', display: 'swap' })

const siteUrl = getSiteUrl()

const openGraph = {
  type: 'website' as const,
  siteName: site.name,
  title: site.title,
  description: site.description,
  locale: 'en_GB',
}

export const metadata: Metadata = {
  title: { default: site.title, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph,
  // Canonical URLs and the social preview image need the real domain. They are
  // only emitted once NEXT_PUBLIC_SITE_URL is set, never with localhost.
  ...(siteUrl
    ? {
        metadataBase: siteUrl,
        alternates: { canonical: '/' },
        openGraph: {
          ...openGraph,
          url: '/',
          images: [
            {
              url: '/og-image.jpg',
              width: 1200,
              height: 630,
              alt: 'The yellow EEMS wordmark beside a portrait of EEMS and the EEMS merch artwork',
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
        <div aria-hidden="true" className="scroll-progress" />
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
