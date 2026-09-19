Status: ready
Tool: Restic retention simulator
Route: /restic-retention-simulator
Direct competitors reviewed: 5
Saturation exception: yes

## Research scope

Queries tried: `restic forget simulator`, `restic retention calculator`, `restic keep-daily visualizer`, and `restic prune preview`.

Repeated domains: restic.readthedocs.io, forum.restic.net, github.com, and backup product documentation.

Exclusions: repository clients that only run a prune command, generic backup calculators, and paid dashboards without a public retention explanation.

## Search intent

| Query job | User wording | Desired answer | Current gap |
|---|---|---|---|
| Preview retention | restic forget preview | Which snapshots remain | Most results require a repository |
| Explain buckets | restic keep daily weekly | Why a snapshot was kept | Rules are documented but not visualized |
| Compare policies | restic retention calculator | Difference between policies | No small browser simulator found |
| Avoid deletion mistakes | restic forget safe test | A dry-run style explanation | Existing tools stop at command syntax |

## User pain evidence

| Repeated problem | Evidence | Product implication |
|---|---|---|
| Users misread keep-daily boundaries | [Observed] https://forum.restic.net/t/confusion-about-keep-daily-option/7888 | Show calendar buckets and timezone explicitly |
| Users see fewer snapshots than expected | [Observed] https://forum.restic.net/t/too-few-snapshots-with-restic-forget-keep-weekly/10896 | Explain each selected rule and group |
| Users need a safe preview before deleting | [Documented] https://restic.readthedocs.io/en/stable/060_forget.html | Keep the tool offline and never mutate a repository |

## Technical truth to verify

| Claim | Source | Verification decision |
|---|---|---|
| Retention rules select snapshots by time buckets | [Documented] https://restic.readthedocs.io/en/stable/060_forget.html | Implement newest snapshot per local bucket |
| Grouping changes which rules see a snapshot | [Documented] https://restic.readthedocs.io/en/stable/060_forget.html | Make host, path, and tag grouping an explicit input |
| JSON output is suitable for scripting | [Documented] https://github.com/restic/restic/blob/master/doc/075_scripting.rst | Accept a narrow snapshot JSON contract |

## Competitor reviews

### Competitor 1: restic forget documentation

URL: https://restic.readthedocs.io/en/stable/060_forget.html

[Documented] It defines keep-last, keep-hourly, keep-daily, keep-weekly, keep-monthly, and keep-yearly rules. [Documented] It describes grouping by host, paths, and tags. [Observed] It gives command examples rather than an interactive preview. [Inferred] A user must mentally map timestamps to buckets. [Unknown] It does not provide a browser simulator.

```text
command flags -> terminal output -> user interprets buckets
```

### Competitor 2: restic scripting documentation

URL: https://github.com/restic/restic/blob/master/doc/075_scripting.rst

[Documented] JSON output is intended for scripts. [Documented] Snapshot records include time and identity metadata. [Observed] The page assumes scripting skill. [Inferred] It is a strong input source for a local simulator. [Unknown] It does not show a policy comparison view.

```text
repository command -> JSON -> custom script -> custom report
```

### Competitor 3: Proxmox Backup Server prune simulator

URL: https://pbs.proxmox.com/docs/prune-simulator/

[Observed] The simulator presents retention controls and a snapshot list. [Documented] It models prune policies for PBS. [Observed] It is tied to PBS terminology. [Inferred] Restic users need a separate rule model. [Unknown] It does not accept restic JSON.

```text
policy controls -> PBS snapshots -> keep/delete preview
```

### Competitor 4: restic forum answers

URL: https://forum.restic.net/t/too-few-snapshots-with-restic-forget-keep-weekly/10896

[Observed] Replies explain surprising weekly results. [Documented] The discussion points back to official forget semantics. [Observed] Examples are conversational and fragmented. [Inferred] A worked table would reduce repeated questions. [Unknown] There is no maintained visual tool attached.

```text
question -> forum replies -> user reconstructs policy outcome
```

### Competitor 5: generic backup retention calculators

URL: https://www.backup4all.com/en/backup-retention-policy.html

[Observed] Generic calculators discuss retention planning. [Documented] They use business policy language. [Observed] They do not parse restic snapshots. [Inferred] Technical users need an evidence-level simulator instead. [Unknown] Exact restic grouping support is absent.

```text
business inputs -> generic recommendation -> no restic snapshot trace
```

## Comparison matrix

| Capability | Docs | PBS simulator | Forum | Generic calculator | Proposed tool |
|---|---|---|---|---|---|
| Paste restic snapshot JSON | No | No | No | No | Yes |
| Keep rule explanation | Partial | Yes | Partial | No | Yes |
| Group by host/path/tag | Yes | PBS-specific | Partial | No | Yes |
| Per-snapshot reason | No | Yes | No | No | Yes |
| Offline and non-mutating | Yes | Yes | Yes | Yes | Yes |

## Formula and data disagreements

The official documentation uses calendar buckets and repository-local time. A browser tool cannot infer a repository timezone from plain JSON, so the contract requires an explicit IANA timezone and labels the result as a model. Snapshot grouping can differ when paths or tags are normalized; the implementation keeps the supplied strings stable and documents that choice.

## Evidence-backed opportunities

Build a local JSON paste surface with a one-click policy preview, calendar bucket labels, and rule reasons. Let users switch grouping and timezone without network calls. Include a compact policy comparison so the page earns long-tail searches around “restic forget keep weekly” while avoiding a generic backup dashboard.

## Sources

- https://restic.readthedocs.io/en/stable/060_forget.html
- https://github.com/restic/restic/blob/master/doc/075_scripting.rst
- https://forum.restic.net/t/confusion-about-keep-daily-option/7888
- https://forum.restic.net/t/too-few-snapshots-with-restic-forget-keep-weekly/10896
- https://pbs.proxmox.com/docs/prune-simulator/
