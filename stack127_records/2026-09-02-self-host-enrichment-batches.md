# Self-host app enrichment batches

## What changed

On 2 September 2026, the self-host app pipeline reviewed three evidence-backed batches:

- AList: published after checking its official repository and install material.
- TrueNAS SCALE: 29 catalog entries published after checking the official catalog records.
- GitHub topic candidates: 7 apps published, 1 duplicate linked to OpenClaw, and 13 repositories rejected because they were libraries, desktop clients, tutorials, or other non-server projects.
- GitHub topic and AI candidates: 16 apps published and 34 repositories rejected for the same reasons.

All published records have a cached local icon, controlled categories, source links, install rows, and technical fact status. Missing publisher RAM requirements receive a low-confidence `estimated` planning range in `self_host_app_resource_estimates`; they are not presented as official requirements.

## Production checks

After the batches, production contained:

- 2,148 published self-hostable apps.
- 62 published rows explicitly marked not self-hostable and excluded from the directory.
- 2,405 resource-estimate rows and 2,406 install-option rows.
- 5,840 duplicate candidate rows, 395 published candidates, 94 rejected candidates, 1,304 candidates needing review, and 3,511 queued candidates.

The self-host QA gate reported zero blocking rows. The icon-integrity check passed for all 2,148 published self-hostable records. The remaining QA report items are non-blocking copy, release, and missing-official-fact follow-ups; unknown values remain explicit rather than guessed.

## Operational note

The local GitHub CLI token returned `401 Bad credentials`, so the GitHub refresh job could not be used locally. The reviewed batch used collected public GitHub evidence and exact source-URL matching. The scheduled GitHub Actions refresh remains the normal path and must use its configured `STACK127_GITHUB_TOKEN` or `github.token`.

The candidate queue is not finished. It remains an editorial review queue and must be processed in further source-checked batches before publication.
