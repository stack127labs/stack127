# Reviewed CLI app corrections

Use Node.js 22.18 or newer (the guard imports the directory's TypeScript option lists).

```bash
node scripts/cli-apps/apply-reviewed-corrections.mjs \
  --env .env.local --file /path/to/reviewed-batch.json
```

This runs every chunk and rolls it back. Add `--apply` to commit. The default
chunk size is 25 apps; `--chunk-size` accepts integers from 1 to 25. Each chunk
commits app changes, field sources, public dates, and cache jobs together. A
failure stops the run and rolls back that chunk. Earlier committed chunks stay
applied. Re-run the same batch to resume: identical fields skip without touching
app timestamps, provenance, public dates, or cache jobs. This is chunk-level
atomicity, not a transaction across the entire file.

Every field needs its reviewed old value and an HTTPS evidence URL:

```json
{
  "apps": [{
    "slug": "example",
    "reviewed_at": "2026-11-02",
    "fields": { "platforms": ["linux", "macos"], "install_methods": ["brew", "binary"] },
    "expected": { "platforms": ["linux"], "install_methods": ["binary"] },
    "sources": {
      "platforms": "https://example.org/docs/platforms",
      "install_methods": "https://example.org/docs/install"
    }
  }]
}
```

Allowed fields: `name`, `summary`, `website_url`, `repository_url`, `docs_url`,
`license`, `language`, `platforms`, `categories`, `primary_type`, `additional_types`,
`pricing_model`, `source_model`, `aliases`, and `install_methods`.

Lists replace the entire field. Values must be unique. Categories need 1 to 3
entries. Platforms, categories, types, prices, source models, and install methods
use the site's allowed values. Aliases accept nonempty text. Empty arrays are
allowed except for categories. Only `website_url`, `docs_url`, `license`, and
`language` accept null. URLs and sources must be valid HTTPS URLs. Summary rules
still apply. All input is checked before the first transaction; prior values
are checked again under row locks. Current values must match either the expected
old value or the requested value. Any third value stops the chunk.

A changed `repository_url` also changes `github_project_id` in the same update.
GitHub owner/repo parsing and normalization match the refresh script. Existing
projects are matched case-insensitively and reused without updating their facts.
If older imports left case variants, the most recently checked row wins, with
a stable ID tie-breaker. Before inserting a missing project, a transaction-scoped
table lock serializes writers and the lookup runs again. This prevents duplicate
creation without changing existing rows or the database schema. Missing projects get a minimal
row with `checked_at = null`. GitHub owner/repo parsing also runs during whole-batch
validation, so malformed URLs stop the run before any chunk commits.
Non-GitHub repositories clear the link. This derived
link cannot be supplied as a reviewed field. Evidence is recorded for the
`repository_url` correction.

Published app changes use the existing `/cli-apps` public-date and cache triggers.
The tool never publishes records or changes `last_verified_at`. Dry runs roll
back trigger effects and any newly created GitHub projects too. A dry run does
not reserve values; a later apply checks them again.

For slow links, each query has a 180-second client timeout, a 120-second database
statement timeout, and a 15-second lock timeout. A connection or commit error
can leave the commit outcome uncertain; re-run the same file to check and resume.
