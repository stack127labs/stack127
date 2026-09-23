# Brief: ZFS Pool Capacity Calculator

## Current supporting-content direction

Approved September 6, 2026. Define vdevs before relying on them, explain input grouping and representative block assumptions, retain the role tables, then clarify slop, headroom, special-vdev permanence, and real-pool limits.

The working tool stays first. Follow `stack127_docs/writing-style.md` for writing and visual choices. Store live copy only in the development tool-page row through the reviewed content command. Publication remains a separate operation.

## Who is here

A homelab or NAS builder is planning a fresh OpenZFS pool before buying drives or assigning devices. They know the mirrors or RAIDZ groups they want, but need a trustworthy view of mixed-vdev capacity, block allocation, slop, auxiliary roles, and failure boundaries.

## The job

They leave with an estimated writable physical capacity, a separate planning target, and an auditable explanation of where every entered data-device byte goes. They can see each top-level vdev and its failure boundary, include spare, SLOG, L2ARC, and special inventory without miscounting it, and copy a conservative dry-run command. They do not leave with a promise of installed dataset free space, performance, or an exact result for an already-expanded pool.

## Show vs say

- The tool UI is the page's dominant visual. A clean visit starts with an empty topology editor, an obvious `Add data vdev` action, a fast equal-drive setup, an individual `Add drive` action, and one always-visible explicit `Calculate pool` action.
- Data vdevs appear as flat topology groups with individual drive rows. Each row keeps identity, capacity, unit, and removal aligned on desktop and narrow mobile. Vdev controls add, duplicate, remove, and keyboard-reorder whole failure domains.
- The answer starts with one dominant estimated writable physical capacity. The planning target and optional logical scenario stay secondary. A table keeps each vdev contribution beside its own failure boundary.
- One exact proportional bar uses labelled categorical colors to show how entered data-device capacity divides into writable data, slop, mirror or parity cost, RAIDZ allocation loss, mixed-size waste, alignment, and tails. The legend keeps exact values visible, including zero categories, so a second accounting table would only repeat the same facts.
- A separate role table shows hot spare, SLOG, L2ARC, and mirrored special inventory. Special capacity is an envelope with a permanence caveat, never a general-capacity segment.
- A code block shows a placeholder-only `zpool create -n` preview with copy controls. Formula version, dated sources, assumptions, and the selected all-blocks-at-this-size model sit in compact result details.
- Sentences are limited to the page promise, the distinction between estimate and installed free space, the block-size and slop caveats, special-vdev permanence, compression uncertainty, expansion history, and the dry-run safety boundary.
- There is no marker art or screenshot. Exact topology, capacity, and command output are better carried by the live tool, bar, tables, and code block.
