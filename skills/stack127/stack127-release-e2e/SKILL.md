---
name: stack127-release-e2e
description: Release stack127 to the OVH Dokploy production target through a GitHub pull request and verify the exact live revision.
---

# stack127 release

Read `AGENTS.md`, `stack127_docs/production-deployment.md`, `stack127_docs/page-publishing.md`, and `scripts/stack127/deployment/targets.json`.

Builds and release checks run on GitHub, not on the homelab. Don't run `npm run build` or `npm run stack127:deploy:preflight` locally for a release.

## Pick the path

| Change | Path |
| --- | --- |
| Only docs, skills, `content_docs`, records, or other `.md` files | Commit and push straight to `main`. Nothing deploys. |
| Anything else, including page content in `content/*.mdx`, a small code fix, or a migration | Pull request, then merge. The merge deploys. |

## Before release

- Confirm the user authorized the release ("push to prod"). That covers the PR, the merge, the deploy, and the production data steps of the reviewed work.
- Confirm the Sol review passed and the worktree is clean.
- Confirm migrations were applied and checked on the development database. PR CI doesn't run migrations.
- For pages going public or changing data, confirm each publish manifest ran cleanly in development through `prepare`, `preview`, and `apply`.
- Review `registry.is_indexable` separately from publication. Thin child pages, filtered views, and public pages still being improved can use `false` while staying published. Reprepare plans made before this field existed.

## Pull request

1. Bring the worktree branch up to date with `origin/main` without switching branches, for example `git merge origin/main`. Resolve conflicts and keep other agents' work.
2. Push the worktree branch and open a pull request against `main` with `gh pr create`. Link it to the thread with `link_pull_request`.
3. Wait for `stack127-ci.yml`, which runs the core tests and the full build with its strict static check. When T3's `watch_pull_request` is available, call it for the PR and end the turn. T3 wakes you when checks finish. Use `gh pr checks <number> --watch` only when the native watch isn't available.
4. If CI fails or the review asks for changes, fix the problem on the same branch and push. CI runs again. Get a Sol review of any code fix.
5. When CI passes, merge with `gh pr merge <number> --merge`. A merge commit keeps the worktree branch able to fast-forward to `main` afterward.

## Release

The merge starts `.github/workflows/stack127-release-e2e.yml`. It runs the core tests, applies changed migrations, builds one image, deploys it through Dokploy, updates the cache worker when needed, purges the cache, and checks the live revision, homepage, robots file, and sitemap.

Watch it with `gh run watch <run-id> --exit-status`. Don't rebuild the image or rerun checks the workflow already ran.

### Cloudflare static frontend

Read the static frontend section of `stack127_docs/cloudflare.md` and check the hosting switches before release. Enable Cloudflare release mode only after the isolated preview passes. Enable the Supabase hosting secret after the production route and content refresh path are ready. Don't report a cutover as done before its release checks pass.

When `vars.STACK127_FRONTEND_HOSTING` is `cloudflare`, the release also:

1. Builds the static export and checks it on the `stack127-frontend-preview` service before the backend changes.
2. Deploys the backend image and confirms its health SHA.
3. Deploys the static frontend. The first release writes the Workers routes and the query `noindex` header rule.
4. Checks `/frontend-release.json` and the `X-Stack127-Frontend-SHA` header, and that a missing path returns 404.

If the frontend fails after the backend is live, run `node scripts/stack127/frontend/deploy.mjs --rollback-to-origin` and set both hosting switches back to legacy. OVH then serves pages again. Ask the user before you roll back, unless the live site is broken.

## Publish pages

Do this after the release workflow passes and the live health SHA matches the merge commit. "Push to prod" already covers it. Don't ask again.

Page content in MDX went live with the merge. The publisher writes the database side: registry, titles, search metadata, cards, catalogs, versions, dates, and publication.

1. From a clean checkout of the exact merge commit, which must be the current `origin/main`, run the publisher's `prepare` for each manifest with `--environment production` and a new `--out` file. It reads the current production rows into the plan and records the source commit.
2. Run `preview` with `--environment production`. Read the result and confirm only the intended pages change.
3. Run `dispatch` with `--environment production`, `--confirm stack127-production`, and the full current `origin/main` SHA as `--release-sha`.
4. Watch `.github/workflows/stack127-publish-pages.yml` until it finishes. It waits up to 10 minutes for the live SHA, joins the production concurrency group, applies the plan in one transaction, checks the public pages and sitemap, and records the result on the GitHub deployment. In Cloudflare mode it also rebuilds and deploys the static frontend between the commit and the public check, which adds several minutes.
5. If it reports that the batch committed but the public check failed, the data is saved. Run `verify` with the same plan and `--release-sha`. `apply` is safe to repeat.
6. If `main` moves before the workflow runs, it refuses the stale SHA. Dispatch again with the new `origin/main` SHA once that release is live.
7. Keep each plan file until the pages are checked. It holds the before values `restore` needs.

Use the single-purpose tool-page commands in production only for a small fix to one live page.

## After deploy

- Check the changed pages on `https://stack127.com` at desktop and mobile width. For a tool, run one correct and one invalid example. Confirm unpublished pages still return 404.
- For published noindex pages, confirm their own canonical, a noindex robots tag, no JSON-LD, and absence from the sitemap. The publisher verifies these too.
- Stop on a real build, target, DNS, credential, or live-site failure.

## Complete

Report the PR, the merge commit, the workflow result, the live SHA, the page publication result, the public smoke result, and the elapsed time. Don't call the release complete unless `origin/main`, the deployed image, and the live health SHA all match the merge commit. In Cloudflare mode, `/frontend-release.json` must match it too.

Never deploy to the removed Hostinger target, expose secrets, bypass Cloudflare Access, automate dashboard credentials, or change DNS to hide a failed deployment.

For meaningful code directory facts or directory MDX content changes, include `touch_reason` in the reviewed directory publication manifest. Skip it for typo fixes. Title, search metadata, card, and covered database record changes move dates automatically. Tool card edits leave tool dates alone; shipped behavior changes require the next `tool_version`. Tools have no content-only date move yet. See `stack127_docs/page-publishing.md` and `stack127_docs/tool-pages.md`.
