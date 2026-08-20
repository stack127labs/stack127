---
name: stack127-self-host-enrichment
description: Research and review Stack127 open-project candidates in claimed batches, write direct summaries, verify official facts and links, classify self-hosting, preserve provenance, and publish only complete records. Use for the next pending self-host app candidates or to drain the candidate queue.
---

# Stack127 self-host enrichment

Work in `/Users/ravitejaknts/projects/Stack127`. Production is canonical; refresh local from production before a long run.

Scripts move data. Codex makes editorial and factual decisions. Never generate summaries, categories, self-hosting status, surfaces, or resource facts from keywords.

## Run

1. Read `content_docs/self-host-apps/data-workflow.md`, `content-rules.md`, and `schema.md`.
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

- `publish`: verified open-source or source-available project. `source_model` and `self_hosting_status` must be decided.
- `duplicate`: same project after manual review; preserve its source evidence.
- `reject`: not open source, not a software project, dead identity, or otherwise ineligible.
- `needs_review`: a real blocker remains. State the exact missing fact.

## Accuracy

- Use one direct summary sentence. Do not repeat `open source` or `self-hosted` unless essential to meaning.
- Keep `open_source` and `source_available` distinct. A repository without a project license is neither.
- Assign one to three controlled categories by purpose.
- Use `null` or `unknown` when official evidence is absent.
- RAM, storage, database needs, Docker support, Compose support, and surfaces require direct evidence.
- A Dockerfile proves a file exists; it does not by itself prove supported production deployment.
- Keep field provenance for links, classification, license, icon, mutable source facts, and every known technical fact.
- Never globally draft or publish projects.

## Finish

Run:

```bash
npm run self-host-apps:qa-gate
npm run self-host-apps:audit-summaries
npm run self-host-apps:icon-integrity
npm run typecheck
npm run build
```

Report claimed, published, duplicate, rejected, needs-review, and failed counts.
