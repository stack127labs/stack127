# stack127 repos

A "stack127 repo" is a repository stack127 owns, normally under the `stack127labs` GitHub organization. Don't confuse it with `public.github_projects`, which stores facts about third-party repositories that directories use.

The private `stack127labs/stack127` repository owns only the private stack127 website, its database workflows, and its private infrastructure.

Apps, tools, and datasets that stack127 owns are independent stack127 repos. Each one is its own source of truth. The private repository holds no working copy, nested checkout, submodule, subtree, or runtime or build dependency for them.

## Registry

| Repository | Visibility | Remote | Default branch | Source of truth | Relationship to private stack127 | Status |
| --- | --- | --- | --- | --- | --- | --- |
| BaseBuddy website | Private | `stack127labs/basebuddy-website` | `self-host-dev` | Separate private repository | Standalone website and app; no private runtime or build dependency | Active; `7a0a9fa8dda235f4be7d2c467ed90bc1c71b9c70` checked 2026-08-19 |
| BaseBuddy app | Public | `stack127labs/basebuddy` | `main` | Public repository | Standalone open source app; no private runtime or build dependency | Active; `main` at `2ff50ab454805e498756d1013a1dc2af22acb7fd`; latest tag `v0.2.0` at `dd16eb96e4dac59b194f41e3e2d01472084d9172` checked 2026-08-19 |
| DNS Tools | Public | `stack127labs/dns-tools` | `main` | Public repository | Standalone open source DNS tools; hosted stack127 pages get deliberate manual ports only | Active; `main` at `f437732151b4f35888c3b0e758dff79e90b99a24` checked 2026-08-19 |
| Stack127 datasets | Public | `stack127labs/stack127-datasets` | `main` | Public repository | Generated public datasets; the source data stays in the private database and export workflow | Active; `main` at `807f61d709da84b14572214f9d214c392315b1f1` checked 2026-09-01 |

The registry records how stack127 repos relate without copying their source trees here. Tool page runtime links and sync state also live in the `stack127_repo_*` columns on `public.stack127_tool_pages`.

Keep these facts current here for every stack127 repo:

- Visibility, remote, and default branch.
- The source-of-truth repository.
- Whether the project is standalone or manually ported into a private surface.
- The last verified release or tag and its exact commit SHA.
- The matching private website release or commit, when a manual port exists.
- The last verification date, quality command, and known limits.

Don't invent a release or revision you haven't checked. Write `unknown` until someone inspects the stack127 repo.

## Separate checkout workflow

Clone stack127 repos beside the private checkout, not inside it:

```bash
cd /home/teja/projects
git clone --branch self-host-dev https://github.com/stack127labs/basebuddy-website.git basebuddy-website
git clone https://github.com/stack127labs/basebuddy.git basebuddy
git clone https://github.com/stack127labs/dns-tools.git dns-tools
git clone https://github.com/stack127labs/stack127-datasets.git stack127-datasets
```

Run each project's install, tests, quality gates, deployment commands, and Git operations from its own checkout. Don't run stack127 repo commands from `/home/teja/projects/stack127`.

## Repository boundaries

- A stack127 repo must not import private stack127 code, env files, database credentials, analytics, deployment config, or private docs.
- The private website must not import a stack127 repo at runtime or during its normal build.
- The same feature can exist in both only as a deliberate copy that each side maintains.
- When you port a fix or feature, record the source repository, release or tag, exact commit SHA, destination private commit, and verification date in the project notes.
- Each stack127 repo owns its own CI and releases. The private site may link to them, but it never publishes or deploys them as a side effect.

## Version and compatibility tracking

Record both readable releases and exact revisions:

| Project | Release/tag | stack127 repo commit | Private website release/commit | Last verified | Compatibility note |
| --- | --- | --- | --- | --- | --- |
| BaseBuddy website | no tags | `7a0a9fa8dda235f4be7d2c467ed90bc1c71b9c70` | Not applicable | 2026-08-19 | Standalone private source |
| BaseBuddy app | `v0.2.0` | `dd16eb96e4dac59b194f41e3e2d01472084d9172` (tag); `2ff50ab454805e498756d1013a1dc2af22acb7fd` (`main`) | Not applicable | 2026-08-19 | Standalone public source |
| DNS Tools | no tags | `f437732151b4f35888c3b0e758dff79e90b99a24` (`main`) | Record per manual port | 2026-08-19 | No runtime or build dependency |
| Stack127 datasets | no tags | `807f61d709da84b14572214f9d214c392315b1f1` (`main`) | Generated from private export workflow | 2026-09-01 | Public output; private data source |

When you record a port between repositories, always give the commit SHA with the version number. A tag can move or be read differently. The SHA always points to the same code.

## Creating or updating a stack127 repo

1. Create or clone the stack127 repo under `/home/teja/projects/`, outside this checkout.
2. Make and test changes on that repository's own branch.
3. Tag or release the change when it makes sense, and record its commit SHA here.
4. If the private website needs the same behavior, port it on purpose and record both revisions.
5. Run the private website's normal quality gates separately.
6. Push each repository only through its own reviewed workflow, with the user's explicit approval.

The private stack127 repository has no `repos/` source tree folder. You can use temporary clones for review or export work. Keep them outside the repository or in an ignored temporary folder, and never let them become a private source copy.

## Automation paths

stack127 repo automation lives here:

```text
scripts/stack127/repos/
  create-tool-repo.mjs
  export-dataset.mjs
  render-readme.mjs
  sync-dataset-repo.mjs

templates/stack127-tool-repo/
```

Durable commands:

```bash
npm run stack127:repo:dataset:export -- --surface self-host-apps --out /tmp/stack127-datasets
npm run stack127:repo:dataset:sync -- --surface self-host-apps --repo stack127-datasets --dry-run
npm run stack127:repo:tool:new -- --slug port-checker --name "Port Checker" --dry-run
```

Dataset exports read verified production data, pick public columns, and sort rows the same way every time. They show a dry-run diff before any reviewed write or push.

Exports must use `.env.database` or an explicit production `--database-url`. They never fall back to `.env.local`.

The tool scaffold is only a starting point. Once created, the new stack127 repo is its own source of truth and uses a separate checkout.

A public tool repo should:

- Link to the flat hosted URL.
- Include Docker and Compose when they fit.
- Document configuration and privacy.
- Keep private stack127 systems out of its source.

## GitHub access

stack127 repos use GitHub as the provider today. GitHub-specific names stay correct for GitHub APIs, URLs, tokens, and CLI commands.

Local automation loads `.env.repos` explicitly. Keep that file uncommitted.

A fine-grained token should give the `stack127labs` organization only the repository permissions the operation needs. Never print token values in logs, diffs, or generated files.

Before running create or push automation, check the active GitHub account, organization access, token expiry, target repository, and requested permissions. Public writes and pushes still need explicit approval.

## Tool sync records

When a hosted tool and a stack127 repo share code, record all four fields on `stack127_tool_pages`:

- `stack127_repo_url`
- `stack127_repo_version`
- `stack127_repo_commit_sha`
- `stack127_repo_synced_at`

Update these fields only after you compare or sync the two implementations. A date you checked the repository isn't a sync date. Never record a version without the exact commit SHA you checked.
