---
name: stack127-self-host-discovery
description: Discover Stack127 open-project candidates from GitHub, Awesome Selfhosted, selfh.st, Selfhostedworld, and OpenAlternative without publishing or assigning editorial facts.
---

# Stack127 self-host discovery

Work in `/Users/ravitejaknts/projects/Stack127`.

Discovery writes staging evidence only. Official project sources and the enrichment skill decide final facts.

## Run

1. Read `content_docs/self-host-apps/data-workflow.md` and `schema.md`.
2. Run the relevant `self-host-apps:discover-*` command with `--write`.
3. Confirm its `open_project_import_runs` result and candidate count.
4. Dry-run, then apply dedupe:
   `npm run self-host-apps:dedupe-candidates -- --dry-run`
   `npm run self-host-apps:dedupe-candidates`
5. Hand queued and name-review candidates to the enrichment skill.

## Rules

- Keep imported summaries, categories, surfaces, and payloads as raw evidence.
- Exact canonical source-code or homepage matches are duplicates.
- Name-only matches are `needs_review`, never automatic duplicates.
- Keep self-hosting status `unknown` until official evidence is checked.
- Never assign Stack127 categories or publish from discovery.

Report discovered, inserted, updated, exact duplicates, name reviews, queued, and errors.
