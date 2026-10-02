# stack127 environment and credential inventory

This is the secret-free index of every active stack127 environment surface. It records names, owners, and consumers only.

Never add credential values, token fragments, database hosts, project references, or passwords to this doc.

Last reconciled: 28 September 2026.

## Rules

- Real local env files are ignored by Git and must be mode `0600`.
- Each real file has a tracked, secret-free `*.example` schema.
- Development and production use separate managed Supabase projects. stack127 doesn't start or depend on a local Docker Supabase stack.
- GitHub Actions secrets can be scoped to the repository or to the protected `production` environment. Check both scopes when rotating.
- Dokploy runtime variables belong to the app that uses them. Don't copy BaseBuddy values into the stack127 app, or the other way round.
- Don't rotate working credentials just because a name or domain changes. Rotate only for expiry, a scope fix, a compromise, or an explicit policy.
- Keep recovery credentials in the password manager. Local ignored files are a working copy, not the only recovery copy.

## Local files

| Real file | Tracked schema | Purpose |
| --- | --- | --- |
| `.env.local` | `.env.local.example` | Managed development Supabase, used by local development and development database checks. |
| `.env.database` | `.env.database.example` | Managed production Supabase, used only for explicit production data and publication checks. |
| `.env.deploy` | `.env.deploy.example` | OVH production identity, Cloudflare, Dokploy administration, registrar, and search console administration. |
| `.env.analytics` | `.env.analytics.example` | Self-hosted Umami connection and admin login. |
| `.env.homelab` | `.env.homelab.example` | Homelab host identity and local administration. |
| `.env.repos` | `.env.repos.example` | Local GitHub CLI and stack127 repo automation. |
| `.env.affiliate` | `.env.affiliate.example` | Amazon Associates settings and future Creators API credentials. |
| `.env.search` | `.env.search.example` | Homelab agent access to the stack127 Bing Webmaster, Search Console, and Google Analytics properties. |

The first six populated files were verified as mode `0600` on 20 August 2026. `.env.affiliate` was verified as mode `0600` on 4 September 2026.

### Managed Supabase

`.env.local` and `.env.database` use the same keys, but their values must point to different managed projects:

```text
DATABASE_URL
DATABASE_POOLER_URL
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
```

| Key | Use |
| --- | --- |
| `DATABASE_URL` | Required by database-backed scripts. |
| `DATABASE_POOLER_URL` | Optional. Takes priority in the app runtime. Use the Supabase session pooler string on IPv4-only hosts. |
| `SUPABASE_URL` and `SUPABASE_SECRET_KEY` | Also required by media upload scripts. |
| `SUPABASE_PUBLISHABLE_KEY` | Safe for the public reads the existing RLS policies allow. |

During local development, published page and tool content reads prefer the Supabase Data API. On connection errors, they fall back between the Data API and Postgres.

### Supabase Management API tokens

The homelab uses separate `SUPABASE_ACCESS_TOKEN` values for development and production:

| File | Token | Scope |
| --- | --- | --- |
| `.env.local` | `stack127-dev-homelab` | Managed development project |
| `.env.deploy` | `stack127-prod-homelab` | Managed production project |

Both tokens allow project read and write access and expire on 29 September 2027. They exclude organization settings, membership changes, organization webhooks, and account-wide SQL snippets.

These are admin Management API credentials. They're separate from the project's publishable and secret API keys.

Load the file for the project you mean when you run the Supabase CLI or management scripts. Scripts must load `.env.deploy` explicitly. Keep both tokens out of browser bundles and public output.

### Deployment and infrastructure

`.env.deploy` contains:

```text
STACK127_PRODUCTION_TARGET
STACK127_PRODUCTION_PROVIDER
STACK127_PRODUCTION_HOST
STACK127_PRODUCTION_IPV6
STACK127_PRODUCTION_SSH_USER
STACK127_PRODUCTION_DOKPLOY_URL
STACK127_PRODUCTION_DOKPLOY_APP_ID
STACK127_PRODUCTION_DOKPLOY_APP_NAME
STACK127_PRODUCTION_REPOSITORY
STACK127_PRODUCTION_BRANCH
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_ZONE_ID
DOKPLOY_LOCAL_URL
OVH_DOKPLOY_EMAIL
OVH_DOKPLOY_PASSWORD
OVH_VPS_Password
HOSTINGER_Token
Google_Search_Console
SUPABASE_ACCESS_TOKEN
```

The `STACK127_PRODUCTION_*` values are checked against `scripts/stack127/deployment/targets.json`.

The three names with unusual casing stay as they are because they already exist. Don't quietly rename them during a credential rotation.

`OVH_VPS_Password` is for recovery only. The release workflow doesn't use it. It uses the configured SSH identity and the Dokploy API.

### Analytics

`.env.analytics` contains:

```text
GOOGLE_ANALYTICS_ID
UMAMI_URL
UMAMI_WEBSITE_ID
UMAMI_USERNAME
UMAMI_PASSWORD
```

The public site runtime uses `GOOGLE_ANALYTICS_ID` for the optional Google Analytics tag, which loads only after consent. For self-hosted analytics, it needs only the Umami URL and website ID.

The Google measurement ID is public config, not a credential. The Umami username and password are admin credentials. Never pass them to the app.

The production workflow also passes `GOOGLE_ANALYTICS_ID`, `UMAMI_URL`, and `UMAMI_WEBSITE_ID` to the Docker builder as public config. Static pages need these values when their HTML is built. Repository variables can override the workflow defaults. Admin analytics credentials stay out of builds.

On 20 August 2026, the existing stack127 and BaseBuddy website records were renamed in place to track `stack127.com` and `basebuddy.stack127.com`. Their website IDs were kept. That keeps analytics history continuous, and no duplicate property can double-count the redirected domains.

### Search and analytics API access

`.env.search` is an ignored, owner-only homelab file. It records the `stack127@proton.me` identity and only these targets:

| Service | Target |
| --- | --- |
| Bing | `https://stack127.com/` |
| Search Console | `sc-domain:stack127.com` |
| Google Analytics | Account `408759499` / property `555030542` |

The Bing API key was generated for this account and verified against the listed site on 28 September 2026.

The Google Cloud OAuth client is set up under the same account. Its app is in production for personal use. The account-owned offline refresh token was stored on the homelab on 28 September 2026.

The app is unverified, so Google shows a warning on new grants. The owner explicitly approved this grant. Google verification isn't required for this personal-use integration with fewer than 100 users.

Bing keys belong to the user, not one site. Google OAuth scopes apply to the account, not one property. So agents must target only the listed properties, and must not list or change other sites.

The intended Google scopes are Search Console read/write and Analytics read-only.

Load this file explicitly for agent tasks. Never pass its secrets to the public site runtime. Check the exact property access with:

```bash
node --env-file=.env.search scripts/stack127/search-services/check.mjs
```

### Homelab

`.env.homelab` contains:

```text
teja_homelab_sudo
teja_homelab_IPv4
teja_homelab_IPv6
```

These names stay for compatibility with the existing homelab workflow. The sudo credential matters for recovery, so it also belongs in the password manager.

### GitHub repository automation

`.env.repos` contains:

```text
GH_TOKEN
GITHUB_TOKEN
STACK127_GITHUB_ORG
STACK127_DATASET_REPO
STACK127_GITHUB_TOKEN_NAME
STACK127_GITHUB_TOKEN_EXPIRES_AT
```

`STACK127_GITHUB_ORG` is `stack127labs`.

The two token variables can hold the same fine-grained token. `gh` prefers `GH_TOKEN`, while some scripts and tools use `GITHUB_TOKEN`.

The token must be owned or approved by `stack127labs`. Scope it to the repositories and write operations the automation actually performs.

The two metadata fields record which server-side token the file uses and when it expires, without exposing its value.

On 20 August 2026, the old `version127 repos` token was replaced and revoked. The active token:

| Property | Value |
| --- | --- |
| Name | `stack127 local repo automation` |
| Type | Fine-grained |
| Owner | `stack127labs` |
| Expires | 21 August 2027 |
| Repositories | The five current organization repositories: `stack127`, `basebuddy-website`, `basebuddy`, `dns-tools`, and `stack127-datasets` |
| Read/write | Actions, repository administration, contents, pull requests, and workflow files |
| Read-only | GitHub's required metadata permission |
| Account or organization permissions | None |

Read-only checks confirmed private repository access, repository administration, collaborators, contents, and Actions workflow access.

When you create a new repository, add it to this token before running local automation against it. Browser access and the production release workflow don't depend on this local token.

## GitHub Actions: `stack127labs/stack127`

The protected `production` environment has these secrets:

```text
CF_ACCESS_CLIENT_ID
CF_ACCESS_CLIENT_SECRET
CLOUDFLARE_API_TOKEN
DOKPLOY_API_KEY
GHCR_DOKPLOY_TOKEN
SUPABASE_SECRET_KEY
```

It has these non-secret variables:

```text
CLOUDFLARE_ZONE_ID
GHCR_DOKPLOY_USERNAME
STACK127_DOKPLOY_API_URL
STACK127_DOKPLOY_APPLICATION_ID
STACK127_SITE_URL
```

The repository scope has:

```text
DATABASE_POOLER_URL
DATABASE_URL
```

The release and scheduled discovery workflows also recognize these optional repository secrets:

```text
STACK127_GITHUB_TOKEN
STACK127_GITLAB_TOKEN
STACK127_CODEBERG_TOKEN
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
```

None of these optional repository-level secrets were set at the time of the audit. `SUPABASE_SECRET_KEY` was added to the protected `production` environment on 24 September 2026.

- GitHub discovery falls back to the workflow's automatic `GITHUB_TOKEN`.
- GitLab and Codeberg enrichment can run without provider tokens, at lower anonymous rate limits.
- Supabase API keys are needed only for workflows that upload managed media.
- The release quality gate still uses the repository-level database URL.

GitHub Actions issues `GITHUB_TOKEN` automatically. It isn't a stored secret, so it never needs manual rotation.

## Dokploy runtime

The stack127 app has:

```text
DATABASE_URL
NEXT_PUBLIC_SITE_URL
GOOGLE_ANALYTICS_ID
UMAMI_URL
UMAMI_WEBSITE_ID
```

The BaseBuddy website app has:

```text
NEXT_PUBLIC_BASEBUDDY_DEMO_URL
NEXT_PUBLIC_BASEBUDDY_GITHUB_URL
NEXT_PUBLIC_BASEBUDDY_SITE_URL
NEXT_PUBLIC_UMAMI_SCRIPT_URL
NEXT_PUBLIC_UMAMI_WEBSITE_ID
NODE_ENV
PORT
```

The BaseBuddy demo app has:

```text
BASEBUDDY_AUTH_SECRET
BASEBUDDY_CONTENT_DATABASE_URL
BASEBUDDY_CONTENT_SESSION_POOLER_ROOT_CERTIFICATE_FILE
BASEBUDDY_DEMO_DATABASE_URL
BASEBUDDY_DEMO_DOMAIN
BASEBUDDY_DEMO_LOGIN_ENABLED
BASEBUDDY_DEMO_PROJECT_REF
BASEBUDDY_DEMO_SERVICE_ROLE_KEY
BASEBUDDY_DEMO_SUPABASE_URL
BASEBUDDY_DEMO_USER_EMAIL
BASEBUDDY_DEMO_USER_NAME
BASEBUDDY_DEMO_USER_PASSWORD
BASEBUDDY_SUPABASE_PUBLISHABLE_KEY
BASEBUDDY_SUPABASE_SECRET_KEY
BASEBUDDY_SUPABASE_URL
NEXT_PUBLIC_BASEBUDDY_APP_NAME
NEXT_PUBLIC_BASEBUDDY_DOCS_URL
NEXT_PUBLIC_BASEBUDDY_SUPPORT_URL
NEXT_PUBLIC_SITE_INDEXABLE
NODE_ENV
PORT
```

During the audit, these apps inherited no project-level or environment-level Dokploy variables. So each list above was the complete runtime key list for that app at that time.

## Cloudflare tokens

There are two Cloudflare credentials, on purpose:

1. Local infrastructure administration uses the active Account API token named `stack127-infrastructure`, from `.env.deploy`. It was renamed and expanded in place on 20 August 2026, so no new secret value was created. It covers the `stack127.com`, `version127.com`, and `basebuddycms.com` zones. Its account permissions cover DNS, redirects, Access, Tunnel, cache, WAF, TLS, and related maintenance.
2. GitHub's `production` environment uses a separate token for release preflight and cache purge. It needs Zone Read, DNS Read, and Cache Purge for `stack127.com`. On 24 September 2026, the owner expanded its permissions across three zones, so it now has broader access than the release needs.

Don't replace the CI token with the local admin token. Narrow the CI token when you can. Don't use Cloudflare User API tokens for either job.

## Amazon Associates

`.env.affiliate` stores the Amazon Associates config for stack127. Git ignores it, and it must stay at mode `0600`. The tracked example lists the same keys without values.

| Key | Secret? | Use |
| --- | --- | --- |
| `AMAZON_ASSOCIATES_PRIMARY_MARKETPLACE` | No | Primary Amazon marketplace. |
| `AMAZON_ASSOCIATES_STORE_ID` | No | Associates Store ID for the primary marketplace. |
| `AMAZON_ASSOCIATES_TRACKING_ID` | No | Tracking ID used for stack127 affiliate links. |
| `AMAZON_ASSOCIATES_PARTNER_TAG` | No | Partner tag used by links and API requests. |
| `AMAZON_ONELINK_ENABLED` | No | Whether OneLink is on for the account. |
| `AMAZON_ONELINK_MARKETPLACES` | No | Marketplaces set up for OneLink. |
| `AMAZON_CREATORS_API_CREDENTIAL_ID` | No | Creators API Credential ID. |
| `AMAZON_CREATORS_API_SECRET` | Yes | Creators API secret. |
| `AMAZON_CREATORS_API_VERSION` | No | Creators API credential version. |
| `AMAZON_CREATORS_API_HOST` | No | Optional API host override. |
| `AMAZON_CREATORS_API_REGION` | No | Optional credential region record. |
| `AMAZON_CREATORS_API_MARKETPLACE` | No | Optional marketplace override. |

Affiliate scripts must load `.env.affiliate` explicitly. Next.js doesn't load this split file on its own. Never expose the Creators API secret to client code or print the real file.

## Rotation checklist

When a credential changes:

1. Find every row in this doc that has the key name.
2. Update the right local ignored file, GitHub scope, or Dokploy app. Don't spread the value to every surface.
3. Keep the old value until the new credential passes a read-only check.
4. Check that local secret files are still `0600`.
5. For deployment or Cloudflare changes, run `npm run stack127:deploy:preflight`.
6. Run the relevant GitHub workflow and confirm its environment or repository secret lookup works.
7. When the production site changes, check the affected live app and `/api/health?scope=deploy`.
8. Revoke the old credential only after the new one is proven.
9. Update the reconciliation date and any changed key list in this doc.

The tracked example files are schemas, not backups. A full recovery also needs the password manager entries and the secret records kept by each service.

The rebrand's pre-migration production table recovery dump is stored outside the repository at `/Users/ravitejaknts/backups/stack127/2026-08-20/open_projects-before-provenance.dump`. It's mode `0600`. Its checksum is in the rebrand migration document.
