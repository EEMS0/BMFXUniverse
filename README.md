# EEMS — music, art & merch

The website for EEMS (repository: BMFXUniverse). Live on Vercel at https://bmfx-universe.vercel.app, which deploys automatically from `main`.

Built with Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS 4. The earlier combined EEMS / BMFX version of the site is in the git history at commit `344d0bb`.

## What's on the site

- **Home** (`/`): a collage hero (portrait, wordmark, merch poster, a tap-to-change Eemsoji sticker), a scrolling word band, the merch feature, **Music** with five tracks from SoundCloud, the **Art** gallery with a full-screen viewer, and **About** with links to follow EEMS.
- **Merch** (`/merch`): the merch artwork with zoom and a magnifier, and the live Shopify collection with colours, sizes, cart and Shopify checkout. See [docs/merch.md](docs/merch.md).
- **Art pages** (`/work/<name>`): one page per artwork, also used when JavaScript is off.

### Interactive details

- The hero pieces drop in on load and drift with the mouse; cards tilt and catch a spotlight under the mouse.
- Reveals, the word band and the progress bar at the top follow the page scroll (CSS scroll-driven animations; nothing moves on its own).
- Gallery filters animate cards into place (View Transitions, where supported).
- The music deck's record spins and the equaliser bounces only while SoundCloud reports a track is playing. When you scroll away, a mini player keeps play/pause and next on screen. At the end of a track the next one starts.

All motion is decorative and turns off with the system's "reduce motion" setting. Pointer effects only run with a mouse. Nothing plays by itself: SoundCloud's player loads only after someone presses play.

## Editing content

| What | Where |
| --- | --- |
| Words (tagline, intros, headings) | `src/content/site.ts` |
| SoundCloud tracks | `src/content/music.ts`: copy the track link from SoundCloud and its id from SoundCloud's embed code (`tracks/<id>`) |
| Merch settings (store, collection) | `src/content/merch.ts` and [docs/merch.md](docs/merch.md) |
| Social links, public email | `src/content/links.ts`: a `null` URL keeps that link hidden |
| Art gallery | `src/content/artwork.ts` (images) and `src/content/projects.ts` (entries and categories) |
| Navigation | `src/content/navigation.ts` |

Artwork is only ever the supplied originals. `npm run art` converts them from `../EEMS_BMFX_Website_Build_Pack/original-assets` (or `ART_SOURCE_DIR`) to optimised WebP in `src/assets/art`, checks each file against `ASSET_MANIFEST.json`, and rebuilds the social preview image `public/og-image.jpg`.

Spotify, YouTube and a public email address are deliberately unset until the real addresses are confirmed.

## Commands

```bash
npm install
npm run dev          # http://localhost:3000
npm run check        # type check, lint and unit tests
npm run build        # production build
npm run test:e2e     # browser tests (after a build; uses your installed Chrome)
```

- `npm run art` / `npm run art:variants`: rebuild artwork / the pre-sized images used by static exports.
- `npm run build:pages`: static export into `out/` (e.g. for GitHub Pages).
- `npm run screenshots`: full-page screenshots at six widths (with `npm run start -- -p 3100` running).

The browser tests replace SoundCloud and Shopify with small stand-ins (`tests/e2e/fixtures.ts`), so they never stream real tracks or touch the live store.

## Deployment

**Vercel** (current): every push to `main` deploys to production. Canonical URLs, the sitemap and the social preview image use the project's production domain, which Vercel provides automatically (the `vercel.app` address, or your own domain once you connect one). To use a different address, set `NEXT_PUBLIC_SITE_URL` in Vercel (Project → Settings → Environment Variables). See `.env.example`.

**GitHub Pages** (optional): the workflow in `.github/workflows/deploy-pages.yml` only runs when started by hand (Actions → "Deploy preview to GitHub Pages" → Run workflow). It needs Settings → Pages → Source: "GitHub Actions" first.

No analytics, trackers or cookie banners are included.

## Before launch

- In Shopify, confirm payments are activated and shipping covers the places you sell to. Then place an authorised test order to confirm fulfilment through Tapstitch.
- Add Spotify, YouTube or a public email in `src/content/links.ts` if and when you want them shown.
