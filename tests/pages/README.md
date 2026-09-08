# Page ownership

Every route under `app/(site)` has one `page.json` file in this tree. The folder mirrors the public route, with `home` representing `/`.

The manifest is the first place to look when changing a page. It records:

- the route and publication state;
- the page-owned documentation;
- the tests that protect the page;
- any scripts or skills owned by the page or route family;
- any deliberate stack127 repo relationship; repository details live in `stack127_docs/stack127-repos.md`, not in a copied source tree.

Tests that only protect one page belong beside that page manifest. Tests for a real shared system stay in `tests/stack127` or a route-family `shared` folder and are referenced by every page that depends on them.

Do not add a second hand-maintained route coverage registry. The quality checks discover these manifests directly.
