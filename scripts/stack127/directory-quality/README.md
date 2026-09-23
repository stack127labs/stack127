# Directory review inventory

Capture an audit baseline without modifying either database:

```bash
node scripts/stack127/directory-quality/inventory.mjs --env .env.database --out /tmp/stack127-production-inventory.json
```

The command uses one repeatable-read, read-only transaction. Each published self-host and CLI record receives a fingerprint and `pending` status. Flags prioritize inspection; they do not decide source models, categories, eligibility, or final copy. Records without flags still need review.

Keep the baseline immutable. Record reviewed corrections in the owning directory's batch folder, including primary sources and the exact fields reviewed. A summary correction does not verify resource requirements or every other field. Reconcile changes against fresh production data before applying each batch, and read the result back afterward.

Self-host partial corrections use `review_scope: "partial"`, an `expected` value for every changed app field, and primary `data_source_urls`. Installation changes also require `reviewed_install_methods` and `expected_install_options`. The writer preserves whole-record review dates and appends evidence. Run the owning directory's QA override command with `--dry-run` before applying.

CLI partial corrections use `scripts/cli-apps/apply-reviewed-corrections.mjs --env <env file> --file <batch.json>`. This command defaults to rollback. Each field needs an expected value and source URL; `--apply` commits the checked batch. It cannot advance `last_verified_at`.

Snapshot version 2 includes joined installation, resource-estimate, repository, and CLI field-source records. It reads 100 rows per cursor fetch inside the same read-only transaction and refuses to overwrite an existing snapshot. The initial version-1 baseline does not include those joined records; keep it for before/after comparison, not as proof of complete audit coverage.

Do not call the old production-to-local sync script for this audit: it resets a local Docker database and includes unrelated page tables. The current development database is managed Supabase. Use a scoped, reviewed transfer that preserves unrelated development work when a mirror is needed.
