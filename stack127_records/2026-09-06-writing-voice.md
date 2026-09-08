# Writing voice and Domain Age revision

The user asked for The Verge to be the main writing inspiration across stack127, with conversational rhythm, personality, connected explanations, and accurate technical detail.

Installed Vercel's [writing-guidelines skill](https://github.com/vercel-labs/agent-skills/tree/main/skills/writing-guidelines) unchanged under `skills/stack127/writing-guidelines`. The Codex install is a symlink to that repository copy. The existing `.agents/skills` and `.claude/skills` adapters expose the same source. Its [external review rules](https://raw.githubusercontent.com/vercel-labs/writing-guidelines/main/command.md) supplement Stack127's own writing conventions.

Updated `stack127_docs/writing-style.md`, `AGENTS.md`, and the tool-writing skill. Removed the tool skill's section and word-count quotas. The editorial review now checks how paragraphs follow from each other before checking topic coverage. The current site guide records the voice, the reference articles, and how it applies to different page types.

Domain Age's previous copy covered the facts but changed subjects abruptly. The revised explanation connects the date to website history, a hypothetical domain purchase, gaps in registration history, and missing dates. Lookup mechanics remain with the relevant glossary terms. Managed development content revision changed from 3 to 4 through the reviewed content command. Tool version remains 1.1.0. No production content was changed.

Both skills passed the skill validator. Domain Age's existing content tests and diff checks passed. Standalone Playwright checked a real `example.com` result at 1440px and 390px in both themes. There were no page errors or document overflow, including after opening raw evidence. Desktop dark and mobile light screenshots were inspected. The temporary copy and verification artifacts are under `/tmp/stack127-domain-age-voice-8EsVed/`.
