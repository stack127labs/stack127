# Post-build review: Drive Reliability Explorer

Status: ready
Tool: Drive Reliability Explorer
Route: `/drive-reliability`
Reviewed: 2026-08-23

## Review method

The route was compared against the seven direct competitor surfaces in `competitive-report.md`, with emphasis on NASdisks, The Home Server Blog AFR calculator, Tony LaTorre’s Backblaze analysis, and RaidSize’s drive database. The route was exercised in a temporary production Next harness with standalone Playwright 1.60.0 and Chromium 1223 at 1280 × 900 and 375 × 900. The in-app Browser was unavailable. No competitor or shared Stack127 file was changed.

## Comparison

| Question | Route result | Competitor pattern | Review finding |
| --- | --- | --- | --- |
| Time to first useful answer | Clean state explains that a cohort must be selected; exact model search or a row selection produces AFR, range, failures, drive days, count, age, and source context in one frame. | NASdisks and static reports show a ranking or table immediately. Calculators require a longer input path. | The route keeps the answer path short without pretending that the first sorted row is selected. |
| Action clarity | Period is required, filters are labelled, selection is capped at three, and reset/share state are explicit. | Most competitors have no period control or comparison state. | No P0 or P1 interaction gap found. |
| Result usefulness | Point AFR, approximate evidence range, raw exposure, failures, drive count, age, source period, and selected comparison rows stay together. | NASdisks omits exposure and intervals; LaTorre has interval context but one fixed period; broad catalogs make AFR secondary. | Evidence context is a material advantage. |
| Technical transparency | The route uses the documented drive-days AFR formula, a named `poisson-normal-v1` interval, versioned snapshot metadata, and a fixed source link. | LaTorre explains a posterior method; other surfaces often show only a point rate or an opaque adjustment. | Supporting content must explain the formula and interval as approximate evidence, not personal probability. |
| Mobile and accessibility | At 375px controls stack, repeated-fact rows reflow into labelled cards, and document overflow remains zero. Chart values have table equivalents. | Several competitor tables remain wider than the viewport. | No responsive P0 or P1 gap found. |
| Privacy and state | Filtering and selection use the bundled snapshot. No fetch, XHR, storage, or analytics call is made by the route interaction. Share state is bounded and explicit. | Competitor local handling is mostly undocumented. | State and privacy explanation belongs in the guide. |
| Scope and limits | Period, source date, inclusion label, and source link are visible. The page does not rank a universal best drive or predict an individual home drive. | Ranking and adjusted-risk surfaces invite broader interpretation. | The guide must state the data-center population boundary and next real-world check. |

## Upstream technical or interaction gaps

No remaining P0 or P1 gap was found after correcting the clean-state behavior so that no cohort is presented as selected before the user searches, filters, or selects one. The route remains unpublished and does not require a shared registry or sidebar change.

## Content-only gaps for the writing plan

- Explain that AFR uses failures divided by drive days converted to years, not drive count alone.
- Explain why a zero-failure or thin cohort still has an evidence range and is not a zero-risk forecast.
- State that quarterly, annual, and lifetime rows are separate source scopes, and that Backblaze’s data-center workload is not a home-NAS probability.
- Explain that the bundled snapshot is local to the interaction, while the source link is the deliberate external path.
- End with practical verification: check the drive’s current SMART history, firmware and workload context, warranty or return path, and maintain backups.
- Link the official Backblaze dataset/report as provenance. Do not add a ranking claim, personal failure estimate, or generic FAQ.

## Evidence

- Desktop interaction: search an exact lifetime model, select it, switch period, select three models, inspect the comparison table, share state, and reset.
- Mobile interaction: 375px selected-result state in dark and light themes; no document-level horizontal overflow and no clipped evidence values.
- Request inspection: no network request during local filtering or selection.
- Console inspection: no production console errors.
- Temporary screenshots: `/tmp/stack127-drive-reliability-qa.U7eZac/desktop-dark-selected.png`, `desktop-light.png`, and `mobile-dark.png`.
