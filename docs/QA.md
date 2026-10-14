# Verification — 14 October 2026

## Completed

- `npm run check`: 0 errors, 0 warnings, 0 hints.
- `npm run build`: successful standalone Node build and static generation of public routes.
- `npm test`: 7 domain tests passed. Covers VIN normalization, older VIN guidance, invalid characters, state input, checksum helper, identity/availability separation, signed callback rejection, duplicate order/callback handling, private entitlements, reopening, fulfillment-failure retry, concurrent credit redemption, and streaming request-size limits without Content-Length.
- `npm run test:e2e`: 9 browser/accessibility tests passed against both development and the standalone production build (`TEST_BASE_URL=http://localhost:4322`).
- Responsive browser checks at **320, 390, 768, 1024, and 1440px**: homepage, checkout, reports, and account had no horizontal document overflow. Mobile checker precedes the illustration and starts within the top 450px.
- Keyboard checks: menu Escape and focus return; tab switching; native VIN dialog Escape/focus return; validation announcement and input preservation.
- Functional browser flow: VIN and plate search, truthful provider states, recovery, package choice, guest email, sandbox review/confirmation, private report, download, shortlist, comparison, credit reuse, failed delivery/retry, secure one-use delivery link.
- Privacy checks: another browser session cannot read a report, search, or download; forged cross-site mutation is rejected; private routes have no-store/noindex headers. No client redirect is a fulfillment mechanism.
- SEO checks: sitemap contains only public routes; every sitemap route returns 200, one H1 and canonical metadata; unknown public routes return 404; homepage content exists in server HTML; homepage internal links resolve.
- Axe WCAG A/AA automated scans (WCAG 2, 2.1 and 2.2 tags) had no violations on the homepage, sample report, plate tool, pricing and checklist at 1440px and 320px, plus checkout, private report and account.
- Exact palette contrast calculations for ink text: **5.17:1 on orange**, **15.04:1 on cream**, **12.17:1 on peach**. Orange is not used as small body text on cream.
- Live-mode smoke test: `APP_MODE=live` returned **503** on checkout with `Cache-Control: no-store`.
- Package manifest and lockfile match; inspected browser JavaScript contains no payment-secret handling or server adapter code.
- npm install audit reported **0 vulnerabilities** at installation time.

## Lab performance

A single local Chrome run per viewport used the standalone Node production build, 4× CPU throttling, 40ms simulated network latency and 2 MB/s downstream. See [raw measurements](qa/lab.json) and `scripts/lab.mjs`.

| Viewport | LCP | CLS |
| --- | ---: | ---: |
| 390 × 900 | 1.444 s | 0 |
| 1440 × 900 | 0.308 s | 0 |

These are **local single-run lab observations**, not field p75 results, a Lighthouse certification, or an INP measurement. Field INP and production hosting/network behavior remain unmeasured. The homepage has about 4 KB of checker JavaScript plus a tiny analytics hook, no frontend framework runtime, no external font download, and about 30 KB of uncompressed shared CSS.

## Visual inspection

Final viewport screenshots: [desktop](qa/home-1440.png), [mobile](qa/home-390.png). Browser tests also save full-page screenshots at all five requested widths in the ignored `test-results` directory. Original illustrations render at reserved dimensions. The primary action is visible on common desktop laptop viewports; mobile puts headline, checker, then compact illustration in order.

## Limits

Automated accessibility checks do not establish complete WCAG conformance. Manual screen-reader, zoom/reflow, real-device and user testing remain production work. Live provider accuracy, real tax/payment/refund behavior, durable recovery, email deliverability and contracted coverage cannot be tested without the corresponding integrations. No field analytics exist. The input checksum utility is not a claim that all jurisdictions require a checksum. Sharing and subscriptions are not enabled.

The workspace’s `.git` directory is empty and read-only, so no Git commit could be created. The pinned `package-lock.json` is included with the delivered source.
