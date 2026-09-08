# Repository scanner proposal

Status: deferred. The user asked to save this discussion for later. This record does not authorize implementation, scanning, infrastructure provisioning, or changes to the directory cards. No scanner has been built as part of this discussion.

## Purpose and scope

Provide useful repository assessments for `/self-host-apps` and `/cli-apps`, across a user-reported catalog of 4,000+ apps and growing. Collect structured evidence automatically and show saved summaries beside app details.

The initial suggestion of installing apps and commissioning recurring AI reviews was rejected as too expensive and impractical at this scale. The direction to revisit is a deterministic repository scanner, not an installation-testing lab.

## Constraints to preserve

- No AI calls required for collection, scoring, or explanations.
- Do not install apps, execute repository code, run package installation scripts, build projects, or launch their containers in the default pipeline.
- Do not clone full repository history or download container images by default.
- Bound API requests, downloaded bytes, files, history windows, processing time, and retries per scan.
- Keep findings tied to evidence. Missing access or unsupported formats mean unknown or partial coverage, not a pass.
- No scans on page load, hover, or card activation. The website reads saved results.
- No unmeasured cost or throughput claims. Benchmark a representative repository batch before choosing refresh schedules.

## Research that prompted the idea

The screenshot matched [Open Apps Pro](https://openapps.pro/apps). Its [methodology](https://openapps.pro/methodology), reviewed on 2026-09-06, describes three scores:

| Assessment | Published approach |
| --- | --- |
| Repo health | Activity, maintenance consistency, community, maturity, and momentum, each weighted 20%. |
| Technical | Claude reviews architecture, code quality, innovation, and learning curve, each weighted 25%. |
| Dependencies | Dependency repo health 30%, technical quality 30%, vulnerabilities 15%, staleness 15%, and dependency count 10%. |

This is inspiration, not a reproducible implementation contract. The public explanation does not supply all thresholds or AI evaluation details. On the fetched [Swagger UI page](https://openapps.pro/apps/swagger-ui), the five displayed repo-health subscores averaged 77.6 while the total showed 97. The cause was not established. Do not copy their scores or claim to have verified their backend.

## Candidate evidence

These are options for later evaluation, not a commitment to implement every check.

| Area | Possible deterministic checks |
| --- | --- |
| Maintenance | Archived status, release history, activity within fixed periods, recent contributors |
| Collaboration | Bounded samples of issue responses and pull requests, contributor concentration, with sample size and bot treatment recorded |
| Engineering practices | Test configuration, CI workflows, observed CI outcomes, dependency-update configuration |
| Security practices | Security policy, workflow permissions, pinned workflow dependencies |
| Dependencies | Resolved package versions where available, known vulnerabilities, fixes, deprecated versions, supported scan coverage |
| Project facts | Languages, license files, package managers, machine-readable runtime declarations |
| Deployment configuration | Dockerfiles and Compose declarations for services, ports, volumes, and privileges |

Use parsers and fixed rules. Do not infer arbitrary prose reliably describes a working setup. Distinguish a test configuration from an observed successful CI run, and a declared resource limit from measured use. Repository inspection cannot establish installation reliability, actual memory requirements, or overall security.

## Proposed processing model

1. Resolve entries to stable repository identities. Share one repository scan across entries without assuming every app in a monorepo has the same dependencies.
2. Fetch metadata and selected file trees or files through provider APIs. Record commit identifiers and relevant package paths.
3. Parse supported files within explicit limits. Cache parsed results by file hash and parser version.
4. Check dependency versions against advisory and registry data. Cache package-version findings across apps.
5. Compute findings and optional scores using versioned rules and a recorded assessment date.
6. Save evidence and history, then expose a compact read-only result to the site.

Repository content, issue activity, advisories, and scoring rules change independently. A new advisory must trigger reassessment of affected saved dependencies even if their repositories have not changed. A new commit need not trigger reparsing of unchanged lockfiles. Time-dependent findings also need reassessment as their observation date changes.

Schedule work in a persistent queue. Use conditional requests where supported, respect provider limits, back off on failures, and refresh less active repositories less frequently. Do not assume permission to install webhooks on third-party repositories. Keep the last successful result with its date when a refresh fails; never silently present it as a fresh scan.

Treat fetched repositories and scanner configuration as untrusted input. Parse in restricted workers without application credentials, host mounts, or permission to execute project commands. Future scanner selection must verify that the chosen mode does not implicitly run a package manager or build tool.

## Tools to evaluate

- [GitHub API best practices](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api): conditional requests, request queues, caching, and rate-limit handling.
- [OSV-Scanner supported files](https://google.github.io/osv-scanner/supported-languages-and-lockfiles/): dependency extraction and vulnerability matching. Coverage varies by ecosystem and file format.
- [OpenSSF Scorecard](https://github.com/ossf/scorecard): selected security-practice checks or attributed public results. Its aggregate score is not automatically a stack127 score.
- [deps.dev API](https://docs.deps.dev/api/v3/): package information and dependency data for supported ecosystems.

Recheck current capabilities, terms, limits, and safe execution modes when work resumes. No tools were installed or scanners run for this proposal.

## Existing foundation

The repository already has a shared `github_projects` model and a [GitHub refresh script](../scripts/self-host-apps/refresh-github.mjs) collecting repository identity, stars, forks, watchers, open issues, language sizes, dates, archived status, latest release, and last commit. Its maintenance classification is primarily based on last-commit age.

The current refresh selection is self-host-app scoped. A future scanner needs explicit coverage for unique repositories across both directories. Historical evidence, dependency findings, scan-run records, and reproducible scoring would be additional work. This observation came from source inspection, not a live audit of populated records.

## Scoring and original data

Candidate headings are Maintenance, Engineering practices, and Dependency findings. Exact checks, weights, thresholds, and whether to show numerical scores remain undecided.

The same evidence snapshot, assessment date, scanner versions, and rule version must produce the same result. Explanations can use templates tied to actual findings. Scores must expose their breakdown and coverage. Serious findings must not disappear inside a favorable average.

Do not use popularity as proof of safety, novelty as proof of quality, or low commit frequency alone as proof of abandonment. Keep unavailable source code and unsupported ecosystems visibly unassessed.

Our original data would be normalized findings, longitudinal observations, release comparisons, and derived assessments. Upstream public facts remain attributed to their sources. The collection implementation can remain private while the methodology is public.

## Possible presentation

Preserve the approved cards and existing details sidebar. A small summary could appear on hover and keyboard focus, with the same information available by opening the sidebar on mobile. The full assessment would show evidence, scan date, version or commit, coverage, and methodology. No hover-only access to important information.

This is a presentation proposal, not approval to add gauges, scores, or another card redesign.

## When we return to this

- Decide the scanner's ownership and whether it merits a separate repository.
- Choose an initial set of cheap, useful checks and supported ecosystems.
- Define repository, app-package, version, evidence, and history boundaries.
- Benchmark automatic scans across representative small, large, inactive, monorepo, and unsupported projects. No app installations or AI reviews.
- Set measured request, storage, and processing budgets before scheduling the whole catalog.
- Validate deterministic output and missing-data behavior before publishing scores.

No runtime rules changed. Current operating docs remain in `stack127_docs/`; this dated record only preserves the deferred proposal.
