---
name: stack127-self-host-enrichment
description: Research and review stack127 self-host app candidates in claimed batches, including open, source-available, and closed-source software, and publish only complete records with source links.
---

# Stack127 self-host enrichment

Work in `/home/teja/projects/stack127`. Production is canonical; refresh development from production before a long run.

Scripts move data. Codex makes editorial and factual decisions. Never generate summaries, categories, self-hosting status, surfaces, or resource facts from keywords.

## Run

1. Read `content_docs/self-host-apps/data-workflow.md`, `content-rules.md`, and `schema.md`.
   Read `stack127_docs/writing-style.md` for app summaries and other public wording.
2. Claim up to 100 candidates:
   `npm run self-host-apps:select-candidate-batch -- --limit 100 --out <batch.json>`
3. For GitHub candidates, collect API evidence:
   `npm run self-host-apps:collect-github-evidence -- --file <batch.json>`
4. Research every candidate from official source code, website, docs, release, package, and container pages. Treat directory copy as a lead only.
5. Write reviewed decisions using [review-format.md](references/review-format.md).
6. Dry-run, then apply:
   `npm run self-host-apps:apply-candidate-review -- --file <reviewed.json> --dry-run`
   `npm run self-host-apps:apply-candidate-review -- --file <reviewed.json>`
7. Run QA, summary, link, icon, typecheck, and build checks.
8. Repeat until no queued or review candidates remain. Release an abandoned claim with `self-host-apps:release-candidate-batch`.

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
