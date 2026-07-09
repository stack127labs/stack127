# Version127 Public GitHub Repo System

Version127 should use public GitHub repositories as a distribution, trust, and developer adoption layer. The private Version127 app/database stays the source of truth. Public repos are generated outputs that make datasets and tools easier to inspect, star, fork, self-host, and share.

## Core Decisions

- Use the `version127` GitHub organization for all public repos.
- Keep the private Version127 database as the source of truth for structured data.
- Treat public GitHub repos as generated publication artifacts, not the editing source.
- Start with one dataset repo: `version127/version127-datasets`.
- Keep tool templates inside this private repo. Do not create a public template repo unless we later need one.
- Prefer simple public repo surfaces over exposing private workflow detail.
- Do not publish source payloads, provenance files, schema files, or QA internals for datasets unless a specific dataset truly needs them.
- Include database schema or seed SQL only for public tool repos that need database-backed self-hosting.

## Public Dataset Repo

Target repo:

```text
version127/version127-datasets/
  README.md
  LICENSE
  CONTRIBUTING.md
  self-host-apps/
    README.md
    apps.csv
```

Dataset rules:

- Publish CSV as the primary and only data file by default.
- Keep each dataset folder small: one `README.md` and one CSV unless the dataset has a clear reason for more files.
- The dataset README should include the update cadence, source-of-truth note, column descriptions, license terms, contribution path, and a link back to the Version127 website.
- The public CSV should include only fields that are useful to readers and safe to distribute.
- Private fields such as source payloads, field provenance, QA flags, internal notes, and enrichment audit state stay in the private repo/database.
- CSV generation should be deterministic so diffs stay reviewable.

## Private Repo Changes Needed

Add a sitewide GitHub publication area:

```text
scripts/version127/github/
  export-dataset.mjs
  sync-dataset-repo.mjs
  create-tool-repo.mjs
  render-readme.mjs
```

Add durable package scripts:

```json
{
  "version127:dataset:export": "node scripts/version127/github/export-dataset.mjs",
  "version127:dataset:sync": "node scripts/version127/github/sync-dataset-repo.mjs",
  "version127:tool:new": "node scripts/version127/github/create-tool-repo.mjs"
}
```

## Dataset Export Flow

Initial command shape:

```bash
npm run version127:dataset:export -- --surface self-host-apps --out /tmp/version127-datasets
npm run version127:dataset:sync -- --surface self-host-apps --repo version127-datasets --dry-run
```

Required behavior:

1. Read verified data from the production database only.
2. Select only public columns for the CSV.
3. Sort rows deterministically.
4. Write `self-host-apps/apps.csv`.
5. Render `self-host-apps/README.md`.
6. Update the dataset repo root README if needed.
7. Show a dry-run diff before writing or pushing.
8. Commit with a generated message only after review.

For `/self-host-apps`, the export should reuse the existing verified production data workflow. It should not bypass QA gates, provenance checks, icon integrity checks, or publication state. Public dataset exports must read `.env.database` or an explicit production `--database-url`; they must not fall back to `.env.local`, because local rows can include artifacts, incomplete data, or data that was intentionally not pushed.

## Tool Repo Flow

Tool repos should be generated from a private template inside this repo, for example:

```text
templates/github-tool/
  README.md.template
  LICENSE
  Dockerfile
  docker-compose.yml
  .env.example
  screenshots/
  app/
```

Initial command shape:

```bash
npm run version127:tool:new -- --slug port-checker --name "Port Checker" --dry-run
npm run version127:tool:new -- --slug port-checker --name "Port Checker" --create-repo
```

Tool repo rules:

- Each public tool repo should be self-hostable when that makes sense.
- Include Docker and Compose for web tools unless the tool is intentionally static-only.
- Include `.env.example` whenever configuration exists.
- Include `schema.sql`, `seed.sql`, or migrations only when the public tool needs a database.
- Prefer local/static tool data when possible.
- Link to the hosted Version127 version.
- Link back to Version127 in the README and package metadata.
- Keep the public app shell minimal: logo, tool name, primary tool UI, and only the navigation needed for that standalone tool.
- Do not expose private Version127 site menus, private analytics details, internal data pipelines, or unrelated site surfaces.

## README Standard

Every public repo should have a polished README with:

- project title and one-line value proposition
- Version127 badge or brand line
- hosted demo link
- screenshots showing the full app and important functionality
- quick start
- Docker quick start when applicable
- configuration table
- data/storage notes
- privacy and security notes
- update and maintenance notes
- contribution guidance
- license
- link back to Version127

Dataset READMEs should additionally include:

- CSV file path
- column table
- update cadence
- what is included and intentionally excluded
- how to cite or link the dataset
- how to request corrections

## Screenshot Standard

Tool repos should include multiple screenshots under `screenshots/`:

- full desktop view
- mobile or narrow view when the tool is responsive
- one screenshot for each major workflow or output state
- optional dark and light mode screenshots if the tool supports both

Screenshots should be regenerated from the actual app, not hand-edited mockups.

## GitHub CLI Requirements

Local automation needs a working GitHub CLI session with access to the `version127` organization.

Required setup:

```bash
gh auth login -h github.com
gh auth status
gh api orgs/version127
```

If the interactive keyring login is not visible to automation, use a local uncommitted repo env file:

```text
.env.repos
```

Suggested values:

```bash
GH_TOKEN=github_pat_or_fine_grained_token_here
GITHUB_TOKEN=github_pat_or_fine_grained_token_here
VERSION127_GITHUB_ORG=version127
VERSION127_DATASET_REPO=version127-datasets
```

Rules for `.env.repos`:

- Never commit it.
- Keep it covered by `.gitignore`.
- Prefer a fine-grained token whose resource owner/access is the `version127` organization, not only the personal `RaviTejaKNTS` account.
- Include only the permissions needed for repo creation, contents writes, pull requests, and workflows when workflow files must be changed.
- Load it explicitly in repo publication scripts. `gh` can use `GH_TOKEN` from the environment, but it does not read `.env.repos` by itself.
- Do not print token values in command output, logs, dry-run diffs, or generated README files.

Before enabling create/push automation, confirm:

- the active account is correct
- the token is valid
- the account can access `version127`
- the account can create repos in the org
- the token has the scopes needed for repo creation, pushes, and workflow updates

If GitHub returns `does not have the correct permissions to execute CreateRepository`, the dataset export can still be generated, but the public repo must be created manually or the token/account must be allowed to create repositories in the `version127` organization. For fine-grained PATs, the token page should show access on `version127`; a token that only shows access on `RaviTejaKNTS` and "repositories owned by you" is scoped to personal repositories and cannot create `version127/...` repositories. After the empty repo exists or the org-scoped token is in `.env.repos`, rerun the sync command.

## Launch Order

1. Create or confirm the `version127` GitHub organization access.
2. Create `version127/version127-datasets`.
3. Build the CSV export for `/self-host-apps`.
4. Render the dataset README from a private template.
5. Run a dry-run sync and inspect the diff.
6. Push the first dataset repo commit.
7. Add links from Version127 to the public dataset repo.
8. Build the private tool template.
9. Publish one small tool repo as the pilot.
10. Turn the proven steps into durable commands.

## Open Decisions

- Dataset license: likely permissive, but confirm whether data should use MIT, CC BY, CC0, or another license.
- Contribution path: decide whether public dataset corrections should happen as GitHub issues, pull requests, or a Version127 form.
- Repo naming: decide whether tool repos use short names like `port-checker` or prefixed names like `version127-port-checker`.
- Screenshot generation: decide whether screenshots are manual at first or generated with Playwright.
- Release cadence: decide whether dataset exports happen manually, on deploy, or on a scheduled job.
