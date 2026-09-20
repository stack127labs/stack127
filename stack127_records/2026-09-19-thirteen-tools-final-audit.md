# Thirteen-tool final audit

Date: 19 September 2026
Audit session: `/root/final_audit_13`
Model: `gpt-5.6-sol`, high reasoning
Target commit: `3296c3250b57403cfd2966eab5dfae06c5a528aa`, plus the current uncommitted retrofit work

## Verdict

The 13 tools pass the final audit in their reviewed, unpublished development scope. Formula and parser tests, invalid and boundary cases, server loaders, shared controls, current public content, four rendered views per route, the repository test suite, static policy, and the Next.js build pass. The resource planner also passes a separate 320 px picker-reachability check.

No new public-tool correctness defect was found in this final audit. One P2 pipeline defect was found and fixed: the acceptance CLI resolved the repository root one directory too high and could not load real route records. A regression now protects the corrected path.

Publication and release remain separate actions. The development database is restored to 13 unpublished rows with no public dates. No production connection was opened, no production row was written, and nothing was deployed.

## Scope and provenance

The retrofit owns interface, tests, engine, usage, content, media, and integration. Historical research and product planning were used as constraints but were not reassigned to this audit.

| Stage | Session | Required worker |
| --- | --- | --- |
| Interface, first eight tools | `/root/interface_contracts_13` | `gpt-6-astra`, low |
| Interface, five KDP tools | `/root/interface_contracts_kdp` | `gpt-6-astra`, low |
| Test design and build | `/root/test_build_13` | `gpt-5.6-luna`, max |
| Content plan and writing | `/root/content_plan_writing_13` | `gpt-6-astra`, low |
| Content integration | `/root/content_integration_13` | `gpt-5.6-luna`, max |
| Final audit, fixes, and retesting | `/root/final_audit_13` | `gpt-5.6-sol`, high |

The worktree was already dirty with the current pipeline work. This audit preserved unrelated changes. It added final evidence and acceptance records, changed only the acceptance-validator defect and its regression in repository code, and adjusted temporary audit helpers.

## Preserved earlier findings

The initial Restic, rsync, MQTT, and LXC audit found incorrect native-host grouping, retention fallback, rsync ancestor and directory matching, MQTT validity and identity checks, LXC overlap and grant coverage, validation focus, and performance behavior. The original record remains at [2026-09-16-four-tools-tool-audit.md](2026-09-16-four-tools-tool-audit.md). The fixes and passing rechecks remain at [2026-09-16-four-tools-tool-reaudit.md](2026-09-16-four-tools-tool-reaudit.md). This final audit reran their current regression cases and rendered routes; it did not erase or replace those findings.

The initial KDP audit found wrong spine coefficients, an incorrect eBook royalty equation, a wrong 110-page print boundary, an insufficient PDF parser, incomplete metadata checks and stale-state behavior, incomplete page-count evidence, and missing browser acceptance. The original record remains at [2026-09-16-kdp-five-tools-tool-audit.md](2026-09-16-kdp-five-tools-tool-audit.md). The fixes and earlier rechecks remain at [2026-09-16-kdp-five-tools-tool-reaudit.md](2026-09-16-kdp-five-tools-tool-reaudit.md). Current tests and rendered evidence cover the corrected implementations.

## Current correctness review

| Tool | Current checks and result |
| --- | --- |
| 3-2-1 backup capacity calculator | Exact byte arithmetic; full and incremental branches; independent ceil-rounded targets; annual compounding; decimal and binary display; recovery goals; malformed, boundary, and maximum inputs. Passed. |
| Docker Compose checker | Bounded YAML parsing; duplicate keys and documents; Compose model normalization; ports; dependencies; interpolation states; static advisories; unsupported keys; deterministic reports. Passed. |
| IP and ASN registration lookup | Public IPv4, IPv6, and ASN parsing; reserved input; RDAP bootstrap matching; bounded API body; RIR normalization; status isolation; current routing kept separate from registration. Passed. |
| Self-hosted app resource planner | Quantity multiplication; reserved budget; within, tight, over, and unknown results; custom ranges; exact fractional RAM; invalid recovery; combobox naming and behavior; 320 px access. Passed. |
| Restic retention simulator | Native `hostname`; calendar and last-count rules; oldest fallback; collision-safe groups; normalized identities; timezone handling; invalid optional fields. Passed. |
| Rsync filter tester | First-match rules for supplied paths and ancestors; traversal stops; directory-only rules; unmatched defaults; unsupported syntax; 1,000-rule by 1,000-path bound. Passed. |
| Home Assistant MQTT discovery checker | Topic grammar; object IDs; abbreviations; identifiers; required component topics; QoS; unsafe JSON integers; partial-profile wording. Passed. |
| LXC ID mapping checker | Container and host overlap; reserved IDs and endpoint bounds; exact offsets; separate UID and GID grants; owner and full-range coverage. Passed. |
| KDP book setup calculator | Trim, bleed, margin, spine, cover, pixel, page-parity, paper, and binding branches. Current groundwood and color coefficients pass exact fixtures. |
| KDP metadata checker | Supported HTML, malformed nesting, title and keyword prompts, bare domains, emoji, malformed keyword input, local-heuristic limits, and stale submitted results. Passed. |
| KDP royalty calculator | Print fixed and per-page branches; 110-page boundary; eBook delivery deduction before the 70% rate; cent arithmetic; page normalization; targets and comparison bounds. Passed. |
| KDP PDF preflight checker | Pre-parse size limit; page-tree order; inherited boxes; fonts; image placement DPI; parity; cover geometry; parser failures; local-only handling. Passed. |
| KDP page count estimator | Range, midpoint, raw totals, added pages, text block, KDP floor and gutter guidance, invalid typography, and version receipts. Passed. |

The public-source review retained the official limits and scope in the live copy. Primary references include the Docker Compose specification, Team Cymru and RDAP references, Docker resource documentation, Restic forget documentation, the rsync manual, Home Assistant MQTT discovery documentation, Linux container and subordinate-ID manuals, and KDP's current setup, cover, metadata, printing-cost, royalty, and PDF guidance. The browser sweep now compares every rendered source-link target with the reviewed writing artifact, not only the link count.

## Rendered and interaction evidence

Each real route was enabled alone in managed development, opened once after a real React hydration signal, exercised to a representative result, and checked at dark 1440 × 900, dark 390 × 900, light 1440 × 900, and light 390 × 900. Every route passed:

- one workbench and the correct h1;
- current usage and supporting-heading order;
- required tables, lists, figures, and focusable table regions;
- exact reviewed source links;
- a result that remains rendered through the four cases;
- no document or body horizontal overflow;
- correct theme state.

The resource planner also passed a 320 × 900 check proving that its combobox is enabled and that the custom-app option is visible and selectable after reset. The audit originally produced 52 screenshots and 13 route reports. Those disposable artifacts were removed during the 2026-09-20 repository cleanup; this record keeps the result.

The screenshot review found no clipping, unreadable control, lost result, table escape, or theme contrast failure in the audited routes. The sitewide analytics-consent panel appears in some captures and remains dismissible with named actions; it did not block the tested tool interaction.

## Content and database evidence

All 52 live development content fields match the trimmed reviewed writing artifacts: title, introduction, usage Markdown, and supporting Markdown for all 13 tools. The content renderer shows one continuous article after the workbench. Claims are bounded to what each local checker or estimator establishes, and runtime, deployment, KDP acceptance, security, and real-resource guarantees remain explicit limitations.

The final read-only cleanup receipt records:

- database environment: development;
- expected rows found: 13;
- published rows: 0;
- non-null public dates: 0;
- route IDs and publication fields restored to the guarded pre-preview snapshot: yes;
- production connection opened: no;
- production write: no.

The original disposable receipts were removed during the 2026-09-20 repository cleanup. This record keeps their final result.

## Semantic-version judgment

| Tools | Final version | Judgment |
| --- | --- | --- |
| Backup, Docker Compose, IP/ASN, resource planner | `1.0.1` | Patch versions are appropriate for corrected first-release behavior. The planner is at the required patch level for its shared-control accessibility and behavior correction. |
| Restic, rsync, MQTT, LXC | `1.0.0` | Their audit corrections preceded development registration and define the first release, so no post-registration bump is required. |
| All five KDP tools | `1.1.0` | The minor version exceeds the minimum patch increment and is justified by corrected formulas, parser behavior, observable validation behavior, and completed result contracts. |

No tool implementation changed during this final audit, so another tool-version increment would misstate the release history. The acceptance-validator CLI fix is pipeline infrastructure, not a tool calculation or interface change.

## Final-audit finding and fix

### F-AUDIT-CLI-ROOT — P2, fixed

`scripts/stack127/tool-pipeline/validate-acceptance.mjs` resolved four parent directories from its own directory, landing at `/home/teja/projects` instead of the repository root. Real acceptance CLI calls therefore reported every page record as missing.

The CLI now resolves three parent directories. `tests/stack127/tool-pipeline-acceptance.test.mjs` protects the path. The focused suite, repository suite, build, and real integrity and live acceptance calls pass after the fix.

## Verification

| Check | Final result |
| --- | --- |
| Interface and content-stage contracts | 26 of 26 passed. |
| Focused route and shared tests | 221 passed, 0 failed. |
| Repository `npm run test` | 1,139 passed, 0 failed; TypeScript and static policy included. |
| Static policy | Passed for 303 route page files. |
| Next.js build | Passed against managed development data. |
| `git diff --check` | Passed. |
| Rendered route-first cases | 52 of 52 passed, plus planner 320 px. |
| Live database cleanup | Passed: 13 rows, 0 published, 0 public dates, exact restoration. |
| Acceptance records | 13 current target-fingerprint records pass integrity and live development validation. |

The command logs, screenshots, browser reports, and acceptance receipts were removed during the 2026-09-20 repository cleanup. They are no longer part of the current workflow.

## Environment and test failures kept separate from product findings

- The in-app Browser had no available instance. The approved repository Playwright fallback was used.
- The sandbox blocked the first managed-development DNS connection. The guarded command passed with the required network permission.
- The first live acceptance pass had transient DNS failures on four early records while later records passed. The complete read-only retry passed all 13 records and replaced the failed log.
- A 20-second first-navigation limit was shorter than a cold Next.js compilation. The harness now allows 90 seconds.
- The first hydration check treated two absent readiness attributes as ready. It now requires an explicit ready flag or React ownership on an interactive descendant.
- The first planner result run used an exact accessible name and rejected the correct required-field suffix. DOM evidence showed the custom row existed; only the audit locator changed.
- The first planner 320 px probe reset state before light screenshots. The probe now runs after all four result screenshots, and each case asserts that its result remains rendered.
- One read-only development receipt connection timed out. The immediate retry passed without a write.
- The first regression rerun omitted `readFileSync` from the new validator test import. The test import was corrected, and the complete current suite passed.

These failures do not hide a current product defect and are not counted as passing product evidence until their successful reruns.
