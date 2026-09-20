# Repository streamlining

Goal: keep stack127 fast to create, check, and release without lowering the quality of its research, writing, design, calculations, SEO, accessibility, or production pages.

## Work list

- [x] Record the current test, documentation, skill, build-artifact, worktree, CI, and deployment setup.
- [x] Define one small sitewide quality gate for builds, routes, SEO, data loading, and tool correctness.
- [x] Remove redundant tests, document checks, skill checks, hashes, receipts, evidence requirements, and repeated validators.
- [x] Keep focused correctness tests for interactive tools and a small shared-site smoke suite.
- [x] Make local checks change-focused and keep broad regression work out of ordinary page releases.
- [x] Simplify package scripts, CI, release checks, and deployment handoffs around the small quality gate.
- [x] Give the normal production release a direct path designed for a three-to-five-minute warm-cache run.
- [x] Simplify sitewide agent instructions and documentation without removing current product, design, writing, routing, data, security, or production facts.
- [x] Put tool workflow skills in one clear folder and shorten each skill to its actual job.
- [x] Make the homelab development environment and long-running server behavior explicit to agents.
- [x] Remove safe `.next` output and other disposable local build artifacts.
- [x] Inspect Git and Codex worktrees and remove only confirmed unused worktrees.
- [x] Run the new minimum checks, measure their time, and fix any real failures.
- [x] Confirm production pages and production data were not changed.
- [x] Record the final workflow, retained protections, removed clutter, timing, and any remaining limitation.

## Result

Completed locally on 2026-09-20.

- The local `quality` gate is TypeScript plus four shared release-safety tests. It passed in 14.12 seconds with the incremental cache and 66.05 seconds from a cold cache.
- A tool change runs only its focused calculation or behavior test. The chmod calculator test passed in 1.66 seconds.
- A clean production build passed in 3 minutes 51 seconds.
- The built homepage, chmod calculator, robots file, and sitemap each returned HTTP 200 with expected content.
- CI now runs the four core tests and one build. The build performs the TypeScript check, so CI does not run TypeScript twice. Documentation-only changes do not start it.
- Release now applies migrations only when needed, builds and pushes one immutable image, deploys it once, and verifies the exact live revision and core public routes.
- A trial read-only production-registry query timed out after 23 seconds. That redundant network gate was removed from automatic release; the local registry helper test and live homepage, robots, and sitemap checks remain.
- Browser matrices, ownership manifests, acceptance receipts, hashes, evidence folders, repeated policy tests, pipeline validators, and duplicate regression workflows were removed.
- Focused calculation and data tests remain available through `npm run test:focused -- <paths>`.
- Tool skills now live under `skills/stack127/tools/`. Research, product planning, interface planning, build, content, integration, and one independent audit remain separate jobs.
- Twelve disposable `.next` directories and other generated artifacts were removed. The small ignored TypeScript incremental cache is retained because it cut the measured local gate from 66.05 seconds cold to 14.12 seconds warm. The two extra clean, merged Git worktrees were removed; the main worktree remains.
- No production deployment, production database write, or production page change was made.

The three-to-five-minute release target is a design target, not a measured production result yet. A real release is needed to measure GitHub cache and provider time. The workflow has no remaining duplicate build, browser phase, or separate production-database check.
