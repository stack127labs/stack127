# Self-Host App Data Scripts

These commands support the version127 self-host app workflow. They are GitHub-first helpers, not a replacement for manual editorial verification.

## Draft From GitHub

```sh
npm run selfhost:draft -- --repo owner/name
```

Creates `content/app-drafts/<slug>.generated.json`.

Drafts can include candidate links, screenshots, icons, and categories under `automation`. Treat those as leads only.

Do not upsert generated drafts. A draft must be reviewed, rewritten with original version127 copy, moved to `content/apps`, and passed through strict validation first.

Generated fields that are usually safe to keep after review:

- `github`
- `license`
- `maintenance.last_release_at`
- `maintenance.last_commit_at`
- `links.source_code_url`

Generated fields that must be manually verified before keeping:

- `categories`
- `links.website_url`
- `links.docs_url`
- `links.install_docs_url`
- `links.demo_url`
- `links.docker_url`
- `media.icon_url`
- `media.screenshots`
- `deployment`

## Refresh GitHub Facts

```sh
npm run selfhost:github -- --file content/apps/name.json
```

Updates reliable GitHub-derived fields on an existing JSON file:

- Stars, forks, issue and PR counts.
- Latest stable release.
- Release count.
- Last commit.
- 90-day commit and release counts.
- Candidate repo images and README links for review.

## Validate

```sh
npm run selfhost:validate -- --file content/apps/name.json
```

Use `--draft` for generated or incomplete records:

```sh
npm run selfhost:validate -- --file content/app-drafts/name.generated.json --draft
```

Strict validation is required before upserting to the database.

## Upsert To Local DB

```sh
npm run selfhost:upsert -- --file content/apps/name.json
```

Default database URL:

```text
postgresql://postgres:postgres@127.0.0.1:54332/postgres
```

The upsert writes one app, refreshes that app's category links, ensures categories from `content/categories.json` exist, and inserts or updates one GitHub snapshot for the checked date.

Use `--dry-run` to validate database writes without committing:

```sh
npm run selfhost:upsert -- --file content/apps/name.json -- --dry-run
```

Production upserts require explicit user approval.

## Workflow Test Mode

For subagent workflow tests, keep reviewed records under:

```text
content/app-drafts/subagent-<slug>.reviewed.json
```

Then run:

```sh
npm run selfhost:validate -- --file content/app-drafts/subagent-<slug>.reviewed.json
npm run selfhost:upsert -- --file content/app-drafts/subagent-<slug>.reviewed.json --dry-run
```

Do not commit the database upsert or move the test record into `content/apps` unless the main agent explicitly promotes it.
