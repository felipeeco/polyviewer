# PolyViewer Software Architecture

## System Architecture Overview

PolyViewer is a stateless Next.js App Router application deployed on Vercel. It
renders localized read-only pages and retrieves public forecast data directly
from Polymarket's Gamma and CLOB APIs.

## Component View

- Locale routes provide English and Spanish application-owned interface copy.
- Server components compose listing and detail pages.
- Infrastructure adapters fetch and normalize untrusted Polymarket payloads.
- Presentation components render filters, cards, event details, and SVG charts.

## Data Architecture

The application has no database and persists no market or user data. Next.js
fetch caching limits repeated upstream requests. Live events revalidate after
approximately one minute, charts after five minutes, and archive/tag data after
one day. If the host network redirects or blocks Polymarket DNS, the API adapter
resolves the same hardcoded Polymarket hostname through public DNS and retries
HTTPS with normal certificate and hostname verification.

## Infrastructure & Deployment

The application uses Next.js 16, React 19, Tailwind CSS 4, and next-intl. It is
designed for Vercel Hobby without environment variables, scheduled jobs,
authentication, image optimization, or paid storage.

## Constraints

- Polymarket API text is displayed exactly as supplied and is not translated.
- PolyViewer never places orders or requests wallet access.
- Upstream outages degrade to localized empty/error states.

### Architecture Updates - 2026-06-06

- Established the stateless bilingual forecast viewer architecture.
- Added resilient public-DNS fallback and isolated optional category failures.
