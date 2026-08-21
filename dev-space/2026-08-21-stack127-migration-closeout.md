# stack127 migration closeout

Date: 21 August 2026
Status: Technical cutover complete

## Purpose

This record captures the major work completed during the early-project rename from `version127` to `stack127`. It is stored in `dev-space` so future major changes can follow the same dated-record pattern without turning operational history into public website content.

No secret values, recovery codes, API tokens, database credentials, or private keys are recorded here.

## Brand and identity

- The public brand is `stack127`, written in lowercase.
- The canonical website is `https://stack127.com`.
- The public social identity is `@stack127labs` with display name `stack127` when accounts are supplied.
- The public contact address is `stack127@proton.me`.
- The supplied wordmark and square `127.` mark were preserved as originals and converted into transparent light/dark website variants, favicon assets, and app icons.
- Website copy, metadata, legal pages, structured data, package identity, documentation, tests, scripts, skills, and deployment naming were migrated from version127 to stack127.
- BaseBuddy footer and About-page attribution now identify stack127.

## Domains and canonical structure

The following canonical hosts were established:

- `stack127.com`
- `www.stack127.com`
- `labs.stack127.com`
- `dokploy.stack127.com`
- `basebuddy.stack127.com`
- `basebuddy-demo.stack127.com`

Legacy public hosts remain controlled and permanently redirect to their exact replacements. Paths and query strings are preserved, and the verified redirect families avoid loops and multi-hop chains.

- `version127.com` and `www.version127.com` redirect to `stack127.com`.
- `basebuddy.version127.com` redirects directly to `basebuddy.stack127.com`.
- `basebuddycms.com` redirects directly to `basebuddy.stack127.com`.
- Legacy BaseBuddy demo hosts redirect directly to `basebuddy-demo.stack127.com`.

## Cloudflare, DNS, and security

- `stack127.com` is active on Cloudflare nameservers and points to the dedicated OVH production target.
- Required apex, `www`, Labs, Dokploy, BaseBuddy, and BaseBuddy demo DNS records are present.
- DNSSEC was enabled with registrar DS coordination for the controlled domains completed during the cutover.
- Cloudflare-managed robots.txt is disabled; each application owns its own policy.
- Public pages allow useful search and AI crawlers. No blanket AI-bot or verified-crawler block was left active.
- The Dokploy dashboard remains protected by Cloudflare Access, while the narrowly scoped release API path supports service authentication.
- Cloudflare API credentials used by automation were replaced with scoped account tokens and recorded only in the appropriate secret stores.
- HSTS, TLS, redirects, Access, tunnel, WAF, and public bot behavior were verified after cutover.

## GitHub organization and repositories

The GitHub organization is `stack127labs`, with display name `stack127` and mandatory organization 2FA.

Repository ownership and visibility were established as follows:

- `stack127labs/stack127`: private source of truth for the main website.
- `stack127labs/basebuddy-website`: private BaseBuddy website source.
- `stack127labs/basebuddy`: public BaseBuddy application source.
- `stack127labs/dns-tools`: public DNS Tools source.
- `stack127labs/stack127-datasets`: public dataset source.

Repository descriptions, canonical URLs, remotes, GitHub organization presentation, package ownership, production environment variables/secrets, GHCR access, and the BaseBuddy GitHub App installation were migrated or verified. External repositories remain independent checkouts and are not nested inside the private website repository.

## Application, data, and environments

- The main Next.js application was fully rebranded and released on `stack127.com`.
- The `/labs` directory was added and published through the managed page registry.
- Sitemap, robots, canonical URLs, Open Graph, Twitter metadata, JSON-LD, email references, and branding assets now use stack127.
- The robots policy allows public crawling, excludes `/api/`, points to the canonical sitemap, and omits the unnecessary nonstandard `Host:` directive.
- Managed development and production Supabase are used; no local Docker Supabase stack is required or permitted for this project.
- The page-registry namespace was migrated to `public.stack127_pages` with the required compatibility and security work applied to both managed environments.
- Environment concerns were split across `.env.local`, `.env.database`, `.env.deploy`, `.env.analytics`, `.env.homelab`, and `.env.repos`, with secret-free examples and inventory documentation kept in the repository.
- Changed GitHub, Cloudflare, Dokploy, database, analytics, and repository automation keys are inventoried by key name and storage location without committing their values.

## Analytics and search platforms

- Existing Umami properties were updated in place for `stack127.com` and `basebuddy.stack127.com`, preserving their historical site IDs and avoiding duplicate tracking.
- Google Search Console contains the new stack127 Domain property and recognizes the BaseBuddy subdomain through it.
- Google reports both submitted sitemaps as successful: 53 Stack127 URLs and 122 BaseBuddy URLs at closeout.
- Google live inspection can fetch the old homepage and confirms it is available to Google. Its optional Change of Address validator continues to report a fetch error despite verified direct public `301` responses; redirects and sitemaps remain the authoritative migration signals while Google refreshes its state.
- Bing Webmaster Tools contains both new properties and both successful sitemaps.
- Bing's live robots testers report zero errors and zero warnings for Stack127 and BaseBuddy, and Bingbot is allowed on both homepages.
- Manual Bing indexing requests were accepted for both new homepages. Crawling and indexation are now search-platform processing work rather than a cutover blocker.

## Production and release workflow

- The only Stack127 production target is the dedicated OVH VPS declared in `scripts/stack127/deployment/targets.json`.
- The only production dashboard is `https://dokploy.stack127.com`; the legacy Hostinger Dokploy instance is not a Stack127 target.
- Production releases run through `.github/workflows/stack127-release-e2e.yml`.
- The workflow verifies the current `origin/main` SHA, runs the full quality gate and production preflight, builds an immutable GHCR image, deploys it through the Dokploy API, checks the exact live revision, and smoke-tests the homepage, robots file, and sitemap.
- Broad push-to-deploy behavior is not used; an unverified Git push cannot bypass the release quality gate.
- The live deployment health endpoint reports its immutable build SHA and database status.

## Development workspaces and synchronization

- GitHub `stack127labs/stack127` on `main` is the synchronization point for every checkout and production release.
- The homelab workspace is `/home/teja/projects/stack127` and uses the `stack127-homelab` SSH alias for administration.
- The Mac fallback workspace is renamed to `/Users/ravitejaknts/projects/Stack127` during this closeout after its final release is verified.
- The current Codex task was renamed to `Stack127 migration closeout`.
- Codex does not expose a saved-project rename operation. After the Mac folder move, the renamed folder must be opened once in Codex so it is registered as the `Stack127` project. The homelab folder can likewise be added under its existing `/home/teja/projects/stack127` path on the connected host.
- Final synchronization requires local `HEAD`, homelab `HEAD`, `origin/main`, and the live production health SHA to match exactly with clean working trees.

## Verification performed

The rebrand and subsequent fixes were protected by the repository's typecheck, unit tests, static policy, managed SEO registry validation, desktop/mobile Playwright SEO suite, production build, deployment preflight, immutable release workflow, live revision check, and public smoke tests.

Separate checks also covered:

- old-to-new redirects for the main website and BaseBuddy;
- live canonical, robots, sitemap, favicon, metadata, and branding output;
- Cloudflare crawler reachability and disabled managed robots behavior;
- GitHub repository ownership, visibility, remotes, package access, and production deployment access;
- managed development and production migration state;
- Umami continuity;
- Google and Bing ownership, sitemaps, robots access, and indexing submissions.

## Deliberately deferred follow-up

The owner approved leaving these items for later. They do not block the technical migration:

- social and newsletter profile updates;
- account recovery and secondary-owner review;
- a test message and recovery review for `stack127@proton.me`;
- optional social banners and a dedicated default Open Graph image;
- optional trademark and legal-entity review before significant commercial promotion;
- periodic audits of third-party monitors, webhooks, OAuth callbacks, alerts, and old external backlinks;
- search-engine crawling, canonical consolidation, and the optional Google Change of Address retry;
- retaining the old domains and identity for redirects, recovery, and impersonation prevention.

## Operating rule for future major changes

For each major infrastructure, brand, data, or product migration, add a dated Markdown record to `dev-space` using a descriptive filename such as `YYYY-MM-DD-change-name.md`. Record the decision, scope, systems changed, verification performed, release path, synchronization state, and deliberately deferred follow-up. Never include secret values.
