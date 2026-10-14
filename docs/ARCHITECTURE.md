# Vehicle History architecture

## Rendering

Astro 7.3.8, TypeScript 6, Node 24.12.0 LTS, Node standalone adapter. Public pages, guides, sitemap, and robots are prerendered. Search, checkout, account, report, and API routes are server-rendered and use no-store/noindex headers. No SPA or UI framework runtime. Small bundled native TypeScript modules handle tabs, validation, dialogs, menus, and checklist state.

The homepage follows the specified order: header → hero (L1/checker) → factual confidence strip → Why/What/Who with L2 → report categories → steps → sample/free-paid distinction → pricing → make coverage explanation → guides → FAQs → final CTA → footer.

## Domain and boundaries

- `src/lib/config.ts`: product/market/currency/language/jurisdictions/category list and shared plans. USD prices are integer minor units. Membership is disabled. Do not enable it without implementing explicit consent, renewal, invoices, cancellation, tax, and subscription webhook handling.
- `models.ts`: Search, VehicleIdentity, Coverage, ReportEvent, Report, Order, Entitlement, CreditLedgerEntry, User; Plan lives in shared config.
- `validation.ts`: server/client structural VIN and plate validation. Checksum helper is tested but intentionally not applied to arbitrary VINs; a licensed provider must indicate whether the specific vehicle's jurisdiction/type requires it. Demo plates use a broad safety bound, not a claim of a universal state format. Historical VINs receive an explanation.
- `fixtures.ts`: one fictional vehicle, fixed source freshness, dated synthetic evidence, and explicit unavailable categories. Fixture identity never represents real decoding. No owner identities.
- `server.ts`: provider/payment/persistence interfaces, demo adapters, state transitions, ledger, entitlements, and private email simulation.

## Search and purchase states

`received → identified / available / no-match / unsupported / failed` is provider-owned. Identity does not imply history coverage. Only `available` can enter checkout. Report generation is deferred until fulfillment. Search identifiers are opaque 192-bit random values; raw VIN/plate never enters URLs, page titles, analytics, or canonical metadata.

`pending order → signed sandbox callback → paid → persisted report + entitlement + one credit debit → fulfilled`.

The sandbox adapter signs a server-created payload with an ephemeral HMAC key. `receiveWebhook` verifies signature, order amount, currency and event uniqueness. No client return URL grants access. Retries reuse the pending order; duplicate callbacks grant credits once. Fulfillment serializes by owner and deducts a credit only after the provider has returned a report. Duplicate fulfillment reuses the existing report. Equivalent identifier searches reopen an existing report without charging again. Failed orders remain visible and retryable, with credit intact.

There is no publicly exposed sandbox webhook endpoint: the local sandbox provider invokes the shared verified callback handler. A live integration must expose a narrowly scoped signature-verified webhook endpoint and must not treat browser-origin checks as webhook authentication.

## Privacy and sessions

An HttpOnly, SameSite=Lax cookie maps to a random owner through the demo store. Cookies use Secure on HTTPS. Missing/foreign report, download, search, and order access returns 404. The same check applies to text downloads; report printing uses already-authorized HTML. There is no report JSON or sharing endpoint. Optional public report sharing is not implemented, so reports stay private.

Guest delivery is a private demo outbox. A random, single-use, 30-minute token allows access after an explicit POST; GET does not consume it. It is a login link, not a public sharing link. The demo stores token plaintext only to render its fake inbox; a real email adapter must store only the digest and send the raw token once. The demo profile is optional and explicitly unverified; it does not merge accounts by email.

Mutations reject foreign origins. `strict-origin` referrer policy sends only the site origin, avoiding private paths while preserving native form Origin checks. Requests have a bounded body and server-address rate limiting; the in-memory limiter is single-process only. Deploy behind a trusted proxy with explicit proxy configuration and infrastructure request-size/rate limits.

`APP_MODE=live` fails closed on dynamic routes. No real data or payment adapter can accidentally be enabled. Static public output remains marked demo. Production persistence is deliberately not implied: **all application data disappears on process restart**. Production must implement durable repositories, transactional uniqueness, authenticated users, distributed rate limiting, a fulfillment queue, and verified email delivery before this gate is removed.

## SEO and claims

Public pages have unique metadata, canonical links, one H1, meaningful static HTML, and internal links. Only genuine WebSite, Article (no invented author), and BreadcrumbList descriptions should be emitted. An Organization entity is intentionally omitted while no legal/business identity is known. Make pages and recall lookup are hidden until real coverage exists. The domain is local by default and must be configured at build time; rebuild when product metadata changes. Robots is crawl guidance, never access control.

## Analytics

`analytics.ts` emits only an allow-listed event name as a local CustomEvent. No analytics service or network transmission is configured. Server purchase confirmation can be integrated after signature verification; never infer it from a client redirect. Production monitoring should measure failed searches, successful fulfillment, refunds, support, and repeat usage alongside conversion. No cancellation event fires because there is no recurring plan.

## References consulted

- Astro routes: https://docs.astro.build/en/basics/astro-pages/
- Astro on-demand rendering: https://docs.astro.build/en/guides/on-demand-rendering/
- Node LTS releases: https://nodejs.org/en/about/previous-releases
- EpicVIN flow reference: https://epicvin.com/ (information sequence only; no reused copy, claims, assets, or branding)
