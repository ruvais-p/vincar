# Vercel hosting

The project uses the official `@astrojs/vercel` adapter. Public pages remain prerendered; API, search, checkout, account, and report routes run in Vercel's Node.js functions. The adapter generates `.vercel/output`, including static assets, function bundles, and routing configuration.

## Deploy from a repository

1. Push the project, including `package-lock.json` and `vercel.json`, to your Git provider.
2. Import the repository in Vercel. Choose the **Astro** framework preset and the repository root as Root Directory.
3. Use **Node.js 24.x** (matching the package's Node engine requirement). Keep Install Command `npm ci` and Build Command `npm run build`, supplied by `vercel.json`. Leave Output Directory at the framework default; do not override it to `dist` or `dist/client`.
4. Set `APP_MODE=demo` for Preview and Production. Optionally set `PUBLIC_PRODUCT_NAME=Vincar`. For a custom domain, set `PUBLIC_SITE_URL` to its full HTTPS origin, such as `https://your-domain.example`, and rebuild. Otherwise, the configuration uses Vercel's production-domain variable, falling back to the deployment URL. Do not copy a localhost URL into Vercel environment variables. Leave `DEPLOY_TARGET` unset on Vercel.
5. Deploy, then check the homepage, images, pricing, guides, and sample report. Review function logs when testing dynamic routes.

No deployment or external account connection is performed by this configuration change.

## Hosting scope and demo state

The public website is ready for Vercel hosting. Dynamic workflows still use the existing in-process demo Maps for sessions, searches, reports, orders, credits, and rate limits. Cold starts, scaling, or different function instances can lose or fail to find that state, even between consecutive requests. A successful build does not make these workflows reliable on serverless hosting. No real payments or live vehicle data are enabled.

Before relying on hosted searches, checkout, or accounts, replace the demo repository and session store with shared durable storage and implement transactional credit/order updates. Simply adding an Astro session driver does not persist this application's custom Maps. The project does not currently use Astro's Sessions API. Keep the existing live-mode gate until the integrations in [PRODUCTION.md](PRODUCTION.md) are complete.

For a dependable single-process demo locally:

```sh
nvm use
npm ci
npm run build:node
npm start
```

For the Vercel artifact:

```sh
npm run check
npm test
npm run build
```

`npm start` is for the standalone Node build, not Vercel's function output. Vercel invokes the generated functions itself. Do not enable ISR for private routes; their responses use `private, no-store`.

## Dependency note

The Vercel routing utility pins an older `path-to-regexp`. A scoped npm override selects the patched compatible 6.3.0 release. Keep the lockfile committed and recheck the override when updating the adapter.

Reference: [Astro's official Vercel adapter guide](https://docs.astro.build/en/guides/integrations-guide/vercel/).
