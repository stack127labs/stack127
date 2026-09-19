# Stack127 Environment And Credential Inventory

This is the secret-free index of every active Stack127 environment surface. It
records names, owners, and consumers only. Never add credential values, token
fragments, database hosts, project references, or passwords to this document.

Last reconciled: 5 September 2026.

## Rules

- Real local environment files are ignored by Git and must be mode `0600`.
- Each real file has a tracked, secret-free `*.example` schema.
- Development and production use separate managed Supabase projects. Stack127
  does not start or depend on a local Docker Supabase stack.
- GitHub Actions secrets can be either repository-scoped or attached to the
  protected `production` environment. Check both scopes during rotation.
- Dokploy runtime variables belong to the application that consumes them. Do
  not copy BaseBuddy values into the Stack127 application or vice versa.
- Working credentials are not rotated just because a name or domain changes.
  Rotate only for expiry, scope correction, compromise, or an explicit policy.
- Keep recovery credentials in the password manager. Local ignored files are a
  working copy, not the only recovery copy.

## Local Files

| Real file | Tracked schema | Purpose |
| --- | --- | --- |
| `.env.local` | `.env.local.example` | Managed development Supabase used by local development and development database checks. |
| `.env.database` | `.env.database.example` | Managed production Supabase used only for explicit production data and publication checks. |
| `.env.deploy` | `.env.deploy.example` | OVH production identity, Cloudflare, Dokploy administration, registrar, and search-console administration. |
| `.env.analytics` | `.env.analytics.example` | Self-hosted Umami connection and administrative login. |
| `.env.homelab` | `.env.homelab.example` | Homelab host identity and local administration. |
| `.env.repos` | `.env.repos.example` | Local GitHub CLI and stack127 repo automation. |
| `.env.affiliate` | `.env.affiliate.example` | Amazon Associates settings and future Creators API credentials. |

The first six populated files were verified as mode `0600` on 20 August 2026.
`.env.affiliate` was verified as mode `0600` on 4 September 2026.

### Managed Supabase

Both `.env.local` and `.env.database` contain the same key schema, but their
values must point to different managed projects:

```text
DATABASE_URL
DATABASE_POOLER_URL
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
```

`DATABASE_URL` is required by database-backed scripts. `DATABASE_POOLER_URL` is
optional and takes priority in the application runtime; use the Supabase
session-pooler string on IPv4-only hosts. Published page and tool-content reads
prefer the Supabase Data API during local development and fall back between the
Data API and Postgres on connection errors. `SUPABASE_URL` and
`SUPABASE_SECRET_KEY` are also required by media upload scripts. The
publishable key is safe for the public reads allowed by existing RLS policies.

### Deployment And Infrastructure

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
```

The `STACK127_PRODUCTION_*` values are checked against
`scripts/stack127/deployment/targets.json`. The three historically cased names
are preserved because they already exist; do not silently rename them during a
credential rotation. `OVH_VPS_Password` is recovery-only and is not used by the
release workflow, which uses the configured SSH identity and Dokploy API.

### Analytics

`.env.analytics` contains:

```text
GOOGLE_ANALYTICS_ID
UMAMI_URL
UMAMI_WEBSITE_ID
UMAMI_USERNAME
UMAMI_PASSWORD
```

The public site runtime uses `GOOGLE_ANALYTICS_ID` for the optional, consent-gated
Google Analytics tag and needs only the Umami URL and website ID for self-hosted
analytics. The Google measurement ID is public configuration, not a credential.
The Umami username and password are administrative credentials and must not be
passed to the app.
On 20 August 2026, the existing Stack127 and BaseBuddy website records were
renamed in place to track `stack127.com` and `basebuddy.stack127.com`. Their
website IDs were preserved so analytics history remains continuous and no
duplicate property can double-count the redirected domains.

### Homelab

`.env.homelab` contains:

```text
teja_homelab_sudo
teja_homelab_IPv4
teja_homelab_IPv6
```

These names are retained for compatibility with the existing homelab workflow.
The sudo credential is recovery-sensitive and also belongs in the password
manager.

### GitHub Repository Automation

`.env.repos` contains:

```text
GH_TOKEN
GITHUB_TOKEN
STACK127_GITHUB_ORG
STACK127_DATASET_REPO
STACK127_GITHUB_TOKEN_NAME
STACK127_GITHUB_TOKEN_EXPIRES_AT
```

`STACK127_GITHUB_ORG` is `stack127labs`. The two token variables may carry the
same fine-grained token because `gh` prefers `GH_TOKEN` while some scripts and
tools use `GITHUB_TOKEN`. The token must be owned or approved by `stack127labs`
and must be scoped to the repositories and write operations the automation
actually performs. The two metadata fields record which server-side token the
file uses and when it expires without exposing its value.

On 20 August 2026, the obsolete `version127 repos` token was replaced and
revoked. The active fine-grained token is named `stack127 local repo automation`,
is owned by `stack127labs`, and expires on 21 August 2027. It is restricted to
the five current organization repositories: `stack127`, `basebuddy-website`,
`basebuddy`, `dns-tools`, and `stack127-datasets`. It has read/write access to
Actions, repository administration, contents, pull requests, and workflow files,
plus GitHub's required read-only metadata permission. It has no account or
organization permissions.

Read-only verification confirmed private-repository access, repository
administration, collaborators, contents, and Actions workflow access. When a new
repository is created, add it explicitly to this token before using local
automation against it. Browser access and the production release workflow do
not depend on this local token.

## GitHub Actions: `stack127labs/stack127`

The protected `production` environment contains these secrets:

```text
CF_ACCESS_CLIENT_ID
CF_ACCESS_CLIENT_SECRET
CLOUDFLARE_API_TOKEN
DOKPLOY_API_KEY
GHCR_DOKPLOY_TOKEN
```

It contains these non-secret variables:

```text
CLOUDFLARE_ZONE_ID
GHCR_DOKPLOY_USERNAME
STACK127_DOKPLOY_API_URL
STACK127_DOKPLOY_APPLICATION_ID
STACK127_SITE_URL
```

The repository scope contains:

```text
DATABASE_POOLER_URL
DATABASE_URL
```

The release and scheduled discovery workflows also recognize these optional
repository secrets:

```text
STACK127_GITHUB_TOKEN
STACK127_GITLAB_TOKEN
STACK127_CODEBERG_TOKEN
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
```

They were not configured at the time of the audit. GitHub discovery falls back
to the workflow's automatic `GITHUB_TOKEN`; GitLab and Codeberg enrichment can
run without provider tokens at lower anonymous rate limits. Supabase API keys
are required only for workflows that upload managed media. The release quality
gate still uses the repository-level database URL.

`GITHUB_TOKEN` itself is issued automatically by GitHub Actions and is not a
stored secret that needs manual rotation.

## Dokploy Runtime

The Stack127 application contains:

```text
DATABASE_URL
NEXT_PUBLIC_SITE_URL
GOOGLE_ANALYTICS_ID
UMAMI_URL
UMAMI_WEBSITE_ID
```

The BaseBuddy website application contains:

```text
NEXT_PUBLIC_BASEBUDDY_DEMO_URL
NEXT_PUBLIC_BASEBUDDY_GITHUB_URL
NEXT_PUBLIC_BASEBUDDY_SITE_URL
NEXT_PUBLIC_UMAMI_SCRIPT_URL
NEXT_PUBLIC_UMAMI_WEBSITE_ID
NODE_ENV
PORT
```

The BaseBuddy demo application contains:

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

No project-level or environment-level Dokploy variables were inherited by
these applications during the audit. Each list above is therefore the complete
runtime key list for that application at that time.

## Cloudflare Tokens

There are two intentional Cloudflare credentials:

1. Local infrastructure administration uses the active Account API token named
   `stack127-infrastructure` from `.env.deploy`. It was renamed and expanded in
   place on 20 August 2026, so no new secret value was created. It covers the
   `stack127.com`, `version127.com`, and `basebuddycms.com` zones and the account
   permissions needed for DNS, redirects, Access, Tunnel, cache, WAF, TLS, and
   related maintenance.
2. GitHub's `production` environment uses a separate narrow token for release
   preflight. It needs only Zone Read and DNS Read for `stack127.com`.

Do not replace the narrow CI token with the broad administration token. Do not
use Cloudflare User API tokens for either purpose.

## Amazon Associates

`.env.affiliate` stores the Amazon Associates configuration for stack127. It is
ignored by Git and must stay at mode `0600`. The tracked example lists the same
keys without values.

| Key | Secret? | Use |
| --- | --- | --- |
| `AMAZON_ASSOCIATES_PRIMARY_MARKETPLACE` | No | Primary Amazon marketplace. |
| `AMAZON_ASSOCIATES_STORE_ID` | No | Associates Store ID for the primary marketplace. |
| `AMAZON_ASSOCIATES_TRACKING_ID` | No | Tracking ID used for stack127 affiliate links. |
| `AMAZON_ASSOCIATES_PARTNER_TAG` | No | Partner tag used by links and API requests. |
| `AMAZON_ONELINK_ENABLED` | No | Whether OneLink is enabled for the account. |
| `AMAZON_ONELINK_MARKETPLACES` | No | Marketplaces configured for OneLink. |
| `AMAZON_CREATORS_API_CREDENTIAL_ID` | No | Creators API Credential ID. |
| `AMAZON_CREATORS_API_SECRET` | Yes | Creators API secret. |
| `AMAZON_CREATORS_API_VERSION` | No | Creators API credential version. |
| `AMAZON_CREATORS_API_HOST` | No | Optional API host override. |
| `AMAZON_CREATORS_API_REGION` | No | Optional credential-region record. |
| `AMAZON_CREATORS_API_MARKETPLACE` | No | Optional marketplace override. |

Affiliate scripts must load `.env.affiliate` explicitly. Next.js does not load
this split file automatically. Never expose the Creators API secret to client
code or print the real file.

## Rotation Checklist

When a credential changes:

1. Identify every row in this document that contains the key name.
2. Update the correct local ignored file, GitHub scope, or Dokploy application;
   do not broadcast the value to every surface.
3. Keep the previous value until the new credential passes a read-only check.
4. Verify local secret files remain `0600`.
5. Run `npm run stack127:deploy:preflight` for deployment or Cloudflare changes.
6. Run the relevant GitHub workflow and confirm its environment/repository
   secret lookup succeeds.
7. Verify the affected live application and `/api/health?scope=deploy` when the
   production site changes.
8. Revoke the previous credential only after the replacement is proven.
9. Update the reconciliation date and any changed key list in this document.

The tracked example files are schemas, not backups. A complete recovery process
also needs the password-manager entries and the service-side secret records.
The rebrand's pre-migration production table recovery dump is separately stored
outside the repository at
`/Users/ravitejaknts/backups/stack127/2026-08-20/open_projects-before-provenance.dump`.
It is mode `0600`; its checksum is recorded in the rebrand migration document.
