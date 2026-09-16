# self_host_apps summary cleanup

Date: 2026-09-09

## Outcome

The production `public.self_host_apps` catalogue was audited and cleaned for all 4,995 published rows with `self_hosting_status = 'self_hostable'`.

1,970 summaries were rewritten. The remaining 3,025 summaries already passed the final checks and were left unchanged. The cleanup removed imported BBCode and HTML, HTML entities, Markdown links, URLs, setup instructions, source-file and path details, truncated clauses, malformed grammar, and other copied documentation residue.

Descriptions are now short, direct, plain-text explanations of what each app does. They remain one sentence, use the curated summary fields, and keep implementation or installation details in the appropriate source fields.

## Research and guarded updates

The review used official repositories, project websites, documentation, container registries, and appliance catalogues. The source-review packets covered the initial 1,374 flagged rows, a further 514 broad-quality candidates, 23 residual rows, five rows found after the durable rules were strengthened, and seven rows found by the final language-policy pass.

Every production update used `review_scope = 'partial'`, an exact current-value snapshot, and at least one HTTPS source URL. The guarded updater changed `summary`, set `summary_source = 'curated'`, set `summary_confidence = 'high'`, and appended the reviewed URL to `data_source_urls`. It did not advance whole-record verification dates.

Two broad-pass proposals (`loggifly` and `vivaldi`) were already current in production and were skipped as unchanged. The other 512 broad-pass rows were committed after the live preparation and dry run passed.

## Verification

- `NODE_ENV=production node scripts/self-host-apps/audit-summary-quality.mjs` passed all 4,995 rows with zero findings for markup, hidden characters, entities, URLs, instructions, source or setup artifacts, unfinished endings, malformed articles, semicolons, and likely clause splices.
- `NODE_ENV=production node scripts/self-host-apps/audit-summaries.mjs` passed all 4,995 rows twice.
- `node tests/pages/self-host-apps/summary-quality.test.mjs` passed all six focused tests.
- `npm run test:unit` passed all 913 tests.
- `npm run test:static` passed all 290 route page checks.

The durable summary validator and the separate quality audit now reject the artifact patterns and weak source language that caused this cleanup, so future imported descriptions fail review instead of reaching production.
