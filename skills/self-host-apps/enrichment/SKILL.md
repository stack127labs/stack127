---
name: stack127-self-host-enrichment
description: Research and review stack127 self-host app candidates in claimed batches, including open, source-available, and closed-source software, and publish only complete records with source links.
---

# Stack127 self-host enrichment

Work in the assigned checkout. Production is canonical; refresh development from production before a long run. The commands below explicitly target development. For authorized production work on homelab, replace `--environment development` with `--environment production --confirm stack127-production`; `NODE_ENV=production` no longer chooses production for these editorial commands.

Scripts move data. Codex makes editorial and factual decisions. Never generate summaries, categories, self-hosting status, surfaces, or resource facts from keywords.

## Run

1. Read `content_docs/self-host-apps/data-workflow.md`, `content-rules.md`, and `schema.md`.
   Read `stack127_docs/writing-style.md` for app summaries and other public wording.
2. Claim up to 100 candidates:
   `npm run self-host-apps:select-candidate-batch -- --environment development --limit 100 --out <batch.json>`
3. For GitHub candidates, collect API evidence:
   `npm run self-host-apps:collect-github-evidence -- --file <batch.json>`
4. Research every candidate from official source code, website, docs, release, package, and container pages. Treat directory copy as a lead only.
5. Write reviewed decisions using [review-format.md](references/review-format.md).
6. Dry-run, then apply:
   `npm run self-host-apps:apply-candidate-review -- --environment development --file <reviewed.json> --dry-run`
   `npm run self-host-apps:apply-candidate-review -- --environment development --file <reviewed.json>`
7. Run the relevant QA, summary, link, icon and typecheck checks. Do not build locally.
8. Repeat until no queued or review candidates remain. Before the review commits, release an abandoned claim with `npm run self-host-apps:release-candidate-batch -- --environment development --file <claimed.json> --to needs_review`. Use the production environment and confirmation for a production claim.

## Decisions

- `publish`: verified self-host app. `source_model` and `self_hosting_status` must be decided.
- `duplicate`: the same app after manual review; preserve its source evidence.
- `reject`: hosted-only, client-only, not a software app, dead identity, or otherwise ineligible.
- `needs_review`: a real blocker remains. State the exact missing fact.

## Accuracy

- Follow the summary field contract in `content_docs/self-host-apps/content-rules.md`.
- Keep `open_source`, `source_available`, and `closed_source` distinct. A repository without a verified license is not proof of either open model. A closed-source app requires an official self-hosted build, website, and publisher identity rather than a repository.
- Assign one to three controlled categories by purpose.
- Use `null` or `unknown` when official evidence is absent.
- Verify database needs, Docker support, Compose support, and surfaces from official sources.
- Fill RAM and storage for every published app. Use stated publisher requirements when available; otherwise estimate a typical small self-hosted setup from the app's purpose and official project information. Label estimates `Est. RAM` and `Est. Storage`. Keep a source link and short internal basis in the record. Never treat a package memory cap as an app requirement.
- Docker source files remain evidence. Use `self-host-apps:refresh-install-options` to publish a registry destination, Compose link, or verified appliance catalog option.
- A Dockerfile proves a file exists; it does not by itself prove supported production deployment.
- Put the URLs used for a decision in `sources` or `data_source_urls`, and add a `technical_fact_status` entry when a technical source was checked. There is no field-source table.
- Never globally draft or publish apps.

## Finish

Run:

```bash
npm run self-host-apps:qa-gate
npm run self-host-apps:audit-summaries
npm run self-host-apps:icon-integrity
npm run typecheck
```

Don't build locally. If the batch changes code, the pull request CI runs the build.

Report claimed, published, duplicate, rejected, needs-review, and failed counts.

Published record changes move the affected directory dates and queue cache refreshes. Identical imports keep dates alone. App license-count changes also move the software license directory date. Use the page touch command for meaningful code facts outside the database triggers. See `stack127_docs/directory-pages.md`.

## Add one app on request

Follow [Add one app on request](../../../stack127_docs/self-host-apps-data.md#add-one-app-on-request) for the full commands.

1. Use `self-host-apps:select-candidate-batch -- --environment development --match <name-or-repository>` to find candidates and app records. Check production IDs too before preparing its review file.
2. Research official sources. Write the reviewed decisions and RAM/storage estimates, with source links and a managed icon. Review possible duplicates yourself.
3. Preview then claim exactly the review file's IDs with `--ids-from <reviewed.json>`; use `--dry-run` for the preview and `--out /tmp/app-claim.json` for the claim. Exact selection accepts `new`, `queued`, `needs_review` and already `enriching`. `new` has not passed dedupe; do not skip duplicate research. Top-N selection remains unchanged.
4. Dry-run and apply the review in development. Dry-run and apply estimates with `--apply-reviewed`. Check the app on the real directory at desktop and mobile width.
5. Refresh only its repository with `--slug <slug>` on `refresh-github`, `refresh-gitlab` or `refresh-codeberg`.
6. After production authorization, repeat previews and applies from homelab with `--environment production --confirm stack127-production`. MacBook uploads to production are very slow. Check the live directory after its cache refresh.

If no candidate exists, use the existing `self-host-apps:upsert -- --environment development --file <app.json>` path, first with `--dry-run`. Supply the complete reviewed app object with `published: true`, not a review wrapper. Apply estimates, then preview/apply `self-host-apps:refresh-install-options -- --slug <slug>` (`--apply` writes). Pass the chosen environment on every command. No new candidate or ad hoc SQL is needed.

Do not use `sync-local-to-prod`: it mirrors whole tables and would push about 5,000 unrelated development differences. Editorial commands default to development regardless of `NODE_ENV`; production previews also require the confirmation. Candidate-review dry runs use a read-only transaction. Estimates require `--apply-reviewed`; never combine it with `--dry-run`.

Recovery: before the review commits, claiming the same IDs again is safe. After the review commits, resume at estimates; do not reclaim or reapply that review. Estimates and repository refreshes can be re-run. Release only abandoned enriching claims; release leaves completed candidates alone.
