# Public repository architecture

The private application repository is `RaviTejaKNTS/version127`. Open-source repositories belong to the `version127` GitHub organization.

## Local source

Every public repository has a complete local tree under:

```text
repos/<repo-name>/
```

The folder is tracked by the private application repository and contains everything that will appear publicly. It must not contain a nested `.git` directory.

Each repository declares its public target and validation commands in `version127-repository.json`.

## Synchronization

Shared application code is copied into a public repository through an explicit allowlist. Every sync command needs:

- a normal mode that updates only managed files;
- a check mode that reports drift without writing;
- clear repository-owned paths that it never overwrites;
- tests proving the boundary.

Do not use blind bidirectional synchronization. If a change is made in a public repository first, port it deliberately into the private source of truth and then run the normal sync again.

## Publishing

Before a public push:

1. run the repository's sync check;
2. run its complete quality gate;
3. confirm ignored build output is not tracked;
4. scan tracked files for environment files, credentials, private URLs, deployment tokens, and database secrets;
5. review the subtree diff;
6. push the subtree commit to `version127/<repo-name>` on its declared default branch.

The public repository should contain only its own history. The private application's unrelated pages and commits must never be exposed.
