# Production Audit - Sathi Homecare

Date: 2026-05-06

## Findings

- Production HTML at `https://sathihomecare.in/` returned only `JavaScript is required to run this application.`
- The frontend was Vite/React CSR, so crawlers could not see service, FAQ, footer, schema, or page content in source HTML.
- SEO metadata existed in `index.html`, but public route content and route-specific metadata were client-side only.
- Favicon support was incomplete: only one large PNG was referenced after the previous fix; no ICO, 32px icon, Apple touch icon, or manifest existed.
- Footer relied on legacy responsive CSS and could compress unpredictably on small screens.
- API calls had no timeout or retry behavior, and auth state initializers directly touched `localStorage`, making the code unsafe for SSR migration.
- Production CORS only allowed the apex domain in MySQL profile, not the `www` domain.
- Local Windows network diagnostics showed TLS/Schannel failures for direct PowerShell/curl requests, while browser/web fetch succeeded. This points to client/network stack restrictions rather than only app code.

## Fixes Implemented

- Migrated production frontend build to Next.js App Router.
- Added server-rendered/static public routes: `/`, `/services`, `/blogs`, `/faq`, `/founders`, `/login`, `/partner/login`, `/admin`, and legal pages.
- Moved legacy Vite pages to `src/legacy-pages` so old tested flows remain available while Next controls production routing.
- Added route metadata, canonical URLs, Open Graph, Twitter cards, LocalBusiness/MedicalBusiness schema, Service schema, ItemList schema, and FAQ schema.
- Added `robots.txt`, expanded `sitemap.xml`, and added PWA `manifest.json`.
- Added professional favicon set: `favicon.ico`, `favicon-32x32.png`, `apple-touch-icon.png`, and `favicon.png`.
- Added responsive app-like shell with sticky navigation, compact footer grid, fluid typography, touch-friendly CTAs, and no intentional horizontal scrolling.
- Hardened API client with production-safe env support, timeout, retry for transient failures, and undefined header cleanup.
- Made auth storage initialization SSR-safe and fixed hook dependency warnings.
- Expanded backend CORS headers and allowed `https://www.sathihomecare.in` in production MySQL profile.

## Verification

- `npm run build` passes with Next App Router static output.
- Generated HTML contains real public content and no `JavaScript is required` placeholder.
- `npm run lint` passes.
- `npm run test:run` passes: 4 test files, 12 tests.
- `mvn.cmd -q test` passes for backend.

## Deployment Notes

- Production frontend now expects a Next deployment (`npm run build`, then `npm run preview`/`next start`) or a platform with Next.js support.
- Set `NEXT_PUBLIC_API_BASE_URL=https://sathihomecare-backend.onrender.com/api`.
- Configure `APP_PAYMENT_UPI_ID=8090806731@ybl` and optional `RESEND_API_KEY` for live UPI checkout confirmations.
- If deploying behind Apache/static hosting only, switch deployment to a Next-compatible Node host or configure static export separately.
