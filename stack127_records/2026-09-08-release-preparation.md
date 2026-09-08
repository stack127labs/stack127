# Combined redesign release preparation

The user authorized the combined local redesign, content, data, and migration release. The reviewed tool-content transfer is complete and verified. The replacement production image has not been deployed yet.

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

Local checkpoint `e1b388dc` on `codex/site-redesign-release` preserves the combined work. All 399 merge conflicts are resolved. Manifest arrays retain both branches' ownership entries. Catalog artwork is back in the catalog family. The redesigned cards, workbenches, controls, copy renderer, and shared layout remain, alongside production media management, directory query batching, publication history, and database compatibility.

The merged tree passes all 910 unit tests, the 290-route static check, the production registry check, and the production build. Desktop browser testing exposed older assertions for pre-redesign headings and disclosures, an asynchronous request assertion, the obsolete shortcut 404 expectation, and print table wrapping. The assertions now follow the approved interface contracts while preserving behavioral checks. Print wrapping was corrected. Published storage tools no longer skip their interactive tests just because the test database is production.

The content dry run verified development and production against the private snapshots. It covers 28 content changes, 34 tool versions, and 11 tool metadata or label changes. Six differing hardware metadata records predate the production publication release, so production keeps those newer values and sitemap priorities. Tool updates use the reviewed content and version commands separately. No app tables, publication flags, original publication dates, or repository-sync fields are copied from development.

Durable private recovery copies of the working tree and both database snapshots are also in `/home/teja/.local/state/stack127/releases/2026-09-08/`. The archive SHA-256 matches the temporary copy.

Production content verification passed after the transfer. All 34 tools match the saved development titles, introductions, supporting Markdown, and functional versions. The 28 changed content rows incremented production revision once. All registry fields other than the 11 approved metadata updates and update timestamps match the pre-transfer snapshot. Repository-sync fields, publication flags, original publication dates, and IDs are preserved. Logs and the idempotent verification runner are in the private recovery directory.

The browser gate now uses two isolated workers. The larger route catalog and the newly enabled published-tool checks still run in full, for both desktop and mobile. Development-only labs retain their production 404 checks rather than being treated as public pages.

Still required: finish all quality and browser checks; reconcile remaining upstream/local differences; create and verify sufficient production recovery backups; prepare guarded selective content and metadata updates; validate production assets and runtime configuration; commit and integrate Git history safely; deploy through the canonical workflow; verify exact SHA, data hashes, routes, redirects, and live behavior. No release completion claim is justified yet.
