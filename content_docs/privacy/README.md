# Privacy Page

Route: `/privacy`

Keep this page plain and practical. It should explain the self-managed VPS, Cloudflare edge/CDN layer, self-hosted Umami analytics setup, optional Google Analytics setup, contact email handling, basic logs, third-party links, and update policy.

Domain registration tools send the queried name to the registry and registrar responsible for its ending. Registration facts may be cached by domain name for a bounded period. Requester identifiers are used temporarily for rate limiting, never stored in the cache, and never persistently associated with a lookup. Keep these facts aligned with `stack127_docs/rdap.md`.

Umami should be described as anonymized, aggregate-focused analytics used to understand page performance and usefulness, not user tracking or advertising profiles.

Google Analytics loads only after the visitor allows it. Explain its first-party cookies, the data sent to Google, the path-only page-view handling, the disabled advertising settings, and how the visitor can decline or change the choice. Keep the disclosure aligned with `app/google-analytics-consent.tsx` and `lib/google-analytics.ts`.

Use the shared `.prose` reading typography. Write section headings normally and do not add a decorative dot.

Contact email: `stack127@proton.me`.
