# Combined redesign release preparation

The user authorized the combined local redesign, content, data, and migration release. Production has not been changed by this release preparation yet.

## Baselines and recovery

- Local HEAD began at `74d3dc8f`, eleven commits behind verified remote main `8877b785d154baf288c975aa8c462544e4fd55ac`.
- Live deployment health reported the same remote SHA.
- The working-tree archive is `/tmp/stack127-release-backup-breOuEtu/worktree.tar.gz`, with 10,888 archive entries. It excludes dependencies, Git internals, environment files, and test reports. It is not a full database backup.
- Private development and production page/tool snapshots are `dev-tool-content.json` and `prod-tool-content.json` in that directory, each containing 288 registry rows and 34 tool rows.
- The refreshed GitHub CLI login works. The older managed `.env.repos` token still fails and must not override the working login.
- GitHub production environment has the Dokploy API key, GHCR pull token, Cloudflare token, and Access service-token secret names. Secret values were not retrieved.

## Database transfer boundary

Development has only six self-host records versus 5,257 production rows. Never mirror development over production. Production directory fixes must survive the release. Tool differences include 34 versions, 28 supporting-content bodies, 25 introductions, and one title. No repository-sync fields differ. Fourteen page metadata records differ. Migration history has no development-only migrations; production additionally records hardware publication `20260905185000`.

## Reconciliation performed

- Restored missing upstream migration and media-management files. The shortcut expansion migration was checked by SHA-256 against upstream after restoration.
- Reconciled CLI icon caching and publication with managed storage, preserving the local radius and summary validation. Mechanically changed only 308 icon URLs in the reviewed CLI batch.
- Restored upstream media and publication tests, source-only changes, and historical release records missing locally.
- Reconciled 192 shortcut publication states and six hardware states with existing production publication. Preserved local manifest additions.
- Restored the upstream lightweight self-host index and page-scoped detail fetch, adapting the redesigned page and card helpers rather than reverting their design.
- Affiliate reviews remain explicit. Unconfirmed reviews cannot emit an ASIN or affiliate link. No unfinished review was relabeled complete.

## Verification and pending work

The first normal-permission run passed all 901 unit tests and static policy, then exposed stale publication manifests at the production registry gate. The registry check passed after state reconciliation. Restoring additional upstream tests exposed missing manifest ownership and an older full-directory query implementation; those were corrected. A new full quality run is in progress, logged to `/tmp/stack127-release-backup-breOuEtu/quality-final.log`.

Still required: finish all quality and browser checks; reconcile remaining upstream/local differences; create and verify sufficient production recovery backups; prepare guarded selective content and metadata updates; validate production assets and runtime configuration; commit and integrate Git history safely; deploy through the canonical workflow; verify exact SHA, data hashes, routes, redirects, and live behavior. No release completion claim is justified yet.
