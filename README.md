# PolyViewer

PolyViewer is a bilingual, read-only viewer for public Polymarket forecast data.
It does not include authentication, wallet connections, trading, or a database.

## Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`; locale middleware redirects to `/en`.

## Verification

```bash
pnpm lint
pnpm build
```

## Deployment

Deploy the repository as a standard Next.js project on Vercel. No environment
variables or paid services are required.

## Data sources

- Gamma API for events, markets, search, and tags
- CLOB API for public probability price history
