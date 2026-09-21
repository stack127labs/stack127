# stack127 topic research rubric

Use this rubric when ranking stack127 resource and product ideas.

## Score Columns

Score each candidate from 1 to 5:

- Demand: visible search/community pain.
- Gap: lack of a clear existing easy-reference answer.
- Fit: practical value for solo builders, indie hackers, content creators, or tech tinkerers, informed by the founder's interests and experience. Follow `stack127_docs/product-direction.md`; a subject does not need a homelab connection.
- Feasibility: ability to build a credible MVP with official sources and repo-owned pages.
- Moat: advantage from structured data, useful tooling, repeated updates, or source-backed depth.

Before recommending a build, identify the maintenance work and recurring costs. Revenue assumptions remain hypotheses until there is evidence.

Suggested interpretation:

- 22-25: build next.
- 18-21: strong backlog candidate.
- 14-17: only build if it supports a larger cluster.
- Below 14: skip unless the user has a strategic reason.

## Evidence Checklist

Before recommending an idea, gather at least three of these where possible:

- Official docs proving the facts can be sourced.
- Search results showing scattered or weak answers.
- Community threads showing repeated confusion or demand.
- GitHub issues/discussions showing recurring setup or compatibility pain.
- Existing tools/pages showing the current market shape.
- Repo feasibility check showing no duplicate Stack127 route already exists.

## Surface Shape Tests

Apply the surface decision rule from `SKILL.md` before scoring. Quick version:

- Entity-specific searches (`<app> breaking changes`, `<app> arm64`) are captured by directory facts and indexable pages, not by picker tools.
- A tool must stay useful at partial coverage. If it needs a curated dataset with near-total coverage to be credible, reshape it as a directory facet or reference page.
- A standalone tool needs a useful operation, supported inputs, and results the team can test or evaluate. AI capabilities also need result-quality and usage-cost estimates.
- Use a course for a connected learning sequence. Consider a product for a larger workflow that needs its own experience.
- Safety and correctness labels are human-reviewed editorial content, never automated tool output.

## Good Candidate Patterns

- Cross-app reference where each project documents its own answer but no one has a combined table.
- Directory facet: a new structured field that improves an existing Stack127 directory now and captures entity-specific queries when per-entity pages ship.
- Version-anchored reference page for a major upgrade or migration event that people search by name.
- Config generator where users repeatedly copy fragile snippets.
- Compatibility matrix for proxy, backup, database, storage, mobile, local/cloud, or hardware support.
- Analyzer that accepts user input and computes its report live from that input, not from a curated dataset.
- Calculator over inputs only the user knows, such as their hardware or their planned stack.
- Buyer/setup decision aid for local-first smart home or local AI.
- Data report or trend page generated from Stack127's own databases.

## Rejection Patterns

- Another broad directory with no sharper use case.
- A course with no distinct learner task or improvement over existing resources.
- A standalone tool whose usefulness depends on near-total coverage of a curated per-entity dataset.
- Automated "safe to update" or similar safety/correctness labels.
- News, release commentary, or anything that decays in days.
- Articles whose answer already exists identically elsewhere on the web.
- Ideas that need private telemetry or unsafe internet scanning.
- Ideas where the source facts change too fast to maintain.
- Ideas that would force fake precision, such as exact RAM or storage requirements without project evidence.
