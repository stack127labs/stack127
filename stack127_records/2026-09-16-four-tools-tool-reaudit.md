# Four-tool re-audit, 16 September 2026

All findings from the first audit are closed. The four tools are ready in their reviewed, unpublished scope. No publication or production deployment was performed.

| Tool | Verdict | Re-audit result |
|---|---|---|
| Restic retention simulator | Ready, unpublished | Native `hostname`, legacy `host`, oldest-snapshot fallbacks, normalized identity checks, collision-safe grouping, timezone display, and decision reasons passed. |
| Rsync filter tester | Ready, unpublished | First-match ancestor traversal, directory-only rules, unmatched behavior, unsupported syntax, and the 1,000-rule by 1,000-path limit passed. |
| Home Assistant MQTT discovery checker | Ready, unpublished | Topic IDs, abbreviations, scalar identifiers, covered component requirements, QoS, exact JSON integer handling, and partial-profile wording passed. |
| LXC ID mapping checker | Ready, unpublished | Container and host overlap checks, usable ID bounds, owner matching, full-range grant coverage, and separate UID/GID grants passed. |

## Closed findings

- Restic now reads native snapshot hostnames and retains the oldest snapshot when daily, weekly, monthly, or yearly history has fewer populated periods than the requested count.
- Restic validates optional field types, checks IDs after trimming, keeps distinct path and tag groups distinct, and shows timestamps in the selected timezone.
- Rsync resolves each ancestor with the same ordered first-match rules as the supplied path. It distinguishes a directory-only pattern from an ordinary basename pattern.
- Rsync rejects modifiers and character classes outside the supported subset instead of returning a misleading decision. Patterns are compiled once and inputs are capped at 1,000 rules and 1,000 paths.
- MQTT no longer accepts a covered sensor, binary sensor, or button without its required state or command topic. Other recognized components return a partial result because only common fields were checked.
- MQTT validates discovery IDs and QoS, accepts documented abbreviations and both supported device identifier forms, and rejects integers that cannot survive JavaScript JSON parsing exactly.
- LXC checks host-side as well as container-side overlap, rejects reserved or overflowing IDs, and checks the complete matched host range against a grant for the selected owner and ID type.
- Every workbench associates invalid input with its field, applies `aria-invalid`, focuses the first failing control, and clears stale output after edits. Field validation stays in the form; it does not create an error result panel or redundant recovery button.
- Repeated primary-result blocks were removed, MQTT omits an empty findings table, and shared result tables become labeled stacked rows on narrow screens.
- Complete server-rendered title, introduction, supporting content, source links, and internal links now exist in the managed development database at tool version `1.0.0`, content revision `1`.
- Each route owns unit, page-contract, and Playwright tests. The retained audit probes are listed in the scripts inventory. The re-audit found and corrected one stale LXC probe that still used the retired combined-grants input.

## Verification

| Check | Result |
|---|---|
| Engine regression tests | 41 cases passed across the four engines. |
| Page contract tests | 12 cases passed. |
| Browser tests | All 24 desktop and mobile scenarios passed. Valid, invalid, focus, stale-result, partial-result, empty-table, copy-action, grant-source, and narrow-screen states were covered. Two Chromium MQTT page loads were retried after managed-development database timeouts; both passed on retry. |
| Full-page content assertions | 4 passed in Chromium against temporary managed-development previews. |
| Independent audit probes | The original Restic, rsync, MQTT, and LXC reproductions now return the corrected outcomes. |
| TypeScript | Passed. |
| Static policy | Passed for 303 route files. |
| Tool pipeline validation | `--stage=content` and `--tool-only` passed for all four tools. |
| Production build | Passed with all four flat routes compiled. |
| Development registry state | Four complete records exist and are restored to `is_published=false`, with `published_at` and `updated_at` null. |

The repository-wide `npm run quality` command reached 181 passing test files and three failures outside these tools, then stopped before its later SEO and build steps. The unrelated failures are the self-host-app technical refresh fixture, the unindexed `scripts/kdp-tools` folder, and the unfinished KDP/tool-route inventory. The production build was run separately and passed. None of those failures involve the four audited routes, engines, manifests, or tests.

The in-app Browser runtime had no available browser instance. Rendered QA used the repository Playwright setup against the real routes and managed development content. The preview publication flags were temporary and were reverted after the tests.

## Final state

There are no remaining confirmed correctness, accessibility, writing, content, data, or rendered-interface findings in the selected four-tool scope. Publication and deployment remain separate actions.
