# Self-host app content rules

Use these rules when reviewing apps for `/self-host-apps`.

## Facts

- Use official websites, repositories, docs, releases, and container/package pages.
- Set `self_hosting_status` only after checking official install or deployment evidence.
- Use `unknown` or `null` when research does not support a fact.
- Keep GitHub topics as raw metadata. Assign controlled categories by actual purpose.
- Keep source payloads and field-level provenance for imported facts.
- Classify the source model as `open_source`, `source_available`, `closed_source`, or `unknown`; never use those terms interchangeably.
- A closed-source app can be published without a repository when its official identity and self-hosted deployment are verified.
- An official Docker image is valid distribution evidence. A community image must be labeled `community` and must not imply publisher support.
- Link Docker actions to a registry or package page where someone can pull or install the image. A Dockerfile, Compose file, repository, or README can support the evidence record but is not a Docker install destination.
- Platform catalogs such as TrueNAS SCALE and Umbrel may be listed as separate install options when their catalog URL is verified. Catalog inclusion does not imply publisher support.
- RAM and storage ranges may be shown only when reviewed with an evidence URL, basis, and confidence, and must carry an explicit `estimated` label.
- Do not add generic tags, verdicts, long descriptions, or per-app prose pages.

## Summaries

Write one original sentence that says what the app helps users do. Keep it specific enough to identify the app without repeating that it is open source or self-hosted.

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

Keep details in the `/self-host-apps` drawer. Render complete app facts in server HTML so search crawlers and AI agents do not need to execute the drawer.

See `stack127_docs/self-host-apps-data.md`, `content_docs/self-host-apps/schema.md`, and `content_docs/self-host-apps/data-workflow.md` for the data contract and workflow.
