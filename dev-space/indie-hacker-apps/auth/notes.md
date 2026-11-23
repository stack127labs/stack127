# Auth discovery notes

Research date: 2026-11-04. Scope: step 1 only, in this checkout. No accounts, form submissions, database access, app installations, code changes, commits, or production actions were used.

Read `stack127_docs/product-direction.md` and `stack127_docs/writing-style.md`. The intended reader is one person choosing login and account tools for a real app.

## Result and boundaries

- Main list: **115 candidates**, including 82 active, 29 gray, and 4 check-again records. “Active” describes the public evidence found, not a tested service or a recommendation.
- Held out: **46 records**. These include six retired/restricted choices, seven merged or duplicate names, ten enterprise/unclear-solo-fit cases, nine unresolved offers, and fourteen tools outside account/login scope. Aliases are included in this count, so it is not 46 distinct active competitors.
- Proposed facts: **50 fields**, with a three-product findability test and fixed comparison inputs. No finished app-by-app feature or price dataset was created.
- Each main candidate's official site, docs, or maintainer repository was opened. When a marketing site failed, an official project source was used if readable. Unresolved operation and maintenance are flagged instead of presented as verified.
- No dataset can establish that it includes every auth product. This is a broad first pass with explicit gaps. More breadth is useful only when a named product can be checked and clearly labelled.

## Discovery sources

These codes appear in `apps.md`. Different source kinds were used to avoid letting one vendor's shortlist define the directory. Many sources have a commercial interest; none supplies proof of a competitor's features or prices.

| Code | Kind | Source used | How used / limit |
| --- | --- | --- | --- |
| Brief | Owner's seed list | Names in the task brief | Starting candidates; every one needed an official-site check. Lucia was checked and moved to exclusions because of its official deprecation notice. |
| L1 | Public GitHub list | [casdoor/awesome-auth](https://github.com/casdoor/awesome-auth) | Read the identity/login sections to discover hosted and open-source candidates. Maintained by an auth vendor, so not neutral evidence about competitors. |
| L2 | Public self-hosted list | [awesome-selfhosted](https://github.com/awesome-selfhosted/awesome-selfhosted) | Repository opened, but its list content was not readable through the tool. The dedicated identity-category URL also failed. This is an attempted source, not a completed coverage check. |
| C1 | Community discussion | [Hacker News auth comparison thread](https://news.ycombinator.com/item?id=41923641) | Supplied a wider vendor list, older product names, and questions about full auth versus SSO add-ons. Contains vendor employees and founders; names only, not an independent ranking. |
| C2 | Community discussions | [SaaS auth tools thread](https://www.reddit.com/r/SaaS/comments/1gf7swu/what_tools_do_you_use_for_authentication_in_your/) and [auth-provider thread](https://www.reddit.com/r/SaaS/comments/1eeqgz7) | First thread opened; other thread encountered in search results. Used to find familiar choices and concerns such as setup, cost, and switching. Self-promotion is present. |
| V1 | Vendor comparison | [Corbado Hanko alternatives](https://www.corbado.com/blog/best-hanko-alternatives) | Opened to widen passkey and passwordless discovery. Never used to establish another vendor's pricing or features. |
| R1 | Review directory | [G2 customer identity category](https://www.g2.com/categories/customer-identity-and-access-management-ciam) | Opened to find candidates missed by developer lists, including enterprise suites. Did not copy scores, rankings, customer counts, or inferred solo suitability. |
| R2 | Review/alternatives directories | [SourceForge Auth0/Authgear/MonoCloud comparison](https://sourceforge.net/software/compare/Auth0-vs-Authgear-vs-MonoCloud/) and [AlternativeTo Keycloak alternatives, page 8](https://alternativeto.net/software/keycloak/?p=8) | Read search-result excerpts for additional names. SourceForge compared products are not proof of each other's claims. Eartho was discovered here and failed its official-domain check. |
| R3 | Review-directory alternative list | [SourceForge Authorizer alternatives](https://sourceforge.net/software/product/Authorizer/alternatives) | Read search-result excerpt. Found Vault Vision, OnzAuth, Civic, and Curity candidates. Official sources determined subsequent decisions. |
| R4 | Public launch/alternatives list | [BoxyHQ alternatives on NowFound](https://nowfound.app/alternatives/boxyhq-open-source-alternative-to-auth0-workos) | Read search-result excerpt. Tesseral and SSO-related follow-ups were checked against official repositories. |
| Q1 | Exact-task search | `"add magic link login" authentication service alternatives passwordless` | Found [SimpleAuth.link](https://simpleauth.link/) and followed up MojoAuth through a search result and its official site. A live site does not prove maturity. |
| Q2 | Passkey search | `magic link passkey authentication providers Corbado Hanko alternatives` | Found specialist lists, then opened official product and library sites. [SimpleWebAuthn](https://simplewebauthn.dev/) was checked directly. |
| Q3 | Backend/auth expansion | `"authentication" "backend" "Nhost" "Appwrite" "Convex"` | A seed-led search to cover bundled backend auth. Official sites, not the returned security-audit list, established auth scope. |
| Q4 | Lifecycle follow-up | `authentication "Rownd" "SlashID" "Zalter"` and `site.zalter.com authentication shutdown` | Searches plus direct domains. Zalter's bare domain failed; www.zalter.com worked and still advertised beta. No shutdown established. |
| E | Researcher seed and ecosystem expansion | Official product pages and framework docs linked in `apps.md` | Expanded beyond JavaScript and hosted services: Python, Ruby, PHP, .NET, Java, Elixir, Go, backend bundles, membership tools, phone checks, and wallet auth. This is direct official-source discovery, not evidence of adoption or popularity. |

## Search log

All queries below ran on **2026-11-04**. Exact wording is retained. Searches were for discovery and source location. No signups or forms were submitted.

### Broad developer problems, lists, and reviews

- `authentication service indie hackers add login app alternatives Clerk`
- `awesome authentication identity access management github libraries`
- `site.reddit.com SaaS authentication provider solo developer auth`
- `G2 customer identity access management authentication alternatives`
- `github awesome auth authentication libraries identity`
- `site.g2.com categories customer-identity-and-access-management-ciam`
- `magic link passkey authentication providers Corbado Hanko alternatives`
- `"add magic link login" authentication service alternatives passwordless`
- `"authentication as a service" "alternatives" "Userfront"`
- `"authentication" "backend" "Nhost" "Appwrite" "Convex"`
- `"open source authentication" "Rodauth" "AshAuthentication" "FastAPI Users"`
- `Clerk alternatives "MonoCloud" "Authress"`
- `authentication "Rownd" "SlashID" "Zalter"`
- `auth service "SSOReady" "Ory" "BoxyHQ"`
- `authentication "SAWO" "Cotter" "shut down"`

### Lifecycle, rebrands, and official-source follow-ups

- `site.userfront.com authentication shutdown Supabase acquired` — a search hypothesis, not an acquisition finding. Only Userfront's own ending-service notice was confirmed.
- `site.1password.com Passage shutdown 2026 sunset`
- `Cotter authentication shutdown acquired`
- `site.better-auth.com Auth.js joining Better Auth Vercel`
- `site.ory.com BoxyHQ acquisition Polis`
- `site.tesseral.com acquired SSOReady` — a search hypothesis. No merger was established; do not deduplicate these products on that basis.
- `site.cotter.app shutdown authentication`
- `site.zalter.com authentication shutdown`
- `site.civic.com auth documentation auth.civic.com`
- `site.sinch.com verification API`
- `site.truecaller.com developer SDK login`
- `site.sap.com customer identity access management Gigya`

Direct official-domain opens and document-section searches supplemented these queries. The source URLs sit beside the relevant app or field. Search-result dates were not treated as product launch or maintenance dates.

## Important lifecycle findings

| Name | Finding | Primary evidence, checked 2026-11-04 |
| --- | --- | --- |
| Lucia | Package deprecated in March 2025; current site offers replacement code and learning material. | [Official Lucia site](https://lucia-auth.com/) |
| Arctic | Deprecated in July 2026. | [Official Arctic site](https://arctic.pilcrowonpaper.com/) |
| Userfront Auth | Official notice says service ends May 31, 2026. Main site now leads to another product. | [Official customer login notice](https://userfront.com/customer/login) |
| Passage | Official organization says retired/deprecated January 16, 2026. | [Maintainer organization](https://github.com/passageidentity) |
| Azure AD B2C | Closed to new purchases from May 1, 2025; do not imply existing customers have already lost service. | [Microsoft overview](https://learn.microsoft.com/en-us/azure/active-directory-b2c/overview) |
| IdentityServer4 | Official archive says no longer maintained. | [Official archived repository](https://github.com/DuendeArchive/IdentityServer4) |
| BoxyHQ / Jackson | Acquired by Ory and renamed Polis. Count within Ory's family for now. | [Ory announcement](https://www.ory.com/blog/introducing-ory-polis-for-enterprise-single-sign-on) |
| Stack Auth | Domain redirects to Hexclave; current site includes auth in a broader user platform. Exact new packaging still needs research. | [Old official domain](https://stack-auth.com/) and [Hexclave](https://www.hexclave.com/) |
| Auth.js | Still has docs/code; official repository says it is part of Better Auth and recommends Better Auth for most new projects. | [Official repository notice](https://github.com/nextauthjs/next-auth) |
| Better Auth | Official homepage and Vercel announcement identify an ownership transition. Do not merge the library with every managed provider using it. | [Better Auth](https://better-auth.com/) and [Vercel announcement](https://vercel.com/blog/vercel-acquires-better-auth) |
| Stytch | Official homepage says it has joined Twilio while still presenting the Stytch auth offer. | [Stytch homepage](https://stytch.com/) |
| FastAPI Users | Official docs say maintenance mode: security/dependency updates, no new features planned. | [Official docs](https://fastapi-users.github.io/fastapi-users/latest/) |
| Netlify Identity | Current official docs, updated November 3, 2026, describe an available app-account product. Older lifecycle claims should not override this page without checking. No historical shutdown/relaunch timeline established here. | [Current Netlify docs](https://docs.netlify.com/manage/security/secure-access-to-sites/identity/overview/) |

## Fetch failures and limits

A failed tool fetch can be a network, rendering, path, or access problem. It is not proof a business closed.

- **Tesseral:** `https://tesseral.com` returned 402; `https://docs.tesseral.com` failed. Its official GitHub repository was readable. Cloud operation remains unconfirmed.
- **SSOReady:** homepage and `/docs` timed out; official GitHub repository was readable. Managed-service operation remains unconfirmed.
- **Zalter:** bare `zalter.com` failed; `www.zalter.com` was readable and advertised beta. Production maturity remains unclear.
- **Hybridauth:** official site is readable, but it looks old. Supported versions and current release activity were not established.
- **Supabase, Firebase, Cognito, Clerk, WorkOS, and the other active hosted rows:** their public offer was checked; actual new account creation and live authentication were not tested.
- **SuperTokens:** initial homepage timed out. Official docs and its old alternate domain resolved to the current offer.
- **Frontegg and cidaas:** initial domain variants failed; their working official domains and pricing pages were read.
- **Rauthy:** guessed `rauthy.io` failed; official maintainer repository was readable.
- **Outseta, Back4app, and Backendless:** deeper direct product/document URLs were checked where possible. Back4app and Backendless homepages explicitly described auth even when guessed docs paths failed.
- **AdonisJS:** old guide URLs returned the docs home; official package repository was readable. **django-allauth:** older official docs worked and pointed to the new docs and Codeberg source; the new docs fetch timed out.
- **Cotter, OnzAuth, SAWO Labs, Pangea AuthN, Dynamic, Directus, Apereo CAS, SAP, and OneLogin:** current offer or operation was not confirmed. See `excluded.md` for the exact issue and URLs.
- **Eartho and Rownd:** the domains no longer presented the expected auth offer. The reason was not established. Do not infer a sale, compromise, or shutdown date.
- **OwnID, ReachFive, SlashID, Scalekit, Civic, and Magic:** current positioning differs from older lists. Main/excluded decisions preserve that uncertainty instead of copying old descriptions.
- **Civic Auth:** main marketing site linked to it and public official docs described it as beta; the app-domain fetch failed. No account was created.
- **An unconfirmed seed, `Dozorman`:** an attempted domain did not resolve through the fetch tool and no reliable product identity was established. It was not counted as an app.
- The three-app field test also hit guessed Clerk export/security paths that failed. Working migration and security pages were used instead. A guessed Better Auth `LICENSE` path returned 404; the official Vercel announcement supplied its license statement for this limited test. Component license files still need checking in full research.

## What may still be missing

- Regional services beyond the English-language market, including local phone-login providers and China-facing cloud identity products. Authing was checked, but this was not a systematic regional search.
- Game-focused account services, such as PlayFab, Unity Authentication, Epic Online Services, Nakama, and LootLocker. These names are **unreviewed leads**, not confirmed entries or exclusions.
- WordPress-only login plugins and country-specific national-identity connectors. These can make the directory much larger; decide the boundary first.
- Smaller Go, Rust, PHP, Java, and mobile auth libraries. The current list covers several ecosystems but does not prove current use or maintenance for every library.
- Additional managed Keycloak vendors. Three separate commercial choices were checked; the category is not exhaustive.
- Additional email-code, phone-code, and passkey overlays. We should require maintained documentation and a clear solo purchase/use route rather than include every SMS sender.
- Precise service regions, legal eligibility, prices, free allowances, scale costs, SDK compatibility, security controls, export formats, and support terms. Those belong to the later per-app research after field approval.
- Independent adoption measurements. No ranking, market share, traffic estimate, installation count, or user-satisfaction statistic was established.

## Owner decisions before step 2

1. Approve or narrow the 50 fields. Required fields permit an honest unknown; they do not force invented answers.
2. Keep libraries and framework modules in the auth directory, with a separate view from hosted providers? The brief asks for libraries; the proposal includes built-in auth and generators too.
3. Keep phone-verification add-ons, membership services, private-app identity servers, and wallet auth as specialist groups? They solve related tasks but should not share one full-account price ranking.
4. Review the 29 gray main candidates and the ten enterprise/unclear-solo-fit exclusions. No page design or ranking decision has been made.
5. Use one row per product family, as here, or split independently usable components such as Ory Polis and Laravel packages later? Keep vendor counts separate from product counts either way.
6. Approve the consumer and business price scenarios. They need fixed user behavior and connection counts before they can support honest comparisons.

## Handoff

All outputs are in `dev-space/indie-hacker-apps/auth/`: `apps.md`, `excluded.md`, `fields.md`, and `notes.md`. No file outside that folder was written. The next step is owner review of coverage, gray cases, and fields; then one sourced research record per approved app.
