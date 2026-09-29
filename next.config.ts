import type { NextConfig } from 'next'

/**
 * Two deployment targets:
 *
 * - Default (Vercel or any Node host): uses the built-in Next.js image optimiser.
 * - NEXT_PUBLIC_DEPLOY_TARGET=static (e.g. GitHub Pages): a static export. Images
 *   come from pre-sized files made by `npm run art:variants` (see
 *   src/lib/static-image-loader.ts). Everything else behaves the same.
 */
const staticExport = process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'static'
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '')

// Keep in sync with WIDTHS in scripts/build-image-variants.mjs and src/lib/static-image-loader.ts.
const staticImageSizes = [96, 160, 320]
const staticDeviceSizes = [480, 640, 960, 1280, 1920]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  ...(basePath ? { basePath } : {}),
  ...(staticExport
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
        // The shop used to be a standalone page at /merch.html.
        async redirects() {
          return [{ source: '/merch.html', destination: '/merch', permanent: true }]
        },
        async headers() {
          return [
            {
              source: '/:path*',
              headers: [
                { key: 'X-Content-Type-Options', value: 'nosniff' },
                { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                { key: 'X-Frame-Options', value: 'DENY' },
                { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
              ],
            },
          ]
        },
      }),
}

export default nextConfig
