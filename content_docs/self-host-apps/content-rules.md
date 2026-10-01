# Self-host app content rules

Use these rules when reviewing apps for `/self-host-apps`.

## Facts

- Use official websites, repositories, docs, releases, and container/package pages.
- Set `self_hosting_status` only after checking official install or deployment evidence.
- Use `unknown` or `null` when research does not support a fact.
- Keep GitHub topics as raw metadata. Assign controlled categories by actual purpose.
- Keep source URLs in the app's `data_source_urls` or review `sources`; keep checked technical outcomes in `technical_fact_status`.
- Classify the source model as `open_source`, `source_available`, `closed_source`, or `unknown`; never use those terms interchangeably.
- A closed-source app can be published without a repository when its official identity and self-hosted deployment are verified.
- An official Docker image is valid distribution evidence. A community image must be labeled `community` and must not imply publisher support.
- Link Docker actions to a registry or package page where someone can pull or install the image. A Dockerfile, Compose file, repository, or README can support the evidence record but is not a Docker install destination.
- Platform catalogs such as TrueNAS SCALE and Umbrel may be listed as separate install options when their catalog URL is verified. Catalog inclusion does not imply publisher support.
- Estimate RAM and storage for every published app for a typical small self-hosted setup. Use publisher guidance to calibrate the estimates when available. Always label the ranges `Est. RAM` and `Est. Storage`. Keep an official source link and a short internal basis in the record; do not show a long explanation.
- Do not add generic tags, verdicts, long descriptions, or per-app prose pages.

## Summaries

The summary field holds one original sentence about the app's purpose. Follow `stack127_docs/writing-style.md`. Source model and self-hosting status have their own fields.

Do not generate public summaries from imported descriptions or topics, or truncate them to a character limit and append punctuation. Imported markup and unfinished sentences block publication until the text is reviewed. A passing automated check does not establish factual accuracy. Review the complete sentence against the official project evidence.

## Review dates

Repository and release refresh dates describe those checks only. Do not label them `facts checked` or advance a general review date after changing a subset of fields. Record the scope and sources of each editorial correction. Resource and installation checks keep their own evidence dates and unknown states.

## Rendering

Keep details in the `/self-host-apps` drawer. Render complete app facts in server HTML so search crawlers and AI agents do not need to execute the drawer.

See `stack127_docs/self-host-apps-data.md`, `content_docs/self-host-apps/schema.md`, and `content_docs/self-host-apps/data-workflow.md` for the data contract and workflow.
