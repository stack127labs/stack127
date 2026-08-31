---
name: stack127-self-host-discovery
description: Discover stack127 self-host app candidates from software directories and official appliance catalogs without publishing or assigning editorial facts.
---

# Stack127 self-host discovery

Work in `/home/teja/projects/stack127`.

Discovery writes staging evidence only. Official app sources and the enrichment skill decide final facts.

## Run

1. Read `content_docs/self-host-apps/data-workflow.md` and `schema.md`.
2. Run the relevant `self-host-apps:discover-*` command with `--write`.
   Use `self-host-apps:discover-app-catalogs` for the official TrueNAS and Umbrel catalogs; these sources include commercial and closed-source apps that open-source lists omit.
3. Confirm its `self_host_app_import_runs` result and candidate count.
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

After reviewed catalog facts are applied, run `self-host-apps:refresh-install-options`. It creates registry, Compose, and verified appliance destinations from reviewed evidence; it does not infer support for a platform that has not supplied a catalog or package URL.
