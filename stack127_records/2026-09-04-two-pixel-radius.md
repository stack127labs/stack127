# Two-pixel site radius

Date: 4 September 2026

## Decision

stack127 uses one 2px radius for bounded UI shapes. The old 8px card radius and 12px panel radius are retired.

The shared `--radius` token now controls cards, tool frames, fields, buttons, tags, title marks, tables, media frames, and similar components. True circles stay circular when the shape has meaning, such as a timeline node or numbered step.

## Scope

- Replaced the `--radius-lg`, `--radius-xl`, and stray `--radius-md` references with `--radius`.
- Moved hard-coded component corners to the shared token.
- Squared off generated fallback app icons and clean chart bars.
- Added a sitewide test that rejects radius drift.
- Removed the internal radius comparison page after the 2px choice was made.

## Verification

- The focused radius policy test passes.
- TypeScript and the production Next.js build pass.
- The wider unit suite passes 112 of 116 test files. Four unrelated catalog and hardware-image test files fail because local image assets are missing. The Dockerignore test passes when run on its own.
- The static policy check reaches an unrelated pre-existing file, `stack127_docs/environment-inventory.md.orig`, and rejects its non-Markdown extension.
- Visual Browser checking is still required because no app browser was connected during this change.

## Release state

This record documents the repository change only. It does not publish, commit, push, or deploy the update.
