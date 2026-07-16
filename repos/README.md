# Public repositories

Version127's private application is the source of truth. Complete working copies of public repositories live under this folder and are published to the `version127` GitHub organization.

Each repository folder must contain:

- the complete public repository contents;
- `version127-repository.json` with the organization target, default branch, and validation commands;
- public README, contribution, security, license, and operating documentation;
- repository-owned tests and CI;
- no nested `.git` directory.

Shared application code moves into a public repository only through an explicit one-way synchronization script with a check mode. Repository-specific routes, packaging, public documentation, and deployment files remain owned by the repository folder.

Publishing uses a subtree commit for `repos/<repo-name>`. This keeps the private and public histories separate without placing nested Git repositories inside the Version127 worktree.
