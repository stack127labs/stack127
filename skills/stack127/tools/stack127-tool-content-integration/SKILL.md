---
name: stack127-tool-content-integration
description: Integrate drafted or user-supplied tool copy and SEO text into the development page, then verify the result.
---

# stack127 tool content integration

Use this skill after `$stack127-tool-writing` in the normal pipeline, or when a user supplies replacement copy. Read the draft files or supplied words, the spec, `stack127_docs/tool-pages.md`, `stack127_docs/tool-catalogs.md`, `stack127_docs/seo.md`, `stack127_docs/shared-ui.md`, the route, and current development rows. Map the copy into the visible title, introduction, usage, supporting content, interface wording, search title and description, and shared catalog card copy. Use `stack127_docs/writing-style.md` for any wording edits. If a required field is missing or a claim conflicts with the tool or sources, return it to the writing worker or resolve it with the user; do not invent replacement copy.

1. Dry-run the content update.
2. Apply the title, introduction, usage Markdown, supporting Markdown, interface wording, and supported content components or figures to development only. Update `stack127_pages.meta_title` and `meta_description` in the development registry when the draft changes them; preserve publication fields and other registry data. Keep each section in its intended field and use the documented Markdown syntax.
3. Read the spec's Catalog placement and the current catalog memberships. Confirm that the primary and every secondary catalog exist. Choose an unused display order for each new placement and approved card icon and art keys. Dry-run `npm run stack127:tool-page:catalogs:update`, review its complete proposed membership list, then apply it to development. This command owns the shared card fields and catalog links; do not put cards in route code. If a new catalog is required, return that work to the main agent before applying a substitute placement.
4. Keep functional version and content revision changes separate. Catalog card edits and membership changes do not increment `content_revision` or change `tool_version`.
5. Run only focused renderer, link, figure, or data checks when the changed code needs them.
6. Open the actual development tool page and every assigned catalog, using the headless fallback in `skills/stack127/references/homelab-browser-and-search.md` when needed. Confirm the integrated content, card words, links, search metadata, and primary tool action work. Unpublished tools stay out of public catalog cards until their registry row is published.

Do not calculate hashes, write receipts, run a browser matrix, write production data, commit, push, or deploy. Report changed fields, catalog ranks and orders, revision, version, focused checks, and remaining issues.
