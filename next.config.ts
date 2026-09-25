import type { NextConfig } from 'next'

/**
 * Two deployment targets:
 *
 * - Default (Vercel or any Node host): full site, including the enquiry API and
 *   the built-in image optimiser.
 * - NEXT_PUBLIC_DEPLOY_TARGET=static-preview (GitHub Pages): a static export for
 *   viewing the design online. No server, so no enquiry API; images come from
 *   pre-sized files made by `npm run art:variants` (see static-image-loader.ts).
 */
const staticPreview = process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'static-preview'
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '')

// Keep in sync with WIDTHS in scripts/build-image-variants.mjs and src/lib/static-image-loader.ts.
const staticImageSizes = [96, 160, 320]
const staticDeviceSizes = [480, 640, 960, 1280, 1920]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Server-only routes are named route.server.ts (the enquiry API). The static
  // preview leaves that extension out, so the API is simply not part of it.
  pageExtensions: staticPreview ? ['tsx', 'ts'] : ['tsx', 'ts', 'server.ts'],
  ...(basePath ? { basePath } : {}),
  ...(staticPreview
    ? {
        output: 'export',
        // Pages become folder/index.html, which static hosts resolve unambiguously.
        trailingSlash: true,
        images: {
          loader: 'custom',
          loaderFile: './src/lib/static-image-loader.ts',
          imageSizes: staticImageSizes,
          deviceSizes: staticDeviceSizes,
        },
      }
    : {
        images: {
          // Next.js 16 requires an explicit allowlist of qualities.
          qualities: [75, 85],
          // Artwork masters in src/assets/art are at most 2048px on the long edge,
          // so there is no point offering wider srcset candidates.
          deviceSizes: [360, 480, 640, 750, 828, 1080, 1280, 1600, 2048],
          imageSizes: [48, 64, 96, 128, 160, 256, 320],
        },
        async headers() {
          return [
            {
              source: '/:path*',
              headers: [
                { key: 'X-Content-Type-Options', value: 'nosniff' },
                { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                { key: 'X-Frame-Options', value: 'DENY' },
                { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
              ],
            },
          ]
        },
      }),
}

export default nextConfig
