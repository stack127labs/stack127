# Self-host app data workflow

```text
recurring discovery or bulk import
  -> self_host_app_candidates
  -> exact dedupe / name review
  -> atomic claim
  -> Codex research and reviewed decisions
  -> self_host_apps + provenance
  -> QA
  -> provider refresh
```

Production is canonical. Local is a disposable mirror for development and QA.

## Discovery

Recurring cadence:

- GitHub topics: daily.
- Awesome Selfhosted and selfh.st: weekly.
- Selfhostedworld and OpenAlternative: monthly.

One-time expansion:

```bash
npm run self-host-apps:discover-selfhostedworld -- --limit 5000 --details --concurrency 4 --out <report.json>
npm run self-host-apps:discover-openalternative -- --limit 5000 --details --concurrency 4 --out <report.json>
```

Inspect the report before adding `--write`. Dedicated collectors read each directory's structured data and keep its detail payload as evidence. They do not publish or classify apps.

## Dedupe

```bash
npm run self-host-apps:dedupe-candidates -- --dry-run
npm run self-host-apps:dedupe-candidates
```

Exact canonical source-code URL and official homepage matches become duplicates. Their discovery payload is attached to the existing app. Normalized-name matches become `needs_review` with the possible match IDs. Slugs and names never prove identity.

## Claim and research

```bash
npm run self-host-apps:select-candidate-batch -- --limit 100 --out <batch.json>
npm run self-host-apps:collect-github-evidence -- --file <batch.json>
```

Selection uses `FOR UPDATE SKIP LOCKED` and changes claimed rows to `enriching`, so concurrent agents do not take the same work. Discovery preserves an active claim.

Codex researches the official website, docs, releases, packages, containers, license, publisher, icon, deployment instructions, and source code when it exists. Scripts do not write summaries, categories, classifications, surfaces, or resource estimates.

## Apply reviewed decisions

```bash
npm run self-host-apps:apply-candidate-review -- --file <reviewed.json> --dry-run
npm run self-host-apps:apply-candidate-review -- --file <reviewed.json>
```

The review applier validates and moves data; it makes no editorial decisions. Publication requires an official identity, a cached icon or reviewed fallback, one to three categories, verified self-hosting classification, install docs, and field provenance. Open and source-available apps require a verified source repository and license. Closed-source apps require an official website and publisher or product terms.

Known RAM, storage, database, Docker, Compose, pricing, release, and surface facts require direct evidence. Otherwise keep them `null` or `unknown`. A repository scan is not evidence for a RAM or storage number.

Official appliance catalogs may supply exact container images, Compose files, declared database services, package memory caps, and persistent-volume declarations. Keep a package memory cap in `ram_default_limit_mb`, not in a minimum or recommended field. Keep a volume declaration in `persistent_storage`; it does not prove a storage minimum.

When an official source was checked but did not publish a value, keep the value null and record the checked outcome in `self_host_app_field_sources`. This closes the research task without inventing a number.

Primary-source technical refreshes always run as proposals first. Numeric RAM and storage facts are stripped from an applied batch unless their slug and reviewed values appear in a separate `--requirements-file`. This prevents an example deployment, hosted plan, model-specific figure, or development environment from becoming a general requirement. Legacy directory-import provenance does not count as a technical audit; use `--refresh-all` when a complete recheck is needed.

```bash
npm run self-host-apps:refresh-primary-technical-facts -- --requirements-file <reviewed-requirements.json> --out <report.json>
npm run self-host-apps:refresh-primary-technical-facts -- --apply-reviewed --requirements-file <reviewed-requirements.json> --out <report.json>
npm run self-host-apps:refresh-primary-technical-facts -- --refresh-all --requirements-file <reviewed-requirements.json> --out <report.json>
npm run self-host-apps:refresh-primary-technical-facts -- --refresh-all --apply-reviewed --requirements-file <reviewed-requirements.json> --out <report.json>
```

Use `self-host-apps:release-candidate-batch` when a claimed batch must be abandoned.

## QA

```bash
npm run self-host-apps:qa-gate
npm run self-host-apps:qa-report
npm run self-host-apps:icon-integrity
npm run self-host-apps:audit-summaries
npm run self-host-apps:audit-links-fast
npm run typecheck
npm run build
```

The QA report keeps researched null outcomes separate from the actionable queue. A field counts as researched only when its field source comes from an official or manually reviewed audit, not from legacy directory-import metadata. `technical_pending_count` must be zero before a completeness release; `researched_null_counts` explains which facts official sources do not publish.

## Mutable source facts

- GitHub: every 12 hours.
- GitLab and Codeberg: daily.
- Official container and app-catalog sources: daily or weekly based on source limits.
- Closed-source release pages: weekly.

Refresh jobs update provider-neutral source facts, maintenance state, raw API evidence, and field verification dates. They do not change summaries, categories, self-hosting classification, deployment facts, links, or publication state.

## Database direction

Refresh local from production:

```bash
npm run self-host-apps:sync-prod-to-local -- --confirm-local-reset
```

The old local-to-production mirror is intentionally guarded. It requires `--confirm-reviewed-push`, never drafts missing production rows by default, and should be used only for a reviewed exceptional push. Normal enrichment writes directly to the chosen database and keeps production canonical.

GitHub Actions require an IPv4-capable Supabase pooler connection in the `DATABASE_POOLER_URL` repository secret. The direct `db.<project>.supabase.co` URL is IPv6-only and does not work on GitHub-hosted runners.
