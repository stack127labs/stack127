# Quality workflow

stack127 is a content website with interactive tools. Checks must protect what visitors see and do without slowing ordinary publishing.

## Normal gate

Run:

```bash
npm run quality
```

This runs TypeScript and a small core suite. The suite checks database error handling, publication boundaries, the static release gate, production deployment safety, and the MDX content rules in [page-content.md](page-content.md). Use it when no production build is required.

Run a focused test only when code calculates, parses, transforms, imports, or resolves data:

```bash
npm run test:focused -- tests/pages/<slug>/<test-file>.test.mjs
```

Do not add tests for documentation, skill wording, file hashes, acceptance receipts, paragraph counts, exact copy, or implementation details that users cannot observe.

## Page check

Use a local headless browser when the Codex in-app browser is unavailable over SSH. Follow `skills/stack127/references/homelab-browser-and-search.md`. A successful HTTP response or source review does not check the rendered layout or interactions. Continue without requesting in-app browser access.

Before handoff:

1. Open the real page from the homelab server.
2. Confirm it loads at desktop and mobile width.
3. For an interactive tool, run one correct example and one invalid-input example.
4. Confirm the title, main content, links, and primary action are usable.
5. Don't run `npm run build` on the homelab. Route, shared runtime, SEO, and production configuration changes get their full build from pull request CI on GitHub. See Release check.

Do not run a full-site browser suite for one page. Recheck only the changed page and shared behavior it affects.

## Release check

Heavy checks run on GitHub to keep load off the homelab. Code changes go through a pull request. `.github/workflows/stack127-ci.yml` runs `npm run test:core` and `npm run build` on it. In the build route list, public pages must be static (`○` or `●`). The build's `postbuild` hook runs `npm run check:static -- --strict`. Only API routes, `/vitals`, and `/publication-not-found` may be dynamic. See [caching.md](caching.md). If CI fails, fix the branch and push again.

Merging the pull request starts the production workflow. It runs the core tests, builds one immutable backend image, and deploys it. It checks the live revision, homepage, robots file, and sitemap. The image build checks TypeScript, compiles routes, and runs the strict static route check. In Cloudflare mode, the workflow also reads the production publication registry and builds the static frontend before changing traffic. It verifies both builds against the same release SHA.

Documentation, skills, records, and tests do not trigger a production release by themselves.

The Cloudflare frontend export runs only on GitHub: `scripts/stack127/frontend/build.mjs` refuses to run anywhere else. Don't build it on the homelab. When you change `scripts/stack127/frontend/` or the cache worker's Cloudflare mode, run `npm run test:focused -- tests/stack127/frontend-static.test.mjs tests/stack127/frontend-content-queue.test.mjs`. Check a frontend change on the `workers.dev` preview the workflow deploys before the production route. See [cloudflare.md](cloudflare.md#static-frontend-on-cloudflare).
