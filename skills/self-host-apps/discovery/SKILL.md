---
name: version127-self-host-discovery
description: Discover new Version127 self-host app candidates from external directories and GitHub without publishing them. Use when expanding the directory, importing selfhostedworld, OpenAlternative, selfh.st, Awesome Selfhosted, or GitHub topics, or preparing candidates for enrichment.
---

# Version127 self-host discovery

Use this skill in `/Users/ravitejaknts/projects/HomeLabHQ`.

Discovery is staging, not publication. External directories find projects; official sources decide the final facts and classification.

## First checks

- Read `AGENTS.md`.
- Read `version127_docs/open-projects.md`.
- Read `content_docs/self-host-apps/data-workflow.md` and `schema.md`.
- Check `scripts/scripts.json` and `scripts/self-host-apps/scripts.json`.

## Flow

1. Run one or more `self-host-apps:discover-*` commands with `--write`.
2. Confirm the rows landed in `open_project_candidates`.
3. Run `self-host-apps:dedupe-candidates -- --dry-run`, then write.
4. Select 100 queued candidates with `self-host-apps:select-candidate-batch`.
5. Hand the batch to the enrichment skill.

## Rules

- Keep raw summaries, categories, topics, and payloads as staging evidence.
- Dedupe by canonical source-code URL first, then slug and homepage.
- Treat name-only matches as weak and review them.
- Keep `self_hosting_status` as `unknown` until official sources support a classification.
- Never assign Version127 categories or publish projects from discovery output.

Report discovered, inserted, updated, duplicate, queued, and error counts.
