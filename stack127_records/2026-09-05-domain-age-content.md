# Domain age content revision

The Domain Age preview now uses a problem-focused intro, one explanation of the age and its limits, and one glossary for terms shown in the result. Removed the separate use-case sections, sample output, repeated field list, and trust FAQ. The approved direction is recorded in `content_docs/domain-age/brief.md`.

The reviewed content command updated managed development from content revision 1 to 3. Revision 2 used a glossary table; visual review showed that the shared table styling forced definitions to scroll horizontally. Revision 3 uses a wrapping glossary list. Tool version remains 1.1.0. Production was not updated.

The route's old content test inspected historical migration text and required the removed headings. It now protects the database-rendering boundary. The historical migration was preserved.

## Verification

- Standalone Playwright checked a live `example.com` lookup, the visible age and timeline, the server-rendered intro, supporting sections, glossary, internal link, canonical, and unchanged clean URL.
- Screenshots inspected at 1440px in dark mode and 390px in light mode. Automated layout checks also passed at both widths in both themes. Document scroll width equaled viewport width in all four cases, including after expanding raw evidence at 390px.
- No browser page errors occurred. The in-app browser runtime reported no available browsers, so screenshots and interaction checks used standalone Playwright.
- Domain Age content tests and shared duration, normalization, and public-suffix tests passed. TypeScript, static page policy, and diff checks passed.
- The development preview returned HTTP 200 through the current Tailscale address on port 3333.

Temporary review files and screenshots are under `/tmp/stack127-domain-age-copy-AMuJNM/`. Live prose remains only in the development database.
