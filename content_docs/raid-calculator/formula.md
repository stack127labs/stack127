# RAID calculator formula contract

Status: version 1 implementation contract

Calculator ID: `raid-capacity`
Calculation version: `1`
Input version: `1`

## Supported layouts

| Layout | Minimum drives | Group rule | Theoretical usable capacity |
| --- | ---: | --- | --- |
| RAID 0 | 2 | One stripe group | `N × smallest member` |
| RAID 1 | 2 | One N-way mirror | `smallest member` |
| RAID 5 | 3 | One parity group | `(N - 1) × smallest member` |
| RAID 6 | 4 | One dual-parity group | `(N - 2) × smallest member` |
| RAID 10 | 4, even | Entered-order mirror pairs | Sum of each pair's smallest member |
| RAID 50 | 6 | At least two equal-count RAID 5 groups | Sum of each group's RAID 5 capacity |
| RAID 60 | 8 | At least two equal-count RAID 6 groups | Sum of each group's RAID 6 capacity |
| Linear | 1 | Concatenated members | Sum of all members |
| JBOD | 1 | Combined members in this array-level model | Sum of all members |

## Mixed-size rule

Every striped or redundant group uses a common component size equal to that group's smallest drive. Capacity above that size is reported as unavailable because of size mismatch. This is a portable planning model, not an emulation of every controller.

Linux md requires a common component size for redundant arrays. Linux md RAID 0 can use implementation-specific layouts for unequal devices, including behavior that changed across kernel versions. Version 1 deliberately does not model those remainder zones. Linear and JBOD use every supplied byte.

For every valid result:

```text
raw capacity = theoretical usable + redundancy + size mismatch
```

The calculator does not subtract array metadata, partition alignment, filesystem metadata, reserved blocks, snapshots, or application-level overhead.

## Nested groups

RAID 10 always uses adjacent two-drive mirror pairs in entered order. RAID 50 and RAID 60 accept a subgroup size. The drive count must divide evenly by that subgroup size, and at least two subgroups must exist.

The topology and subgroup table are part of the result. A nested result without visible grouping is incomplete because both capacity and failure tolerance depend on where drives sit.

## Failure tolerance language

| Layout | Guaranteed tolerance | Best topology-dependent case |
| --- | --- | --- |
| RAID 0 | None | None |
| RAID 1 | Any `N - 1` members | Same |
| RAID 5 | Any one member | One |
| RAID 6 | Any two members | Two |
| RAID 10 | Any one member | One member in every mirror pair |
| RAID 50 | Any one member | One member in every RAID 5 subgroup |
| RAID 60 | Any two members | Two members in every RAID 6 subgroup |
| Linear or JBOD | No array-level redundancy | None |

The page must never display the topology-dependent maximum without its placement condition.

## Small random write reference

The reference counts backend I/O operations for one small random host write under the classic read-modify-write model:

| Layout | Reference |
| --- | ---: |
| RAID 0, Linear, JBOD | 1 |
| RAID 1 | One write to every mirror member |
| RAID 5, RAID 50 subgroup | 4 |
| RAID 6, RAID 60 subgroup | 6 |
| RAID 10 | 2 |

This is an architecture reference, not an IOPS or throughput forecast. Full-stripe writes, caches, controller behavior, queue depth, media, workload, and implementation change observed performance.

## Primary sources

- [Linux kernel RAID array documentation](https://docs.kernel.org/admin-guide/md.html), checked 2026-08-01. It documents RAID personalities, component size, array size, and striped chunk behavior.
- [`mdadm(8)` manual](https://man7.org/linux/man-pages/man8/mdadm.8.html), checked 2026-08-01. It documents supported levels, RAID 10 copy layouts, parity layouts, and the unequal-device RAID 0 compatibility warning.
- [Dell Unity drive IOPS by RAID type](https://www.dell.com/support/manuals/en-us/unity-880f/unity_p_pool_config/drive-iops-by-raid-type?guid=guid-b32204b2-a11b-4f25-b086-e8c135df04f1&lang=en-us), checked 2026-08-01. It documents the classic backend operations for small random writes.
