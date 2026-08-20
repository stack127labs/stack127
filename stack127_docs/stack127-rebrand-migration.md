# stack127 rebrand and migration plan

Status: implementation in progress
Created: 20 August 2026
Last updated: 20 August 2026

This document is the source of truth for changing the complete `version127` identity to `stack127`. It covers the public brand, domains, GitHub organization and repositories, application, managed Supabase environments, deployment, infrastructure, SEO, documentation, external projects, analytics, email, social profiles, redirects, verification, and retirement of the old identity.

The user authorized the complete rebrand, infrastructure changes, repository migration, and production release on 20 August 2026. Social-account creation remains out of scope until the user supplies the accounts. The user supplied and approved the final wordmark and square mark later the same day, so the website logo and favicon replacement are now in scope.

Checklist legend: checked items have been implemented and verified; unchecked items are pending or have not yet been independently verified.

## Current implementation snapshot

| Workstream | Status | Verified result |
| --- | --- | --- |
| Domain and Cloudflare zone | Complete for public cutover | Domain is active on Cloudflare nameservers; apex, `www`, Labs, Dokploy, and both BaseBuddy DNS records exist; AI crawlers are allowed and Cloudflare robots.txt management is off |
| Main application rebrand | Live | Public copy, metadata, environment namespaces, docs, scripts, tests, skills, workflow, and package identity use stack127 in production |
| Labs directory | Live | `/labs` is implemented, published in the managed registry, covered by tests, and available on the canonical domain |
| Managed Supabase | Complete | Forward migration applied and verified on managed development and production; no local Docker Supabase was used |
| Verification | Complete locally | Typecheck, 375 unit tests, static policy, SEO registry, production build, and 340-case browser SEO suite pass |
| Old-domain redirects | Complete in Cloudflare | Main apex/`www` and both BaseBuddy redirect rules are active with paths and query strings preserved |
| Dokploy administration | Domain cutover complete | Project/application display names are `stack127`; dashboard/Access/tunnel work; apex and `www` mappings are HTTPS and the live health endpoint returns `200` |
| GitHub organization and repositories | Complete for cutover | `stack127labs` profile and mandatory 2FA are configured; all five repositories were transferred, renamed where required, and their required visibility was verified |
| BaseBuddy source/deployments | Live | Both repositories and domains are migrated; website footer/About copy at `ef48eb9` is live; the GitHub App is installed only on `basebuddy-website`; both Dokploy providers were reconnected and the production and demo deployments completed successfully |
| DNS Tools and datasets | Source pushed | Repository branding, links, manifests, documentation, and publisher identity are live in their transferred repositories; DNS Tools tests and build pass |
| Production release | Live | GitHub Actions release `32349852781` succeeded; Dokploy and the live health endpoint report `15486b515512c001ade320bf2e2bb9b38a4b92c0` |
| Logos and social profiles | Website assets complete | Supplied originals are preserved byte-for-byte; transparent theme wordmarks and the dark square favicon family are integrated and release-verified through the normal production workflow; no social account was created or changed |

## Approved decisions

| Area | Decision |
| --- | --- |
| Public brand | `stack127`, lowercase, including at the start of a sentence |
| Canonical website | `https://stack127.com` |
| Social username | `@stack127labs` |
| Social display name | `stack127` |
| GitHub organization | `stack127labs` with display name `stack127` |
| Contact email | `stack127@proton.me` |
| Main source repository | `stack127labs/stack127`, private |
| BaseBuddy website repository | `stack127labs/basebuddy-website`, private |
| BaseBuddy app repository | `stack127labs/basebuddy`, public |
| DNS Tools repository | `stack127labs/dns-tools`, public |
| Public dataset repository | `stack127labs/stack127-datasets`, public |
| Development database | Existing managed development Supabase project |
| Production database | Existing managed production Supabase project |
| Local Supabase | Prohibited; do not start or depend on a local Docker Supabase stack |
| Logos | Use the owner-supplied `stack127.` wordmark and `127.` square mark; preserve untouched originals and derive transparent light/dark website assets plus a dark square favicon family |
| Social accounts | The user supplies the accounts; agents must not create social accounts |

## Verified starting point

The planning audit found approximately 414 tracked or ignored repository files containing `version127` or `version127.com`. Some are active public-brand references, some are internal namespaces, and some are immutable historical records.

Current public and administrative hostnames found in this repository:

- `version127.com`
- `www.version127.com`
- `dokploy.version127.com`

Current BaseBuddy DNS additionally includes:

- `basebuddy.version127.com`
- `basebuddy-demo.version127.com`

The current GitHub organization `version127` contains:

- `version127/basebuddy-website`, private
- `version127/basebuddy`, public
- `version127/dns-tools`, public
- `version127/version127-datasets`, public

The private website source is currently `RaviTejaKNTS/version127`, not a repository inside the existing organization.

The live website currently emits the old identity through visible navigation and footer branding, page copy, canonical URLs, Open Graph metadata, Twitter metadata, JSON-LD, logo alt text, analytics domain configuration, and the contact email. The production release contract also embeds the old identity in GitHub Actions, GHCR, Dokploy, Cloudflare checks, environment variables, health checks, package scripts, and deployment tests.

The local GitHub CLI authentication was stale during the planning audit. On 20 August 2026 it was replaced with the `stack127labs`-owned, selected-repository token documented in `stack127_docs/environment-inventory.md`; the superseded `version127 repos` token was revoked after verification.

## Final domain structure

| Hostname | Purpose | Canonical behavior |
| --- | --- | --- |
| `stack127.com` | Main stack127 website | Canonical, indexable website |
| `www.stack127.com` | Conventional `www` entry | Permanent redirect to the same path on `stack127.com` |
| `labs.stack127.com` | stack127 project directory | Serve the project directory or redirect to a canonical repo-owned `/labs` page |
| `dokploy.stack127.com` | Production Dokploy dashboard | Protected by Cloudflare Access; never indexable |
| `basebuddy.stack127.com` | BaseBuddy website and application entry | Canonical BaseBuddy production hostname |
| `basebuddy-demo.stack127.com` | BaseBuddy demonstration environment | Canonical BaseBuddy demo hostname; must remain clearly separated from production |

The BaseBuddy demo hostname intentionally preserves the existing `basebuddy-demo.<domain>` pattern. Do not silently change it to `demo.basebuddy.stack127.com` during implementation.

### Old-domain continuity

| Old hostname | Required destination |
| --- | --- |
| `version127.com/<path>` | `https://stack127.com/<path>` with query string preserved |
| `www.version127.com/<path>` | `https://stack127.com/<path>` with query string preserved |
| `basebuddy.version127.com/<path>` | `https://basebuddy.stack127.com/<path>` with query string preserved |
| `basebuddy-demo.version127.com/<path>` | `https://basebuddy-demo.stack127.com/<path>` with query string preserved |
| `basebuddycms.com/<path>` and `www.basebuddycms.com/<path>` | `https://basebuddy.stack127.com/<path>` with query string preserved and no intermediate redirect |
| `demo.basebuddycms.com/<path>` | `https://basebuddy-demo.stack127.com/<path>` with query string preserved and no intermediate redirect |

Keep the old domain and old usernames under the user's control. Do not release or delete them. Keep path-preserving redirects for at least 24 months and preferably indefinitely.

`dokploy.version127.com` should remain available only during the administrative-hostname cutover. After `dokploy.stack127.com` and its Cloudflare Access policy are verified, retire the old administrative hostname without exposing an unprotected fallback.

## Scope exclusions and approval boundaries

- Do not create social accounts. Ask the user for access to the existing or newly supplied accounts when profile updates are ready.
- Preserve the owner-supplied original logo files byte-for-byte. Derived website assets may remove the background and change only the foreground/background colors needed for light and dark presentation; do not redraw the letterforms.
- Do not launch a local Supabase Docker stack for development, testing, migration generation, or verification.
- Do not create new Supabase projects merely for the rebrand.
- Do not rewrite Git history or already-applied Supabase migration history.
- Do not delete the old GitHub organization, domain, social handles, email account, packages, or repositories.
- The full implementation is authorized; continue recording externally visible mutations and verification evidence in this document.
- Do not expose environment values or secrets in logs, documentation, commits, screenshots, or chat output.

## Phase 1: secure the identity

- [x] Register `stack127.com`.
- [x] Enable registrar lock and WHOIS privacy.
- [ ] Verify registrar auto-renewal, account recovery, and 2FA.
- [x] Add `stack127.com` to the correct Cloudflare account.
- [ ] Confirm control of `stack127@proton.me` and its recovery configuration.
- [ ] Confirm which `@stack127labs` social accounts the user has claimed and will provide.
- [x] Create the free GitHub organization `stack127labs` under `RaviTejaKNTS` with contact email `stack127@proton.me`.
- [ ] Complete a basic trademark and naming-conflict review before paid promotion or merchandise.
- [ ] Record account ownership and recovery information in the user's password manager, never in the repository.

Exit gate: the domain, email, GitHub namespace, and priority social namespaces are controlled by the user before public code or DNS begins using them.

## Phase 2: prepare the GitHub organization

Configure `stack127labs` with:

- [x] Display name `stack127`.
- [x] Website `https://stack127.com`.
- [ ] Public contact email `stack127@proton.me`. GitHub accepted the profile update but cleared this field because the address is not yet available as a verified public email on the owner account.
- [ ] Final avatar when the user provides the logo.
- [x] Organization description. The profile README remains optional and is not yet created.
- [ ] Primary owner and at least one recovery owner where practical.
- [x] Mandatory 2FA. Secure-method-only enforcement remains off until every future member's recovery methods are known.
- [ ] Least-privilege teams and repository permissions.
- [ ] Actions, package, fork, issue, discussion, and repository-creation policies.
- [ ] Organization security settings and recovery information.

### Repository migration map

| Current repository | Destination | Required visibility | Notes |
| --- | --- | --- | --- |
| `RaviTejaKNTS/version127` | `stack127labs/stack127` | Private | Private source of truth for the stack127 website, database workflows, and infrastructure |
| `version127/basebuddy-website` | `stack127labs/basebuddy-website` | Private | Standalone BaseBuddy website and deployment source |
| `version127/basebuddy` | `stack127labs/basebuddy` | Public | Standalone open-source BaseBuddy application |
| `version127/dns-tools` | `stack127labs/dns-tools` | Public | Standalone open-source DNS tools |
| `version127/version127-datasets` | `stack127labs/stack127-datasets` | Public | Generated public datasets; private database remains the source |

The visibility of `stack127labs/stack127` and `stack127labs/basebuddy-website` is a hard requirement. Verify both are private immediately before and after transfer.

### Verified pre-transfer baseline

| Repository | Visibility | Default branch | Baseline commit | Transfer-sensitive settings |
| --- | --- | --- | --- | --- |
| `RaviTejaKNTS/version127` | Private | `main` | `bdbcdfbdaef9c7dae9472044f344a700b1bb8cef` | `production` environment; repo secrets `DATABASE_POOLER_URL`, `DATABASE_URL`; production variables `CLOUDFLARE_ZONE_ID` plus three `VERSION127_*`; five production secrets; verified read-only `Version127 OVH Dokploy` deploy key; direct admin `RaviTejaKNTS` |
| `version127/basebuddy-website` | Private | `self-host-dev` | `7a0a9fa8dda235f4be7d2c467ed90bc1c71b9c70` | Issues/projects enabled; no rulesets, environments, Actions variables/secrets, hooks, or deploy keys; direct admin `RaviTejaKNTS` |
| `version127/basebuddy` | Public | `main` | `2ff50ab454805e498756d1013a1dc2af22acb7fd` | Issues/projects enabled; no rulesets, environments, Actions variables/secrets, hooks, deploy keys, or direct collaborators |
| `version127/dns-tools` | Public | `main` | `f437732151b4f35888c3b0e758dff79e90b99a24` | Issues/projects enabled; no rulesets, environments, Actions variables/secrets, hooks, deploy keys, or direct collaborators |
| `version127/version127-datasets` | Public | `main` | `701ef491da3db6c2d56c1972671c5dbd38d08ddc` | Issues/projects/wiki enabled; no rulesets, environments, Actions variables/secrets, hooks, deploy keys, or direct collaborators |

All five repository baselines were read through authenticated GitHub APIs using administrator access. Secret values were neither read nor recorded.

For every repository:

- [x] Record the pre-transfer repository visibility, branch, baseline commit, core settings, environments, variable/secret names, hooks, deploy keys, and collaborators for all five repositories.
- [x] Transfer the repositories and preserve the production environment, its five secrets, four legacy variables, repository secrets, and deploy key through GitHub's native transfer.
- [x] Verify repository visibility immediately after transfer: `stack127` and `basebuddy-website` are private; `basebuddy`, `dns-tools`, and `stack127-datasets` are public.
- [ ] Update description, website, topics, social preview, README links, badges, clone commands, contribution links, support links, security policy, and CODEOWNERS.
- [x] Update the active local and temporary migration-checkout Git remotes. Homelab checkouts, if any, remain to be audited separately.
- [x] Update Dokploy and the BaseBuddy GitHub App to the new owner/repository. The app is transferred to `stack127labs`, its Dokploy callback/webhook URLs are updated, installation is restricted to `basebuddy-website`, the provider connection finds exactly one repository, and both BaseBuddy application sources point to `stack127labs/basebuddy-website` on `self-host-dev`.
- [ ] Verify issues, releases, stars, watchers, forks, tags, and redirects.
- [ ] Run the repository's own quality gate after the transfer.

Keep the existing `version127` organization controlled. After transfers, give it a small public pointer to `stack127labs` rather than deleting it. Do not create tracked copies, submodules, subtrees, or runtime dependencies between the repositories.

## Phase 3: visual identity asset pass

Until the user supplies the final stack127 logos:

- [x] Leave the existing logo files untouched.
- [x] Do not create temporary AI logos.
- [x] Keep existing logo asset paths unchanged while they contain old artwork.
- [x] Use a plain text `stack127` wordmark until the final supplied assets are available.
- [x] Track final logo replacement as a remaining launch task.

After the final assets arrived on 20 August 2026:

- [x] Preserve byte-for-byte copies of both supplied originals under `public/brand/originals/`.
- [x] Add transparent light and dark wordmark and square-mark variants without redrawing the supplied artwork.
- [x] Generate `favicon.ico`, 16 x 16, 32 x 32, 48 x 48, Apple touch, Android/PWA 192 x 192, and Android/PWA 512 x 512 assets from the dark square mark.
- [x] Create reusable light and dark square avatar derivatives.
- [ ] Create social banners, set the GitHub organization avatar, and add a dedicated default Open Graph image when those separate external/profile tasks are approved.
- [x] Update website image paths, intrinsic dimensions, accessible link labels, and the structured-data logo target.
- [x] Verify the header wordmark in both themes at desktop and mobile breakpoints, including the 320 px overflow guard.

The shared header and footer now use the owner-supplied image wordmark. `stack127_docs/brand-assets.md` records the protected originals, derivative filenames, favicon choice, and reproducible build command.

## Phase 4: application branding and public copy

- [x] Change the central site name from `version127` to `stack127`.
- [x] Change the default site URL from `https://version127.com` to `https://stack127.com`.
- [x] Update navigation, footer, copyright, accessibility labels, and sidebar copy.
- [x] Rewrite the About page, including the old “Why version127?” explanation.
- [x] Update Privacy and Terms pages.
- [x] Replace `version127@proton.me` with `stack127@proton.me` everywhere active.
- [x] Update breadcrumbs, WebSite/Organization/WebPage JSON-LD, and page-level structured data.
- [x] Update visible tool copy, course copy, examples, placeholders, results, limitations, and API error messages.
- [x] Replace `version127.com` examples where they describe the site rather than a historical fact.
- [x] Update HTTP user-agent strings used by RDAP, DNS, and dataset jobs.
- [x] Update active links to the GitHub organization, repositories, datasets, issues, releases, and source pages.
- [x] Update generated-art brand headers and generator inputs.
- [x] Review public page docs and page registry metadata for old brand text.
- [x] Run the server-rendered SEO/browser audit across every published page.

Preserve every existing public route slug. The migration changes identity and hostname, not the information architecture.

## Phase 5: SEO and search migration

- [x] Update metadata titles and title templates.
- [x] Update canonical URLs.
- [x] Update Open Graph title, URL, site name, image, and image alt text.
- [x] Update Twitter Card metadata.
- [x] Update `application-name` and any web-manifest identity.
- [x] Update WebSite, Organization, WebPage, Article, FAQ, breadcrumb, and tool JSON-LD where present.
- [x] Update sitemap URLs to `stack127.com` only.
- [x] Update robots host and sitemap references.
- [x] Configure the old main domain to redirect instead of serving indexable duplicates.
- [x] Preserve page slugs, content, publication dates, and meaningful modification dates.
- [x] Preserve query strings during main-domain redirects while keeping query variants `noindex, follow`.
- [ ] Add and verify the new Google Search Console domain property.
- [ ] Submit the new sitemap.
- [ ] Use Google's site-move/change-of-address workflow after redirects are live.
- [ ] Update Bing Webmaster Tools and any other active indexing services.
- [ ] Update important external links, GitHub README links, profiles, newsletters, and known backlinks.
- [ ] Monitor indexing, crawl errors, redirect behavior, impressions, clicks, and canonical selection during the transition.

## Phase 6: Cloudflare and DNS

For the new zone:

- [x] Create A and AAAA records for `stack127.com` pointing to the existing OVH production target.
- [x] Configure `www.stack127.com` as a permanent redirect to the apex with paths and query strings preserved.
- [x] Configure `labs.stack127.com` as a permanent redirect to `/labs` with query strings preserved.
- [x] Configure `dokploy.stack127.com` DNS.
- [x] Configure `basebuddy.stack127.com` DNS.
- [x] Configure `basebuddy-demo.stack127.com` DNS.
- [x] Match the intended Cloudflare proxy state for every hostname.
- [x] Allow Search, Agent, and Training AI crawler categories and disable the deprecated AI-bot blocking rule.
- [x] Disable Cloudflare robots.txt management so the origin-owned policy is served unchanged.
- [ ] Configure SSL/TLS mode, edge certificates, origin certificates, HSTS timing, and minimum TLS settings.
- [x] Recreate the Cloudflare Access applications and policies for the new Dokploy hostname and deployment API paths.
- [x] Update the Cloudflare Tunnel public hostname and ingress rules while retaining the old hostname for rollback.
- [ ] Review redirects, cache rules, WAF rules, rate limits, Transform Rules, Workers, Pages projects, and origin allowlists for the old domain. Bot controls and managed robots were reviewed and corrected on the new zone.
- [x] Create or update the Cloudflare tokens and zone ID used by CI and local preflight: CI has a narrow `stack127.com` read token, while local administration uses the Account API token `stack127-infrastructure` across all three maintained zones.
- [ ] Test proxied and direct origin expectations over IPv4 and IPv6.

For the old zone:

- [x] Keep `version127.com` active.
- [x] Add path-preserving redirects for the apex and `www`.
- [x] Add the exact BaseBuddy production redirect.
- [x] Add the exact BaseBuddy demo redirect with path and query preservation.
- [x] Point `basebuddycms.com`, `www.basebuddycms.com`, and `demo.basebuddycms.com` directly to their stack127 BaseBuddy destinations, removing the former `version127.com` redirect chain.
- [x] Keep administrative access working until the new Dokploy hostname passes verification.
- [x] Confirm the old Dokploy hostname remains behind Cloudflare Access.

## Phase 7: managed Supabase development and production

The project already has the required managed environments:

| Purpose | Environment file | Managed project ref |
| --- | --- | --- |
| Development | `.env.local` | `phhrfvmncpqqmmgruktx` |
| Production | `.env.database` | `tulgfrqamtcshdtmhvpx` |

Both files contain `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY`. Values are ignored and must never be copied into this document or committed.

Hard rules:

- [x] Use managed development Supabase for development, test fixtures that require a database, migration verification, and non-production registry checks.
- [x] Use managed production Supabase only for explicit production checks and the authorized production migration.
- [x] Never run `supabase start`, `supabase db reset`, or any workflow that starts the local Docker stack.
- [x] Do not require Docker Supabase in tests, CI, documentation, skills, or daily development.
- [x] Keep development and production credentials separate.
- [x] Reconcile all local environment files, GitHub Actions scopes, and Dokploy runtime key names in `stack127_docs/environment-inventory.md`; add matching secret-free schemas and a drift test.
- [ ] Take a production backup or verified recovery point before structural production migrations.

For complete internal cleanup:

- [x] Change the local Supabase project identity from `version127` to `stack127` where it is only a repository identifier.
- [x] Add and apply a forward migration for `public.version127_pages` to become `public.stack127_pages`.
- [x] Keep a temporary read-only, security-invoker `public.version127_pages` compatibility view.
- [x] Update application queries, seeds, preview scripts, publishing scripts, tests, types, policies, grants, indexes, functions, triggers, and documentation references.
- [x] Rename the `Version127Page` TypeScript type.
- [x] Update active provenance values such as `version127_manual_refinement` to stack127 equivalents.
- [x] Preserve already-applied migration files and factual historical provenance for audit integrity.
- [x] Update browser-storage and serialization namespaces with compatibility reads where user state matters.
- [x] Update custom request headers and build/release identifiers.

Already-applied migration files were not renamed or rewritten. Migration `20260820071356_rebrand_page_registry_to_stack127.sql` was dry-run and applied to managed development first, then applied to managed production. Both projects were verified to contain the real `public.stack127_pages` table, the legacy compatibility view, a published `/labs` row, and no registry metadata containing the old brand.

## Phase 8: deployment and Dokploy

Reuse the existing dedicated OVH production VPS unless a separate infrastructure decision is made. The rebrand does not require moving servers.

- [x] Rename the production target ID from `version127-production-ovh` to `stack127-production-ovh`.
- [ ] Rename the optional SSH alias from `version127-prod` to `stack127-prod` while preserving access during transition.
- [x] Change the production repository to `stack127labs/stack127` on `main`.
- [x] Change the configured immutable image path to `ghcr.io/stack127labs/stack127-web`.
- [x] Rename the Dokploy project and application display names to `stack127` while preserving their IDs.
- [x] Attach `stack127.com` and `www.stack127.com` as HTTPS routes while retaining the old domains for rollback.
- [x] Change the dashboard URL to `https://dokploy.stack127.com`.
- [x] Update Cloudflare Access and tunnel configuration while retaining the old dashboard hostname for rollback.
- [x] Verify Dokploy can authenticate to and pull the transferred private GHCR package through the successful stack127 production release.
- [x] Update the GitHub production Environment to the stack127 site, Dokploy URL/application, GHCR owner, and Cloudflare zone; remove the obsolete `VERSION127_*` variables.
- [x] Replace the invalid legacy GitHub production secret with a new `stack127-production-preflight` token restricted to `stack127.com` with only `DNS:Read` and `Zone:Read`.
- [x] Verify the local `.env.deploy` `CLOUDFLARE_API_TOKEN` as an active Account API token, rename it to `stack127-infrastructure`, add `stack127.com` and `basebuddycms.com` to its existing `version127.com` zone scope, and pass local Cloudflare preflight without rotating its value. The earlier `401` came from checking an Account API token against the User API token verification endpoint.
- [x] Set the Dokploy runtime `NEXT_PUBLIC_SITE_URL` to `https://stack127.com` and redeploy so live sitemap and robots output use the canonical hostname.
- [x] Reuse the current Dokploy application ID; no replacement application was created.
- [x] Preserve the release invariant for release `15486b515512c001ade320bf2e2bb9b38a4b92c0`: local `HEAD`, `origin/main`, immutable GHCR image, Dokploy deployment commit, health endpoint SHA, and live production revision match.
- [x] Preserve the removed Hostinger deployment as historical documentation; never reactivate it.

### Deployment namespace changes

Replace active identifiers such as:

- `VERSION127_*` with `STACK127_*`
- `VERSION127_BUILD_SHA` with `STACK127_BUILD_SHA`
- `VERSION127_SITE_URL` with `STACK127_SITE_URL`
- `VERSION127_RELEASE_SHA` with `STACK127_RELEASE_SHA`
- `VERSION127_GITHUB_ORG` with `STACK127_GITHUB_ORG`
- `version127-production` with `stack127-production`
- `__version127_release` with a stack127 release marker
- `x-version127-pathname` and related headers with stack127 equivalents
- `version127-production-web` cache scopes with stack127 equivalents

Update the deployment manifest, preflight, release script, health route, Docker build arguments, GitHub Actions workflow, GitHub Environment variables, GitHub Environment secrets, `.env.deploy`, `.env.deploy.example`, tests, and production documentation together.

## Phase 9: package scripts and internal repository namespaces

- [x] Change the package name from `version127` to `stack127`.
- [x] Rename `scripts/version127/` to `scripts/stack127/`.
- [x] Rename `tests/version127/` to `tests/stack127/`.
- [x] Rename `skills/version127/` to `skills/stack127/`.
- [x] Rename `version127_docs/` to `stack127_docs/`.
- [x] Rename Version127-prefixed skills and their agent metadata.
- [x] Preserve the `.agents` and `.claude` symlink adapters rather than replacing them with copies.
- [ ] Update global Codex/Claude skill links that point into the repository.
- [x] Rename `version127:` package commands to `stack127:`.
- [x] Update the scripts manifest and every page ownership manifest.
- [x] Update generator paths, comments, quality gates, temporary-directory prefixes, state-schema names, and test fixtures.
- [x] Rename `.github/workflows/version127-release-e2e.yml` and its workflow/concurrency names.
- [x] Update AGENTS.md so the brand rule says `stack127`, lowercase.
- [x] Update sitewide docs, content docs, content ideas, templates, generated repository README content, and external-repository instructions.
- [ ] Rename the local and homelab checkout directories to `stack127` only after tooling, Remote Control, scripts, and documentation no longer depend on the old absolute path.
- [ ] Update the homelab Remote Control project path and SSH aliases after the directory rename.

Do not rewrite Git history solely to erase the old brand. Historical commits and already-applied migration filenames may retain it.

## Phase 10: BaseBuddy production and demo

BaseBuddy is an independent source-of-truth project and must be migrated from its own private repository checkout.

- [x] Prepare and push the private website changes from baseline `7a0a9fa8dda235f4be7d2c467ed90bc1c71b9c70`; migration commit `ef48eb9` on `self-host-dev`.
- [x] Prepare and push the public app changes from baseline `2ff50ab454805e498756d1013a1dc2af22acb7fd`; migration commit `5819556` on `main`.
- [x] Standardize both projects on `basebuddy.stack127.com`, `basebuddy-demo.stack127.com`, and `stack127labs/basebuddy`.
- [x] Verify focused branding/domain tests and TypeScript checks in both projects; verify production builds for the private app, website, and public app.
- [x] Prepare and push DNS Tools migration commit `c09aa31`; its typecheck, 57 unit tests, repository boundary test, and production build pass.
- [x] Prepare and push dataset migration commit `d58c616` with stack127 publisher, URLs, and attribution.
- [ ] Resolve or supply the private checkout's intentionally ignored Playwright environment before treating its full 1,324-test suite as a clean gate. Current run: 1,313 passed and 11 environment-only failures.
- [x] Transfer the private website repository to `stack127labs/basebuddy-website` and verify it remains private.
- [x] Transfer the public app repository to `stack127labs/basebuddy` and verify it remains public.
- [x] Update both active migration-checkout remotes and the rebrand-owned GitHub links, packages, release metadata, support links, and documentation.
- [x] Configure and verify the HTTPS route for `basebuddy.stack127.com`.
- [x] Configure and verify the HTTPS route for `basebuddy-demo.stack127.com`.
- [ ] Keep production and demo environment variables, databases, credentials, analytics, and deployment targets isolated.
- [x] Update BaseBuddy canonical URLs, metadata, structured data, allowed hosts, public links, and email references where applicable in the rebrand source commits.
- [x] Update the BaseBuddy deployment provider and GitHub integration after repository transfer. The GitHub App ownership, callback/webhook URLs, repository-scoped installation, provider connection, repository selection, branch, and Dockerfile settings are complete for both applications.
- [x] Verify production and demo independently. Website deployment `4fBYajnnsmK1iKEvrSoQi` and demo deployment `rjrumMjDGUero0OVbNo_l` completed successfully from `ef48eb9`; both services rolled to fresh running tasks, and the website, About page, demo login, robots, and sitemap endpoints return `200`.
- [x] Enable exact path-preserving redirects from both old BaseBuddy hostnames after the new hosts pass verification. `basebuddycms.com`, `www.basebuddycms.com`, and `basebuddy.version127.com` now redirect directly to production; `demo.basebuddycms.com` and `basebuddy-demo.version127.com` redirect directly to demo. All checked paths and query strings are preserved without an intermediate hop.
- [ ] Record BaseBuddy's final release/tag independently from the stack127 website release. The deployed website source commit is recorded as `ef48eb9`; no new release tag was created during this cutover.

### Dokploy GitHub provider recovery

The GitHub App installation callback initially returned an internal server error in Dokploy `v0.29.5`. The server log showed that the callback handler attempted to split a missing OAuth `state` value. The installation was initiated from GitHub, so no `state` reached Dokploy and the provider's installation ID was not updated.

The intended callback result was recovered without changing credentials: the existing provider row was updated in a transaction only when both its exact provider ID and previous installation ID matched. Exactly one row changed. The provider's **Test Connection** action then reported one repository, matching the app's repository-only installation scope. Both BaseBuddy applications were reconnected to `stack127labs/basebuddy-website`, branch `self-host-dev`; the Website uses `Dockerfile.website` and Demo uses `Dockerfile.demo`.

No OAuth code, installation credential, application secret, or provider secret is recorded in this document.

Do not copy BaseBuddy source into the private stack127 repository and do not create a runtime/build dependency between them.

## Phase 11: analytics, email, search tools, and external integrations

### Email

- [x] Replace every active public `version127@proton.me` reference with `stack127@proton.me`.
- [ ] Update GitHub organization/repository contact information.
- [ ] Update Dokploy account contact information where appropriate.
- [ ] Update Cloudflare, analytics, newsletter, social, registrar, and monitoring contacts where appropriate.
- [ ] Keep the old Proton address available as a forwarding or monitored fallback if the user controls it.

The approved public address is Proton's `stack127@proton.me`; this plan does not require configuring custom-domain MX, SPF, DKIM, or DMARC for `stack127.com`. Newsletter infrastructure may require separate sending-domain authentication later.

### Analytics and monitoring

- [ ] Update Umami's tracked domain list from version127 hosts to stack127 hosts.
- [ ] Decide whether to reuse the existing Umami website ID for continuity or create a new property.
- [ ] Annotate the cutover date so traffic continuity is understandable.
- [ ] Prevent duplicate page views during the dual-domain period.
- [ ] Update uptime monitors, status checks, health probes, alert destinations, dashboards, and incident links.
- [ ] Update any Sentry, PostHog, webhook, cron, API allowlist, OAuth callback, or third-party integration URLs if present.

### Search and verification

- [ ] Add the new Google Search Console property.
- [ ] Update verification tokens only where the provider requires it.
- [ ] Submit the new sitemap after canonical cutover.
- [ ] Configure the site move after redirects are verified.
- [ ] Update Bing and other active webmaster tools.

## Phase 12: social and newsletter profiles

Agents must not create social accounts. The user will provide accounts or grant access when profile work is approved.

For each supplied account:

- [ ] Username `@stack127labs` where available.
- [ ] Display name `stack127`.
- [ ] Website `https://stack127.com`.
- [ ] Consistent approved avatar and banner after logos are supplied.
- [ ] Bio identifies it as the official account for `stack127.com`.
- [ ] GitHub references point to `https://github.com/stack127labs`.
- [ ] Publish a short rename announcement only after user approval.
- [ ] Pin the announcement temporarily where useful.
- [ ] Keep old handles controlled where the platform permits it.
- [ ] Update newsletter publication name, URL, sender identity, reply-to address, and authenticated sending domain if one is used.

## Phase 13: documentation and legal review

- [x] Update the design system, writing style, visual-first rules, repository structure, SEO, Cloudflare, production deployment, homelab, public-repository registry, RDAP, and quality documentation.
- [x] Update page-specific docs and ownership manifests.
- [x] Update the legal site name and contact email in Privacy and Terms.
- [x] Update the copyright notice.
- [ ] Confirm whether any legal entity name remains separate from the public brand.
- [x] Update active third-party attribution or policy URLs that reference the old GitHub organization.
- [x] Preserve factual historical notes where changing the old name would make the record inaccurate.

## Phase 14: cutover sequence

1. Secure the domain, email, GitHub namespace, and user-provided social accounts.
2. Repair GitHub CLI authentication and inventory every repository setting.
3. Create and configure `stack127labs` after approval.
4. Prepare application, documentation, tests, managed-development migrations, and deployment changes on a review branch.
5. Receive and integrate final logo assets before canonical launch unless the user approves a temporary exception. Completed on 2026-08-20 with preserved originals, transparent theme variants, and a regenerated square favicon family.
6. Configure the new Cloudflare zone, stack127 hostnames, BaseBuddy hostnames, and protected Dokploy hostname without removing the old hosts.
7. Transfer repositories and verify visibility, permissions, Actions, packages, and remotes.
8. Deploy the stack127 application with both old and new public domains attached.
9. Verify all stack127 and BaseBuddy production/demo surfaces.
10. Make `stack127.com` and the new BaseBuddy hosts canonical.
11. Enable exact old-to-new redirects.
12. Submit the search-engine move and update analytics, email, external profiles, and supplied social accounts.
13. Complete the coordinated database table/internal-namespace cleanup.
14. Monitor and retain defensive control of the old identity.

## Phase 15: verification gates

### Repository and GitHub

- [x] `stack127labs/stack127` is private.
- [x] `stack127labs/basebuddy-website` is private.
- [x] `stack127labs/basebuddy`, `stack127labs/dns-tools`, and `stack127labs/stack127-datasets` are public.
- [ ] Every repository has the correct default branch, permissions, rules, secrets, variables, environments, webhooks, and GitHub Apps.
- [ ] Local and homelab remotes resolve to the intended repository.
- [x] GHCR image ownership and Dokploy pull access work for the private stack127 production image.

### Application and SEO

- [x] Typecheck, 375 unit tests, static policy, 340-case browser SEO suite, managed-production SEO registry check, and production build pass.
- [x] Every published route works on `stack127.com` in the release verification suite and the live apex, health, sitemap, and robots surfaces were independently checked.
- [x] Canonicals, sitemap, robots, Open Graph, Twitter metadata, and non-logo JSON-LD point to stack127 in the verified build; live sitemap and origin-owned robots output were also verified after the runtime environment correction.
- [ ] No old-domain page remains an indexable duplicate.
- [ ] No unintended public `version127` text remains in server-rendered HTML, response messages, image alt text, or assets.
- [x] Existing route slugs and query behavior remain unchanged in application tests.

### Infrastructure and deployment

- [x] Cloudflare A and AAAA records match the OVH target.
- [x] SSL works for the apex, `www`, Labs, Dokploy, BaseBuddy production, and BaseBuddy demo hostnames.
- [x] Cloudflare Access protects the new Dokploy hostname.
- [x] The old Dokploy hostname remains protected and does not provide an unprotected bypass.
- [x] GitHub Actions builds the immutable stack127 GHCR image.
- [x] Dokploy deploys the expected image.
- [x] The live health endpoint reports the exact expected commit SHA `15486b515512c001ade320bf2e2bb9b38a4b92c0`.
- [x] `HEAD = origin/main = GHCR image SHA = Dokploy revision = live revision` for release `15486b515512c001ade320bf2e2bb9b38a4b92c0`.

### Managed Supabase

- [x] All database work ran against the managed development project first.
- [x] No local Supabase Docker containers were started or required.
- [x] Managed development migrations and application checks pass.
- [ ] Production has a verified recovery point before structural migration.
- [x] The authorized production migration was applied after the managed-development verification.
- [x] Publication registry, sitemap, and all published routes remain correct in local production-build verification.

### Redirects and external services

- [x] Old main-site URLs redirect to the exact new paths with query strings preserved.
- [x] The old BaseBuddy production redirect rule points to the exact new production paths with query strings preserved.
- [x] Old BaseBuddy demo URLs redirect to the exact new demo paths with query strings preserved.
- [x] Legacy BaseBuddy main and demo domains redirect in one hop to the exact new paths with query strings preserved, including the older `basebuddycms.com` hosts.
- [x] The main-site and BaseBuddy redirect families were checked without loops, chains, mixed-content failures, or unexpected homepage fallbacks.
- [ ] Umami receives stack127 traffic without double counting.
- [ ] `stack127@proton.me` is present everywhere intended and receives test mail.
- [ ] Search Console accepts the new property and sitemap.
- [ ] User-provided social and newsletter profiles show the correct display name, handle, bio, website, and approved visuals.

## Phase 16: rollback and retention

Before cutover, record:

- [ ] Last known-good website commit and immutable image.
- [ ] Current Dokploy application configuration and application ID.
- [ ] Current Cloudflare DNS, redirects, tunnel, Access, and security configuration.
- [ ] Current GitHub repository ownership, permissions, variables, secrets, packages, and webhooks.
- [ ] Managed development and production database migration state.
- [ ] Production database recovery point.
- [ ] Current analytics website ID and domain configuration.

If verification fails:

1. Stop the cutover before adding redirects or changing search-engine settings.
2. Restore the last known-good immutable image and domain attachment.
3. Restore the previous DNS or Cloudflare rule only for the exact affected hostname.
4. Restore repository integration or package access without deleting the new organization.
5. Roll back database behavior using a prepared forward-compatible recovery migration; do not edit applied history.
6. Re-run health, route, canonical, redirect, database, and analytics checks.

Retain after success:

- `version127.com` and its redirect zone.
- Old BaseBuddy hostname redirects.
- The controlled `version127` GitHub organization or namespace pointer.
- Old social handles where available.
- The old contact address as a monitored fallback where possible.
- Historical Git commits, releases, migration files, and factual provenance.

## Completion definition

The rebrand is complete only when:

- stack127 is the visible identity across the main site, BaseBuddy surfaces, GitHub, supplied social accounts, newsletter, metadata, email, documentation, and deployment tooling;
- all intended repositories live under `stack127labs` with correct visibility;
- `stack127.com`, `basebuddy.stack127.com`, and `basebuddy-demo.stack127.com` are canonical and healthy;
- managed development and production Supabase remain correct without any local Docker Supabase dependency;
- old public URLs redirect to their exact replacements;
- the production release remains immutable and revision-verifiable;
- no unintended active public or operational dependency still relies on the version127 identity;
- the old identity remains controlled for redirects, recovery, and impersonation prevention.
