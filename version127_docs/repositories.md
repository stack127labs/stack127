# Managed repositories

Standalone open-source projects owned by Version127 live under `repos/<repository-name>/`. Each folder is a complete, runnable repository with its own application code, documentation, tests, license, container configuration, and screenshots.

These folders are canonical products, not templates or disposable build output. Do not create a nested `.git` directory. Dependency folders, build output, local environment files, logs, and test artifacts remain ignored by the HomeLabHQ repository.

When a standalone project shares code with the hosted Version127 site, keep the sync boundary narrow. A sync script may update explicitly managed shared code, but it must preserve repository-owned routes, interface changes, documentation, configuration, screenshots, and release files. A sync check should fail when the shared copy drifts.

DNS Tools lives at `repos/dns-tools`. Its shared DNS engine, API routes, and deterministic unit tests are maintained by `scripts/version127/repos/sync-dns-tools-core.mjs`. Run the check without writing:

```bash
npm run version127:dns-tools:sync-check
```

Run the bounded update only when the hosted DNS engine or API changes:

```bash
npm run version127:dns-tools:sync
```

Public GitHub creation, repository initialization, subtree publication, pushing, releases, and deployment still require explicit user approval. Until then, `repos/<name>` remains a normal tracked folder inside HomeLabHQ.
