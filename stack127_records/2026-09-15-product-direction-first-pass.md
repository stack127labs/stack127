# Product direction first pass

## Scope

Prepare stack127 for the agreed audience of tech tinkerers and hustlers. The current strategy is in [product-direction.md](../stack127_docs/product-direction.md).

## Implemented

- Homepage byline and introduction describe the broader audience and existing resources. Start here links to domain tools, CLI apps, keyboard shortcuts, and the self-hosting course when those destinations are published.
- Shared navigation includes Explore, DNS tools, domain tools, storage tools, and Labs. Information-page navigation and 404 recovery lead back to the homepage.
- About explains the audience and offering, preserves the founder's background and affiliate disclosure, distinguishes future revenue options, and links the specific public projects through Labs and GitHub.
- Terms describes tools, directories, references, and courses while preserving its existing responsibility and acceptable-use boundaries.
- Shared site description and a three-row registry metadata migration align the homepage, About, and Terms with the direction.
- Agent guidance, topic-research criteria, page briefs, ownership manifests, and navigation tests reflect the new scope.
- Information-page headings reserve room for corner artwork on desktop. This fixes the title overlap found during visual review.

Existing URLs, query pagination, directory data, tool behavior, card artwork, and specialist content keep their current behavior. Analytics is a separate next task. Ads, paid tools, AI credits, and topic landing pages are later work.

## Metadata

`supabase/migrations/20260915062731_broaden_site_positioning.sql` changes only `meta_title`, `meta_description`, and deliberate `updated_at` values for the existing empty homepage slug, `about`, and `terms`. It checks that all three rows exist and only updates changed copy.

Applied to the managed development database in a transaction. A second application changed zero rows. Publication flags, URLs, and tool revisions were not changed. The before/after evidence is in ignored `tmp/positioning/dev-metadata-result.json`.

The migration has not been applied to production. Apply it with the production release so the database-owned metadata and the new page wording go live together.

## Verification

The scoped implementation checks passed. Detailed local logs and screenshots are in ignored `tmp/positioning/`.

- Typecheck passed.
- Static policy passed for 294 route files.
- Topic-research skill validation passed.
- The read-only production publication registry check passed.
- The focused homepage, navigation, artwork, and affiliate unit checks passed, 20 tests.
- The full unit run passed 994 of 995 tests. Its unrelated Dockerignore timing check passed when rerun separately, 12 of 12 tests.
- The optimized production build passed with webpack, including its TypeScript check. The output is isolated in ignored `.next-positioning-build/`.
- Browser SEO checks passed for the homepage, About, and Terms on desktop and mobile. Query variants retain their noindex and canonical behavior. The sitemap includes published pages and excludes unpublished routes.
- Final checks against the local production build passed, 7 tests with one deliberate skip because the layout test already covers mobile widths. They verify navigation, 404 recovery, the mobile information-page drawer, homepage artwork, and layout in both themes. Screenshots were inspected; the Terms title and About introduction now stay clear of the corner artwork.
- Privacy and Labs, which share the header, also passed desktop and mobile spacing and overflow checks in both themes.

The single `npm run quality` command did not complete as one clean run. Sandbox child-process restrictions initially blocked existing tests. The subsequent full unit run had the timing failure described above, which passed separately. Development previews also had database DNS, query timeouts, and a five-second navigation assertion that was too short for the remote database. The navigation test now allows 30 seconds, consistent with existing navigation checks. The affected browser checks passed against the completed local production build. The complete sitewide Playwright suite was not run.

The preview used a freshly resolved database DNS cache and the site's real cached font files in temporary test setup. Neither workaround changes application or deployment configuration. Generated references to the temporary build folders were removed from `tsconfig.json` and `next-env.d.ts`.

## Release status

Changes are in the local working tree. No commit, push, or production deployment has been performed by this task. The working tree also contains unrelated ongoing work that must be kept separate when preparing a release.
