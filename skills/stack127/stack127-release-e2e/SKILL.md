---
name: stack127-release-e2e
description: Release stack127 to the OVH Dokploy production target through a GitHub pull request and verify the exact live revision.
---

# stack127 release

Read `AGENTS.md`, `stack127_docs/production-deployment.md`, and `scripts/stack127/deployment/targets.json`.

Builds and release checks run on GitHub, not on the homelab. Don't run `npm run build` or `npm run stack127:deploy:preflight` locally for a release.

## Pick the path

| Change | Path |
| --- | --- |
| Only docs, skills, `content_docs`, records, or other `.md` files | Commit and push straight to `main`. Nothing deploys. |
| Anything else, including a small code fix or a migration | Pull request, then merge. The merge deploys. |

## Before release

- Confirm the user authorized the release ("push to prod"). That covers the PR, the merge, the deploy, and the production data steps of the reviewed work.
- Confirm the Sol review passed and the worktree is clean.
- Confirm migrations were applied and checked on the development database. PR CI doesn't run migrations.

## Pull request

1. Bring the worktree branch up to date with `origin/main` without switching branches, for example `git merge origin/main`. Resolve conflicts and keep other agents' work.
2. Push the worktree branch and open a pull request against `main` with `gh pr create`. Link it to the thread with `link_pull_request`.
3. Wait for `stack127-ci.yml`, which runs the core tests and the full build with its strict static check. Use `gh pr checks <number> --watch`.
4. If CI fails or the review asks for changes, fix the problem on the same branch and push. CI runs again. Get a Sol review of any code fix.
5. When CI passes, merge with `gh pr merge <number> --merge`. A merge commit keeps the worktree branch able to fast-forward to `main` afterward.

## Release

The merge starts `.github/workflows/stack127-release-e2e.yml`. It runs the core tests, applies changed migrations, builds one image, deploys it through Dokploy, updates the cache worker when needed, purges the cache, and checks the live revision, homepage, robots file, and sitemap.

Watch it with `gh run watch <run-id> --exit-status`. Don't rebuild the image or rerun checks the workflow already ran.

## After deploy

- Do the production data steps of the release, such as registry rows and publication, with the reviewed commands.
- Check the changed pages on `https://stack127.com`, and confirm unpublished pages still return 404.
- Stop on a real build, target, DNS, credential, or live-site failure.

## Complete

Report the PR, the merge commit, the workflow result, the live SHA, the public smoke result, and the elapsed time. Don't call the release complete unless `origin/main`, the deployed image, and the live health SHA all match the merge commit.

Never deploy to the removed Hostinger target, expose secrets, bypass Cloudflare Access, automate dashboard credentials, or change DNS to hide a failed deployment.
