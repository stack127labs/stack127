# Brief: Drive Reliability Explorer

## Current supporting-content direction

Approved September 6, 2026. Explain source periods, cohorts, drive days, annualized rate, and statistical uncertainty before purchasing limits. A zero-failure sample does not imply zero risk; the interval is not a disk-lifespan range.

The working tool stays first. Follow `stack127_docs/writing-style.md` for writing and visual choices. Store live copy only in the development tool-page row through the reviewed content command. Publication remains a separate operation.

## Who is here

A homelab or NAS builder has an exact hard-drive model in mind, or is comparing a short list before a purchase or replacement. They know that Backblaze publishes fleet data, but need the model, period, sample, and evidence strength in one place.

## The job

Leave with a period-correct Backblaze cohort result for one model or a small comparison: observed AFR, drive days, failures, drive count, age when reported, and an approximate evidence range. Leave knowing what this fleet data can and cannot say about a home NAS.

## Show vs say

- The tool UI shows period selection, exact model search, manufacturer/capacity filters, source qualification, and explicit small-cohort handling.
- A table compares repeated exact fields: model, capacity, AFR, evidence range, drive days, failures, drive count, and age.
- An exact result visualization shows the AFR and its labeled approximate evidence range for the selected model or the three-model comparison. The table repeats the values for accessibility.
- Source metadata shows the Backblaze period, source date, inclusion rule, snapshot version, and interval-method version beside the result.
- Sentences are reserved for the data-center population boundary, the difference between AFR and an individual-drive prediction, why zero failures is not zero risk, the meaning of drive days, and the real-world verification step after the comparison.
- No marker art or screenshot is needed. This page’s useful facts are exact and belong in the live explorer, chart, and tables.
