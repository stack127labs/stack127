# Production deployment

## Target

The only production target is the OVH Dokploy application in `scripts/stack127/deployment/targets.json`.

- Site: `https://stack127.com`
- Dokploy: `https://dokploy.stack127.com`
- Repository: `stack127labs/stack127`
- Branch: `main`

The old Hostinger application is not a deployment or rollback target.

## Release

Code reaches `main` through a merged pull request. Docs-only changes may be pushed to `main` directly, because they don't deploy. Any push to `main` that affects production, including a merge, starts `.github/workflows/stack127-release-e2e.yml`.

Pull requests run `.github/workflows/stack127-ci.yml` first: the core tests and one full build with the strict static check. That's where the build is checked before release. Don't build on the homelab.

The workflow:

1. Confirms the requested commit is the current `origin/main` commit.
2. Runs the core release-safety tests.
3. Applies Supabase migrations only when migration files changed.
4. Runs the OVH and Cloudflare preflight, including the strict static source check. CI uses `--static-source-only` because the image has not been built yet.
5. Builds and pushes one immutable GHCR image. `npm run build` runs the strict static manifest check through `postbuild`. Dynamic public pages, timed revalidation, and server query reads fail the release. API routes, `/vitals`, and `/publication-not-found` are allowed to be dynamic. Prerendering reads the production database environment through a BuildKit secret mount. Environment files are removed from standalone output.
6. Deploys that image through the Dokploy API.
7. Confirms the live health endpoint reports the exact commit.
8. Confirms the homepage, `robots.txt`, and `sitemap.xml` return valid responses.
9. Purges public Cloudflare cache tags and warms primary routes. The `cache-worker` Supabase Edge Function handles database edits between releases. See `cloudflare.md`. When the function, shared cache scripts, cache tags, or platform-fee section mapping change, the workflow deploys it after the app.

Normal releases should take about three to five minutes with warm GitHub, GHCR, and Dokploy caches. Provider queues and image transfers can take longer.

Pushes that change only documentation, skills, records, or tests do not deploy. For a deliberate release, run the manual workflow with the exact current main SHA.

## Handoff

Use the workspace T3 assigned. Do not create a local release branch or switch branches. Agents already in worktrees work there without adding another branch. Preserve branches attached to other agents' active worktrees.

When the user says to push to prod, the coordinator:

1. Brings the worktree branch up to date with `origin/main`.
2. Pushes the branch and opens a pull request against `main`.
3. Waits for PR CI. On failure, fixes the branch and pushes again. Code fixes get a Sol review.
4. Merges with a merge commit (`gh pr merge <number> --merge`). The merge starts the release.
5. After deploy, applies the release's production data steps and checks the changed pages.

PR CI doesn't run migrations. Apply and check them on the development database before the pull request. The release workflow applies them to production.

Follow `skills/stack127/stack127-release-e2e/SKILL.md`.

After the static-page app, directory trigger migration, and cache worker are live, the coordinator can apply seven-day HTML/RSC edge TTLs:

```bash
node --env-file=.env.database --env-file=.env.deploy scripts/stack127/cache/configure-cloudflare.mjs --long-ttl --apply
```

The command keeps the existing worker health gate and browser revalidation. It also covers the new JSON routes with origin TTLs. See [caching.md](caching.md) for the purge contract.

Do not merge a dirty or stale branch. Do not bypass a failed target, DNS, build, or live revision check.

Release is complete only when:

```text
merge commit = origin/main = deployed image SHA = live health SHA
```

See `stack127_docs/environment-inventory.md` for deployment credentials and their locations. Never print or commit them.
