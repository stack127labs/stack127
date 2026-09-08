# cli-apps catalog standard

The reviewed catalog should work for someone who knows the job but not the app name. Raw package indexes do not meet that bar. Every published record needs an official project or vendor link, a managed icon with source provenance, an original stack127 summary, a reviewed type, one to three categories, platform support, an install method, a source model, a pricing model, and a verification date.

## Coverage floor

The repository test requires at least 200 reviewed apps and at least eight apps in every public category. The August 29, 2026 batch contains 308 apps. This is a floor, not a target that blocks better additions.

The category mix covers development, DevOps and cloud, files and archives, text and documents, networking, security, monitoring, databases, media, productivity, communication, games, terminals and shells, and AI agents. A large development category does not excuse an empty mail, database, or media category.

## What we benchmark

Discovery combines broad lists with focused catalogs. The current comparison set includes [Terminal Trove](https://terminaltrove.com/list/), [CLI Directory](https://www.cli.directory/), [awesome-cli-apps](https://github.com/agarrharr/awesome-cli-apps), [awesome-modern-cli](https://github.com/thegdsks/awesome-modern-cli), and the source set recorded in `scripts/cli-apps/batches/coverage.md`.

Those sources help us find omissions. They do not supply public descriptions. Project facts come from official repositories and vendor documentation, and stack127 writes each summary.

## Maintenance

Run `verify-curated-links.mjs` before rebuilding a large batch. It checks every official URL in the repo-owned expansion and fails on broken links after a retry. Assemble evidence with `build-curated-batch.mjs`, then review every record against primary sources. The builder outputs `needs_review` records without verification dates. A repository push date, a present URL, and a successful link check do not establish factual review. Cache icons with `cache-icons.mjs`, explicitly approve reviewed records and their review dates, run `publish-apps.mjs --dry-run`, publish to the intended database, and refresh the coverage report.

The catalog keeps unknown values visible. A missing language, license, release, or star count stays unknown instead of borrowing a guess from a package mirror.

Verify that an installation command installs this exact project, not a dependency or a similarly named program. The partial correction workflow can remove unsupported `install_methods` with expected-value guards and a source URL. It cannot add new methods; additions still require the reviewed publication workflow. Removing an unverified claim does not establish that no third-party package exists.
