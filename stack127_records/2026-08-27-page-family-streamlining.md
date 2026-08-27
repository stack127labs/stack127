# Page family streamlining

Date: 2026-08-27

stack127 moved from page-by-page presentation rules to shared page families.

- `PageCanvas` now owns the standard content width, outer padding, and major vertical spacing.
- `PageHeader` now owns visible page title and introduction rendering.
- `app/prose.module.css` now owns paragraph and heading rhythm across reading content.
- The self-hosted app and terminal app directories now share catalog styles, filter controls, and
  sorting UI.
- Course data now follows the reusable model in `lib/courses.ts`, with the lesson layout in
  `app/course-shell.tsx`.
- Crawler records and other maintenance details were removed from public catalog pages.
- The repo-local `unslop` skill became mandatory for public copy and durable docs.

Current rules live in `stack127_docs/page-families.md`, `stack127_docs/design-system.md`,
`stack127_docs/writing-style.md`, and `AGENTS.md`.
