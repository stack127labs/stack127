---
name: version127-self-host-enrichment
description: Enrich Version127 self-host app draft rows in repeatable batches of 100 and publish only verified rows. Use when the user asks to enrich draft self-host apps, process the next 100 apps, repair a draft-to-public enrichment pass, verify/publish a self-host app batch, or repeat the Version127 /self-host-apps data workflow.
---

# Version127 Self-Host Enrichment

Use this skill in `/Users/ravitejaknts/projects/HomeLabHQ` for the Version127 `/self-host-apps` database workflow.

Core rule: gathered apps enter as `draft`. A row becomes `published` only after the 100-app enrichment pass verifies its key facts, summary, categories, links, and image/icon state. Keep uncertain or failed rows in `draft`.

## First Checks

Before changing data:

- Read `AGENTS.md`.
- Read the relevant files in `content_docs/self-host-apps/`.
- Check `scripts/scripts.json` and `scripts/self-host-apps/scripts.json`.
- Inspect the current schema and script names instead of relying on memory; these can drift.
- Work under `scripts/self-host-apps/`. Put batch files in `scripts/self-host-apps/batches/`.
- Do not add one-off commands to `package.json`.

## Batch Flow

1. If starting a clean review cycle, set existing apps to draft:

   ```bash
   npm run self-host-apps:draft-all -- --dry-run
   npm run self-host-apps:draft-all
   ```

2. Select 100 draft apps into a durable batch file:

   ```bash
   npm run self-host-apps:select-enrichment-batch -- --limit 100 --out scripts/self-host-apps/batches/YYYY-MM-DD-enrichment-NNN.json
   ```

3. Create or update the matching overrides file:

   ```text
   scripts/self-host-apps/batches/YYYY-MM-DD-enrichment-NNN-overrides.json
   ```

   Use overrides for human-reviewed summaries, categories, publishers, platforms, docs links, official websites, Docker links, and any facts the automated pass cannot infer safely.

4. Cache app icons/images for the batch:

   ```bash
   npm run self-host-apps:cache-icons -- --file scripts/self-host-apps/batches/YYYY-MM-DD-enrichment-NNN.json --limit 100
   ```

   Prefer official logos, repo organization avatars, or stable project favicons. Do not publish broken icon paths.

5. Dry-run enrichment:

   ```bash
   npm run self-host-apps:enrich-github-batch -- --file scripts/self-host-apps/batches/YYYY-MM-DD-enrichment-NNN.json --overrides scripts/self-host-apps/batches/YYYY-MM-DD-enrichment-NNN-overrides.json --limit 100 --dry-run
   ```

6. Write enrichment after reviewing dry-run output:

   ```bash
   npm run self-host-apps:enrich-github-batch -- --file scripts/self-host-apps/batches/YYYY-MM-DD-enrichment-NNN.json --overrides scripts/self-host-apps/batches/YYYY-MM-DD-enrichment-NNN-overrides.json --limit 100
   ```

7. Verify the result:

   - Published count increased by the intended number.
   - Failed or uncertain apps remain draft.
   - No published app has a missing category, broken icon, missing official docs/install link, or weak summary.
   - Field provenance exists where the schema supports it, usually from `version127_enrichment`.
   - `/self-host-apps` still renders and pagination/filtering still works.

## Enrichment Standards

- Use official project sources first: official website, docs, repository, README, release page, Docker/package page.
- Never invent facts. Use `null`, `unknown`, or keep the row draft when research is not enough.
- Categories must come from the controlled self-host app taxonomy, not raw keyword guessing. Review category assignments by app purpose.
- Use 1-3 categories per published app unless the UI/data model changes.
- Summary must be one direct sentence, usually under 160 characters. Avoid boilerplate like "self-hosted", "open-source", "powerful", or repeated category names unless those words add real information.
- Prefer concrete summaries: what the app helps a user do, not what license or hosting model it has.
- Publisher/maintainer should be `company`, `foundation`, `community`, `individual`, or `unknown` when that taxonomy exists.
- Latest release is useful only when it comes from a trackable source such as GitHub releases/tags.
- Platforms should describe usable surfaces like `web`, `mobile`, `desktop`, or `cli`.
- Docker support needs proof from official docs, repo files, Docker image, or compose examples.
- Database requirements need proof from docs/config examples. Keep unknown when unclear.
- RAM/storage values can be practical estimates only if the pipeline labels/provenance makes that clear; do not present fake precision.
- Docs links should point to install/setup/useful docs, not random marketing pages.

## Quality Gates

Run the repo checks that match the change size. For a normal 100-app batch, use at least:

```bash
npm exec tsc -- --noEmit
npm run build
```

Useful audits, when present:

```bash
npm run self-host-apps:audit-summaries
npm run self-host-apps:audit-links
```

If a command needs network and fails with a sandbox/network error, rerun it with approval instead of filling data by hand.

## Reporting

When finished, report:

- Draft count and published count.
- Batch file and overrides file used.
- How many apps were published, skipped, or left draft.
- Any recurring missing-data patterns.
- Build/typecheck status.

Keep the final answer compact. The user mostly needs the state of the batch and what to check next.
