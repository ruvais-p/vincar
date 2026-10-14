# Production integration decisions

The implementation is an explicitly gated demo, not a live service. The following work needs confirmed business inputs and real integrations; no credentials or contracts have been invented.

## Before enabling live mode

1. Confirm brand, domain, launch country, language, currency, tax handling, prices, and supported vehicle classes/jurisdictions. Replace the localhost site URL and rebuild all static metadata. Review proposed 12-month prepaid-credit validity.
2. Contract licensed vehicle-data and plate-resolution providers. Document category and make coverage, response semantics, jurisdiction-specific VIN checksum and plate rules, freshness, permitted source attribution, and redistribution rights. Implement `VehicleProvider`. Store provider response and provenance before describing a report as ready. Use a real title-brand glossary only after jurisdiction review.
3. Select a hosted payment provider. Implement `PaymentAdapter`, authenticated checkout sessions, server-calculated taxes/totals, verified raw-body webhooks, event replay protection, reconciliation, refunds and payment reversals. The sandbox callback is an internal simulation, not a deployed payment webhook.
4. Replace the Map-based demo repository with durable storage. Use transactions and uniqueness constraints for normalized vehicle identity per owner/report version, order idempotency keys, callback IDs, entitlements, ledger entries and fulfillment. Use a durable fulfillment queue and retries. Add backups, retention/deletion policy, and access auditing. Multiple Node processes must not use the demo store.
5. Add verified guest email delivery, hashed access-token storage, production account authentication, token revocation, profile verification, recovery, and secure session expiry. The optional demo profile does not constitute a production account. The demo outbox is a local stand-in for email, not a message sender.
6. Define actual refund terms, tax rules, consumer terms, retention, coverage limitations, privacy notice, support address/hours and accessibility contact. The policy pages currently describe the demo and explicitly identify missing business terms. Obtain the appropriate reviews.
7. Confirm final artwork rights and replace original placeholders if desired. See ASSETS.md. Export a raster Open Graph image for social platforms that do not accept SVG. Supply a real Organization identity before adding that structured data.
8. Configure production hosting, HTTPS, trusted proxy origin/client-address handling, infrastructure body/rate limits, CSP hardening and log redaction. Do not log identifiers, request bodies, emails, report content, signed delivery tokens or payment payloads. Do not deploy `.env`, demo outbox access, or secrets in browser bundles.
9. Run staging tests against the actual licensed data and payment sandboxes, including provider outages, delayed/missing/out-of-order webhooks, subscription events if enabled, refunds, concurrent redemptions, and durable recovery after restart. Perform manual assistive-technology testing and real-device performance evaluation. Measure field p75 Web Vitals after launch; current lab results are not field results.

## Deliberately off or omitted

- Trial and AI-assisted comparison plans: shown as proposed demo options ($1 first three days and $39.99/month respectively). No recurring charge is collected. Do not enable production billing before consent, renewal information, invoices, cancellation, taxes, and durable subscription state are implemented and tested.
- Recall lookup and manufacturer pages: hidden until useful, accurate licensed coverage exists. The UI never implies manufacturer endorsement.
- Public report sharing: omitted; reports are private. If added, use unguessable, scoped, expiring/revocable links and enforce authorization consistently on HTML/JSON/download surfaces. Delivery login links are not public sharing links.
- Refreshes, monitoring alerts and AI summaries: outside the demo MVP. Never silently refresh a stored report or consume an extra credit on reopen.
- Verified social proof: the homepage review carousel contains clearly labeled illustrative sample reviews, not actual customer testimonials. Replace these with approved, verified reviews before presenting customer endorsements. No ratings, user totals or partner marks are rendered.
- Production email and payment credentials: no provider selected, no secrets required for the demo.

## Deployment

No public or private hosted deployment was performed. The default `npm run build` targets Vercel; see [VERCEL.md](VERCEL.md). For the standalone local demo, use `npm run build:node` followed by `npm start`. Vercel function instances do not share the in-memory demo repository, so account/search/order continuity is not guaranteed there. Keep `APP_MODE=demo` while exercising this prototype. Setting any other mode returns HTTP 503 on dynamic routes. Removing that gate requires completing and reviewing the integrations above, not merely adding an API key.
