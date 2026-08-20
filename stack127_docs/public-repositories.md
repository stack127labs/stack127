# External repositories

The private `stack127labs/stack127` repository owns only the private stack127 website, its database workflows, and its private infrastructure.

Applications, tools, and datasets owned by stack127 are independent Git repositories. Each external repository is its own source of truth. The private repository does not contain a working copy, nested checkout, submodule, subtree, or runtime/build dependency for them.

## Registry

| Repository | Visibility | Remote | Default branch | Source of truth | Relationship to private stack127 | Status |
| --- | --- | --- | --- | --- | --- | --- |
| BaseBuddy website | Private | `stack127labs/basebuddy-website` | `self-host-dev` | External private repository | Standalone website and app; no private runtime or build dependency | Active; `7a0a9fa8dda235f4be7d2c467ed90bc1c71b9c70` checked 2026-08-19 |
| BaseBuddy app | Public | `stack127labs/basebuddy` | `main` | Public repository | Standalone open-source app; no private runtime or build dependency | Active; `main` at `2ff50ab454805e498756d1013a1dc2af22acb7fd`; latest tag `v0.2.0` at `dd16eb96e4dac59b194f41e3e2d01472084d9172` checked 2026-08-19 |
| DNS Tools | Public | `stack127labs/dns-tools` | `main` | Public repository | Standalone open-source DNS tools; hosted stack127 pages receive deliberate manual ports only | Active; `main` at `f437732151b4f35888c3b0e758dff79e90b99a24` checked 2026-08-19 |
| Stack127 datasets | Public | `stack127labs/stack127-datasets` | `main` | Public repository | Generated public datasets; source data remains the private database and export workflow | Active; `main` at `701ef491da3db6c2d56c1972671c5dbd38d08ddc` checked 2026-08-19 |

The registry is intentionally documentation-only. It records external repository relationships for agents without recreating their source trees in this repository.

For every external repository, keep these facts current here:

- visibility, remote, and default branch;
- the source-of-truth repository;
- whether the project is standalone or manually ported into a private surface;
- the last verified release/tag and exact commit SHA;
- the corresponding private website release/commit when a manual port exists;
- the last verification date, quality command, and known limitations.

Do not invent a release or revision when it has not been checked. Use `unknown` until the external repository is inspected.

## Homelab workflow

Clone external repositories beside, not inside, the private checkout:

```bash
cd /home/teja/projects
git clone --branch self-host-dev https://github.com/stack127labs/basebuddy-website.git basebuddy-website
git clone https://github.com/stack127labs/basebuddy.git basebuddy
git clone https://github.com/stack127labs/dns-tools.git dns-tools
git clone https://github.com/stack127labs/stack127-datasets.git stack127-datasets
```

Run each project's own install, tests, quality gates, deployment commands, and Git operations from its separate checkout. Do not run external-repository commands from `/home/teja/projects/stack127`.

## Cross-repository boundaries

- An external repository must not import private stack127 code, environment files, database credentials, analytics, deployment configuration, or private documentation.
- The private website must not import an external repository at runtime or during its normal build.
- Similar functionality in both projects is allowed only as an intentional, separately maintained copy.
- When porting a fix or feature, record the source repository, release/tag, exact commit SHA, destination private commit, and verification date in the relevant project notes.
- External repository CI and releases remain owned by that repository. The private site may link to them but does not publish or deploy them implicitly.

## Version and compatibility tracking

Use both human-readable releases and immutable revisions:

| Project | Release/tag | External commit | Private website release/commit | Last verified | Compatibility note |
| --- | --- | --- | --- | --- | --- |
| BaseBuddy website | no tags | `7a0a9fa8dda235f4be7d2c467ed90bc1c71b9c70` | Not applicable | 2026-08-19 | Standalone private source |
| BaseBuddy app | `v0.2.0` | `dd16eb96e4dac59b194f41e3e2d01472084d9172` (tag); `2ff50ab454805e498756d1013a1dc2af22acb7fd` (`main`) | Not applicable | 2026-08-19 | Standalone public source |
| DNS Tools | no tags | `f437732151b4f35888c3b0e758dff79e90b99a24` (`main`) | Record per manual port | 2026-08-19 | No runtime/build dependency |
| Stack127 datasets | no tags | `701ef491da3db6c2d56c1972671c5dbd38d08ddc` (`main`) | Generated from private export workflow | 2026-08-19 | Public output; private data source |

Never use a version number without its commit SHA when recording a cross-repository port. A tag can move or be interpreted differently; the SHA is the reproducible reference.

## Creating or updating an external repository

1. Create or clone the external repository outside this checkout under `/home/teja/projects/`.
2. Make and test changes in that repository's own branch.
3. Tag or release the change when appropriate and record its commit SHA here.
4. If the private website needs related behavior, port it deliberately into the private repository and record both revisions.
5. Run the private website's normal quality gates separately.
6. Push each repository only through its own reviewed workflow and explicit user approval.

There is no `repos/` source-tree directory in the private stack127 repository. Temporary clones may be used for review or export work, but they must live outside the repository or under an ignored temporary directory and must never become a private source copy.
