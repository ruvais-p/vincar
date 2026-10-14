# Vincar

A local, responsive Astro + TypeScript vehicle-history prototype. Original cream/orange/charcoal illustration design, static public content, and a server-owned sandbox purchase/report flow. **Demo only: no live vehicle checks, real charges, or sent email.**

## Run

```sh
nvm install
nvm use
npm ci
cp .env.example .env
npm run dev
```

Open `http://localhost:4321`. Node **24.12.0** is pinned in `.nvmrc`; the existing system Node 20 is too old. Direct and transitive dependency versions are pinned in `package.json` and `package-lock.json`.

Astro 7 runs its dev server as a managed process. Use `npx astro dev status`, `npx astro dev logs`, and `npx astro dev stop` to manage it. Set `ASTRO_TELEMETRY_DISABLED=1` to disable framework telemetry.

```sh
npm run check
npm test
npm run build:node
HOST=127.0.0.1 PORT=4321 npm start
npm run test:e2e
```

Browser tests expect the running app on port 4321 and use Chrome at `/usr/bin/google-chrome`. Set `CHROME_PATH` or edit `playwright.config.ts` for another installed Chrome. Alternatively, use Playwright’s bundled Chromium after installing it and removing `executablePath`. `scripts/lab.mjs` uses the built server on port 4322 for the documented lab probe.

## Deploy to Vercel

`npm run build` now produces Vercel Build Output in `.vercel/output`. Import the repository into Vercel with the Astro preset and Node.js 24.x. See [the Vercel hosting guide](docs/VERCEL.md) for environment variables, deployment steps, and the in-memory demo limitation. Use `npm run build:node` followed by `npm start` for the standalone local demo.

## Try the complete demo

1. Open the homepage checker. Expand **Try the demo with sample input**, then **Use an example VIN**. The example is `1HGCM82633A004352`.
2. Leave **Sample records available** selected and check the vehicle. The identity is fictional and explicitly unrelated to the submitted identifier.
3. Choose Single report or Compare 3. Enter a demo email. Review the exact total and confirm **Simulate successful payment**. No card details are requested.
4. Read the private report, download text or print to PDF, save it to the shortlist, and view credits under My reports.
5. With Compare 3, check a different VIN/plate and use an existing credit. Two purchased reports enable the comparison view.
6. Open the private **Demo outbox** to exercise the single-use secure delivery link. No real email is sent. Optional profile creation remains a clearly labelled session-only demo.
7. Test the no-match, unsupported, identity-only, provider-failure, and fulfillment-failure options. A delivery failure retains the sandbox order and its credit; retry never makes another payment.

All records, sessions, credit ledger entries, and orders are in process memory. Restarting the server clears them. This is intentionally unsuitable for live purchasing. `APP_MODE=live` returns a configuration error on dynamic routes.

## Project map

- `src/pages/index.astro`: complete homepage in the requested section order.
- `src/components`: checker, original L1/L2 SVG illustrations, pricing, report layout, icons.
- `src/styles/global.css`: exact palette, responsive layouts, reduced motion, focus and print styles.
- `src/lib/config.ts`: name, market, currency, supported demo jurisdictions, categories, shared plans; membership is disabled.
- `src/lib/models.ts`, `fixtures.ts`, `validation.ts`: shared types and synthetic records.
- `src/lib/server.ts`: demo provider/payment/persistence boundaries; search/order/entitlement/credit transitions.
- `src/middleware.ts`: session authorization context, origin validation, request bounds, rate limit, private cache and robots headers.
- `src/pages/api`: search/action/download endpoints. No private JSON endpoint or public sharing is offered.
- `src/pages/[page].astro`, `guides/[slug].astro`: prerendered tools, guides, sample, pricing, and demo policy content.
- `tests`: domain, end-to-end, responsive, authorization, and automated accessibility checks.

## Delivery notes

See [architecture and integrations](docs/ARCHITECTURE.md), [asset provenance and replacement paths](docs/ASSETS.md), [verification results](docs/QA.md), and [production decisions](docs/PRODUCTION.md).

No deployment was made. No external email was sent. No real charges are possible. The provided `.git` directory is empty and read-only rather than a valid repository, so the source and lockfile are delivered on disk without a Git commit.
# vincar
