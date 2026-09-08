# Domain age content review

Reviewed September 6, 2026. This is a supporting-content expansion, not a tool redesign or a sitewide writing-rule change.

## Reader and search intent

The primary task is checking how old a domain is and when it was registered. Secondary questions concern website age, seller claims, renewal and expiry, SEO history, and missing records. Keep the checker above the guide. Use those questions as descriptive headings, not as repeated keyword variants or a duplicate FAQ.

The supplied older-page PDF contains useful interpretation topics. Restore that depth without its sample result, repeated field list, or implication that a new domain contradicts the age of a business.

## Evidence and limits

- Observed in the engine: registry-only lookup, domain and URL normalization, Unicode input, rounded duration, re-registration precedence, missing-service and missing-date states, cached source metadata. The tool does not inspect websites, links, ownership history, or search performance.
- [RFC 5731](https://www.rfc-editor.org/rfc/rfc5731.html) distinguishes creation, renewal, transfer, and deletion operations. Use a two-column table to compare their meaning for registration age.
- [ICANN's renewal and expiry FAQ](https://www.icann.org/resources/pages/domain-name-renewal-expiration-faqs-2018-12-07-en) supports the distinction between expiry, possible recovery, and deletion. Do not promise a date when the name will become available.
- [Internet Archive help](https://help.archive.org/help/using-the-wayback-machine/) documents incomplete website capture. A capture establishes an observed page at that date; interpreting it as an exact launch date is not justified.
- [Google's spam policy](https://developers.google.com/search/docs/essentials/spam-policies#expired-domain) defines expired-domain abuse narrowly. Do not equate every old-domain purchase with abuse or promise rankings from age.

Search backend: web connector. Individual search engines are not available. Search results were used for question discovery, not as technical evidence or a competitive ranking audit. Primary documentation and the implemented lookup support the claims. The content remains server-rendered through the database Markdown renderer; canonical URL and registry metadata are unchanged.

## Preview verification

Run the content tests against development until this copy is separately approved for production:

```bash
STACK127_TEST_DATABASE_ENV=.env.local npx --no-install playwright test tests/pages/domain-age/interface.spec.ts
```

The runner otherwise defaults to `.env.database`, which still contains the earlier public copy. Do not change production data to satisfy a development preview test.

The local preview was inspected with standalone Playwright because the in-app Browser reported no connected instance. The real `example.com` lookup, server-rendered guide, internal destinations, stable canonical URL, both themes at 1440px and 390px, table bounds, and expanded raw-response bounds were checked. Screenshots and measurements are in `/tmp/stack127-domain-age-expanded-yWqytF/`. Temporary evidence may be removed by host cleanup.

The table uses page-scoped wrapping rules while keeping the shared Markdown renderer and typography. No second live copy of the prose lives in the repository. Development content revision changes from 4 to 5; the tool stays at version 1.1.0. No production publication or skill edit is included.

Verification results:

- Development Playwright suite: 8 passed across Chromium desktop and mobile. It checks comparison-table bounds at 1440px, 768px, and 390px, required-input recovery, age-first results, raw-response containment, download, and re-registration.
- Domain-age content tests and shared duration, normalization, and public-suffix tests: all passed.
- `npm run typecheck` and `npm run test:static`: passed. Scoped `git diff --check`: passed.
- Live preview script: real registry result, both themes, no page errors, no table or page overflow, working internal destinations, unchanged canonical and browser URL. Tailscale preview returned HTTP 200.
- `npm run build`: compilation succeeded; the process terminated with exit 143 during its TypeScript stage. This is not a complete build pass. The standalone TypeScript check subsequently passed. Full release verification remains separate from this local content review.
