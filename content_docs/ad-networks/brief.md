# Ad network directory brief

The reader wants to find an ad network and see which publisher websites currently have a verified relationship with it. The parent directory lists the reviewed network roster. Each network page lists confirmed publisher domains with a precise relationship label and last checked date.

The draft has 45 network identities and uses `/ad-networks` and `/ad-networks/<slug>`. Search and pagination stay on these routes through query parameters. Candidate domains and ambiguous matches never appear in the public list. Empty network pages explain that no sites have been verified yet. The pages remain unpublished in `stack127_pages` until the data collection and verification work has been reviewed.

The source of truth is the three table model in [plan.md](plan.md): network identity, globally deduplicated publisher domain, and a separate verified relationship. A discovery source is a lead, not proof of network use. The relationship row provides the evidence for a public claim. The page needs no niche, traffic, earnings, or technology claims in this release.

## Current release boundary

The parent and 45 child registry rows remain unpublished in development and production. Shipping their code, identity data, and docs does not launch the directory. The managed publisher and relationship tables remain empty; the independent homelab SQLite queue is preserved.

The two GitHub discovery and verification workflows are manual previews. They have no schedules and run without `--apply`, so they do not save candidates or verification results. Enabling production writes, copying reviewed SQLite results, scheduling production refreshes, and publishing pages each need a separate activation review.
