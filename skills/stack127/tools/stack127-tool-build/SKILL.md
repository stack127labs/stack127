---
name: stack127-tool-build
description: Build one stack127 tool from a ready tool-spec.md, add focused correctness tests, and verify the real interaction locally.
---

# stack127 tool build

Read `AGENTS.md`, the complete tool spec, `stack127_docs/tool-pages.md`, and the relevant design and interface docs.

1. Build parsing, validation, formulas, lookup logic, and serialization outside React.
2. Implement the contracted interface with shared components, one primary action, and one lead answer.
3. Keep the client island small, use the shared shell and tokens, and colocate styles.
4. Add one focused unit test file for independently known normal, boundary, and invalid examples. Add more only for a real high-risk calculation or recovery path.
5. Run that focused test.
6. Start or reuse the homelab server. Check the real tool at desktop and mobile width with one correct example and one invalid-input example.
7. Leave the final sitewide checks and production build to the orchestrator after integration and audit.

Do not write supporting article content, create manifests or evidence files, run the whole repository test collection, publish production data, commit, push, or deploy.
