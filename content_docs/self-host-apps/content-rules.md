# Self-host app content rules

Use these rules when reviewing projects for `/self-host-apps`.

## Facts

- Use official websites, repositories, docs, releases, and container/package pages.
- Set `self_hosting_status` only after checking official install or deployment evidence.
- Use `unknown` or `null` when research does not support a fact.
- Keep GitHub topics as raw metadata. Assign controlled categories by actual purpose.
- Keep source payloads and field-level provenance for imported facts.
- Classify the reviewed license as `open_source` or `source_available`; never use those terms interchangeably.
- Do not add generic tags, verdicts, long descriptions, or per-project prose pages.

## Summaries

Write one original sentence that says what the project helps users do. Keep it specific enough to identify the project without repeating that it is open source or self-hosted.

Good:

```text
Photo and video backup app for building a private Google Photos-style library.
```

Bad:

```text
Powerful open-source self-hosted photo management solution.
```

Avoid filler such as `solution`, `powerful`, `ultimate`, `seamless`, and `all-in-one`.

## Rendering

Keep details in the `/self-host-apps` drawer. Render complete project facts in server HTML so search crawlers and AI agents do not need to execute the drawer.

See `version127_docs/open-projects.md`, `content_docs/self-host-apps/schema.md`, and `content_docs/self-host-apps/data-workflow.md` for the data contract and workflow.
