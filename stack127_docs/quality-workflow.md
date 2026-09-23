# Quality workflow

stack127 is a content website with interactive tools. Checks must protect user-visible behavior without slowing ordinary publishing.

## Normal gate

Run:

```bash
npm run quality
```

This runs TypeScript and a small core suite for database error handling, publication boundaries, and production deployment safety. Use it when no production build is required.

Run a focused test only when code calculates, parses, transforms, imports, or resolves data:

```bash
npm run test:focused -- tests/pages/<slug>/<test-file>.test.mjs
```

Do not add tests for documentation, skill wording, file hashes, acceptance receipts, paragraph counts, exact copy, or implementation details that users cannot observe.

## Page check

Use a local headless browser when the Codex in-app browser is unavailable over SSH. Follow `skills/stack127/references/homelab-browser-and-search.md`. A successful HTTP response or source review does not verify the rendered layout or an interaction. Continue the check without requesting in-app browser access.

Before handoff:

1. Open the real page from the homelab server.
2. Confirm it loads at desktop and mobile width.
3. For an interactive tool, run one correct example and one invalid-input example.
4. Confirm the title, main content, links, and primary action are usable.
5. When a route, shared runtime code, SEO code, or production configuration changed, run `npm run test:core` and `npm run build` instead of `npm run quality`. The Next.js build already performs the TypeScript check.

Do not run a full-site browser suite for one page. Recheck only the changed page and shared behavior it affects.

## Release check

The production workflow runs the four core tests, builds one immutable image, deploys it, and verifies the live revision, homepage, robots file, and sitemap. The image build performs the TypeScript and route compilation checks. The workflow does not make a separate database connection, run Playwright, repeat TypeScript, or perform a second build.

Documentation, skills, records, and tests do not trigger a production release by themselves.
