Status: ready
Tool: LXC ID mapping checker
Route: /lxc-idmap-checker
Direct competitors reviewed: 5
Saturation exception: yes

## Research scope

Queries tried: `LXC idmap checker`, `Proxmox unprivileged container uid mapping`, `lxc.idmap calculator`, and `subuid mapping validator`.

Repeated domains: linuxcontainers.org, forum.proxmox.com, diymediaserver.com, kloknibor.github.io, and Proxmox guides.

Exclusions: copy-paste generators that emit a map without checking grants, full container managers, and generic Unix permission calculators.

## Search intent

| Query job | User wording | Desired answer | Current gap |
|---|---|---|---|
| Check idmap ranges | lxc idmap checker | Are ranges contiguous | Existing pages mostly generate lines |
| Map a host UID | proxmox map uid 1000 | Which host ID is visible | Users calculate offsets by hand |
| Check subuid grant | lxc subuid error | Is `/etc/subuid` sufficient | Generators omit grant validation |
| Debug permission denied | unprivileged lxc idmap | Why access still fails | No single diagnosis table |

## User pain evidence

| Repeated problem | Evidence | Product implication |
|---|---|---|
| Users request an idmap tool | [Observed] https://forum.proxmox.com/threads/lxc-id-mapping-tool.143186/ | Explain ranges and grants together |
| Generators require manual offsets | [Observed] https://diymediaserver.com/page/tools/proxmox-lxc-idmap/ | Add query and coverage checks |
| Mapping rules are easy to misorder | [Documented] https://linuxcontainers.org/lxc/manpages/man5/lxc.container.conf.5.html | Validate order, overlap, and type |

## Technical truth to verify

| Claim | Source | Verification decision |
|---|---|---|
| `lxc.idmap` maps container IDs to host ranges | [Documented] https://linuxcontainers.org/lxc/manpages/man5/lxc.container.conf.5.html | Parse type, container start, host start, length |
| UID and GID mappings are separate | [Documented] https://linuxcontainers.org/lxc/manpages/man5/lxc.container.conf.5.html | Keep independent tables and errors |
| Subordinate ID grants constrain usable ranges | [Documented] https://man7.org/linux/man-pages/man5/subuid.5.html | Check host range coverage when grants supplied |

## Competitor reviews

### Competitor 1: LXC container configuration manpage

URL: https://linuxcontainers.org/lxc/manpages/man5/lxc.container.conf.5.html

[Documented] It defines the `lxc.idmap` syntax. [Documented] It distinguishes user and group mappings. [Observed] It is reference text rather than a checker. [Inferred] A range diagram would shorten debugging. [Unknown] It cannot see a host's grants.

```text
manpage syntax -> operator edits config -> container start reveals error
```

### Competitor 2: Proxmox forum id mapping thread

URL: https://forum.proxmox.com/threads/lxc-id-mapping-tool.143186/

[Observed] Operators ask for an id-mapping tool. [Observed] Replies share scripts and caveats. [Documented] Advice depends on unprivileged container behavior. [Inferred] A static validator can consolidate the common checks. [Unknown] No canonical hosted checker is linked.

```text
forum request -> snippets -> manual edits -> retry container
```

### Competitor 3: DIY Media Server generator

URL: https://diymediaserver.com/page/tools/proxmox-lxc-idmap/

[Observed] It generates mappings from UID and GID inputs. [Observed] It shows copyable output. [Documented] It targets Proxmox users. [Inferred] It does not prove grant coverage or overlap safety. [Unknown] It does not label unsupported kernel state.

```text
UID/GID form -> generated lxc.idmap -> copy into config
```

### Competitor 4: kloknibor id mapper

URL: https://kloknibor.github.io/proxmox-lxc-id-mapper/

[Observed] It provides a browser mapping generator. [Documented] It focuses on offset lines. [Observed] It is useful for construction, not diagnosis. [Inferred] A checker can accept an existing map and explain failures. [Unknown] It does not parse subuid files.

```text
host IDs -> offset calculation -> mapping snippet
```

### Competitor 5: generic Linux subuid documentation

URL: https://man7.org/linux/man-pages/man5/subuid.5.html

[Documented] It describes subordinate UID allocation. [Observed] It does not know LXC map syntax. [Inferred] Users need a combined view of grants and map ranges. [Unknown] It has no per-query result. [Observed] Group grants require a parallel check.

```text
grant file -> administrator interpretation -> no container map trace
```

## Comparison matrix

| Capability | Manpage | Forum | DIY generator | Offset mapper | Proposed tool |
|---|---|---|---|---|---|
| Parse existing idmap lines | Reference | Snippets | No | No | Yes |
| Show container to host ranges | Text | Narrative | Generated | Generated | Yes |
| Detect overlaps and gaps | No | Manual | No | No | Yes |
| Check subuid/subgid grants | No | Partial | No | No | Yes |
| Query a UID or GID | No | No | Input only | Input only | Yes |

## Formula and data disagreements

The map itself is arithmetic, but a valid map still depends on subordinate grants and runtime namespace state. The launch contract treats grants as optional evidence: without them, mapping arithmetic can be valid while grant coverage is unknown. It never claims that a static pass proves container access.

## Evidence-backed opportunities

Build a diagnosis-first checker that ingests the lines operators already have. Lead with a queried UID or GID, then show range arithmetic, gaps, overlaps, and grant coverage. This serves “why is my unprivileged container permission denied” searches while remaining small and offline.

## Sources

- https://linuxcontainers.org/lxc/manpages/man5/lxc.container.conf.5.html
- https://man7.org/linux/man-pages/man5/subuid.5.html
- https://forum.proxmox.com/threads/lxc-id-mapping-tool.143186/
- https://diymediaserver.com/page/tools/proxmox-lxc-idmap/
- https://kloknibor.github.io/proxmox-lxc-id-mapper/
