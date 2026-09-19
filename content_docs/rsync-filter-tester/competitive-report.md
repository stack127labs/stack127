Status: ready
Tool: Rsync filter tester
Route: /rsync-filter-tester
Direct competitors reviewed: 5
Saturation exception: yes

## Research scope

Queries tried: `rsync filter tester`, `rsync include exclude visualizer`, `rsync filter rule checker`, and `rsync dry run exclude explanation`.

Repeated domains: rsync.samba.org, lists.samba.org, variedtools.com, rynctl.com, and FireLinux.

Exclusions: command generators that never evaluate a tree, local shell aliases, and GUI sync products with no filter explanation.

## Search intent

| Query job | User wording | Desired answer | Current gap |
|---|---|---|---|
| Test ordered rules | rsync filter tester | Which rule wins | No focused browser tester found |
| Explain include | rsync include exclude order | Why a file is skipped | Manuals need a concrete tree |
| Check glob scope | rsync wildcard directory | Whether `*` crosses a slash | Generators emit syntax only |
| Debug backup excludes | rsync dry run filter | What is sent or skipped | Dry runs require a local command |

## User pain evidence

| Repeated problem | Evidence | Product implication |
|---|---|---|
| Rule order surprises users | [Documented] https://rsync.samba.org/ftp/rsync/rsync.1 | Display first matching rule and order |
| Include patterns need parent directories | [Observed] https://lists.samba.org/archive/rsync/2006-June/015744.html | Mark unvisited descendants separately |
| Generators stop at command construction | [Observed] https://www.variedtools.com/generate-rsync-command | Add an actual representative tree evaluator |

## Technical truth to verify

| Claim | Source | Verification decision |
|---|---|---|
| Filters are checked in order | [Documented] https://rsync.samba.org/ftp/rsync/rsync.1 | Preserve line order and report first match |
| `*` and `**` have different path scope | [Documented] https://rsync.samba.org/ftp/rsync/rsync.1 | Implement slash-aware glob matching |
| An exclude can prevent traversal | [Documented] https://rsync.samba.org/ftp/rsync/rsync.1 | Return unvisited descendants rather than excluded |

## Competitor reviews

### Competitor 1: rsync manual

URL: https://rsync.samba.org/ftp/rsync/rsync.1

[Documented] It defines include and exclude filter rules. [Documented] It describes first-match behavior. [Documented] It documents `!` and anchored patterns. [Observed] It has no interactive path table. [Inferred] A tree-based tester can make the manual actionable.

```text
syntax reference -> reader guesses match -> shell dry run
```

### Competitor 2: rsync mailing list

URL: https://lists.samba.org/archive/rsync/2006-June/015744.html

[Observed] The thread works through include and exclude ordering. [Documented] It highlights parent traversal behavior. [Observed] The answer is hard to reuse as a test case. [Inferred] Rule traces are a useful product primitive. [Unknown] No maintained visual checker is linked.

```text
real question -> explanation -> user adapts pattern manually
```

### Competitor 3: VariedTools rsync command generator

URL: https://www.variedtools.com/generate-rsync-command

[Observed] It builds an rsync command from form fields. [Observed] It offers include and exclude text. [Documented] Output is a command string. [Inferred] It helps beginners start but cannot show tree outcomes. [Unknown] Rule semantics are not independently tested.

```text
form fields -> generated command -> copy to terminal
```

### Competitor 4: rynctl

URL: https://rynctl.com/

[Observed] It packages rsync workflows for repeat use. [Documented] It focuses on synchronization jobs. [Observed] It is broader than filter debugging. [Inferred] A small checker can serve preflight intent faster. [Unknown] No public per-path rule trace is exposed.

```text
sync job config -> command runner -> transfer result
```

### Competitor 5: FireLinux rsync generator

URL: https://www.firelinux.com/tools/rsync-command-generator/

[Observed] It generates common rsync command variants. [Documented] It includes exclusion flags. [Observed] It does not ingest a file tree. [Inferred] It leaves a gap for checking real backup paths. [Unknown] Pattern edge cases are not shown.

```text
options -> command flags -> no path-level explanation
```

## Comparison matrix

| Capability | Manual | Mailing list | VariedTools | rynctl | Proposed tool |
|---|---|---|---|---|---|
| Paste ordered rules | Yes | Example only | Yes | Yes | Yes |
| Paste representative tree | No | No | No | No | Yes |
| First matching rule trace | No | Narrative | No | Unknown | Yes |
| Unvisited parent diagnosis | Narrative | Narrative | No | Unknown | Yes |
| Offline privacy | Yes | Yes | Browser | Unknown | Yes |

## Formula and data disagreements

Rsync matching depends on transfer root, pattern anchoring, directory markers, and traversal. The launch model accepts normalized relative paths and marks directory entries with a trailing slash. It implements ordered glob evaluation, explicit include/exclude prefixes, and parent traversal; it labels unsupported flags rather than pretending to execute rsync.

## Evidence-backed opportunities

Build the first compact rule-to-path trace for rsync filters. Make the lead result a count of sent, skipped, and unvisited paths, then let each row reveal the winning rule. This targets debugging queries that command generators do not serve and keeps the privacy story simple.

## Sources

- https://rsync.samba.org/ftp/rsync/rsync.1
- https://lists.samba.org/archive/rsync/2006-June/015744.html
- https://www.variedtools.com/generate-rsync-command
- https://rynctl.com/
- https://www.firelinux.com/tools/rsync-command-generator/
