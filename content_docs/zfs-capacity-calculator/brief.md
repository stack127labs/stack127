# Brief: ZFS Pool Capacity Calculator

## Who is here

A homelab or NAS builder is planning a fresh OpenZFS pool before buying drives or assigning devices. They know the mirrors or RAIDZ groups they want, but need a trustworthy view of mixed-vdev capacity, block allocation, slop, auxiliary roles, and failure boundaries.

## The job

They leave with an estimated writable physical capacity, a separate planning target, and an auditable explanation of where every entered data-device byte goes. They can see each top-level vdev and its failure boundary, include spare, SLOG, L2ARC, and special inventory without miscounting it, and copy a conservative dry-run command. They do not leave with a promise of installed dataset free space, performance, or an exact result for an already-expanded pool.

## Show vs say

- The tool UI is the page's dominant visual. A clean visit starts with an empty topology editor, an obvious `Add data vdev` action, a fast equal-drive setup, an individual `Add drive` action, and one always-visible explicit `Calculate pool` action.
- Data vdevs appear as flat topology groups with individual drive rows. Each row keeps identity, capacity, unit, and removal aligned on desktop and narrow mobile. Vdev controls add, duplicate, remove, and keyboard-reorder whole failure domains.
- The answer starts with equally visible estimated writable physical data and planning target. Per-vdev topology rows keep each capacity contribution beside its own failure boundary.
- One exact proportional bar uses semantic colors to show how entered data-device capacity divides into writable data, slop, mirror or parity cost, RAIDZ allocation loss, mixed-size waste, alignment, and tails. An exact accounting table carries nonzero values while zero categories stay available behind a disclosure.
- A separate role table shows hot spare, SLOG, L2ARC, and mirrored special inventory. Special capacity is an envelope with a permanence caveat, never a general-capacity segment.
- A code block shows a placeholder-only `zpool create -n` preview with copy controls. Formula version, dated sources, assumptions, and the selected all-blocks-at-this-size model sit in compact result details.
- Sentences are limited to the page promise, the distinction between estimate and installed free space, the block-size and slop caveats, special-vdev permanence, compression uncertainty, expansion history, and the dry-run safety boundary.
- There is no marker art or screenshot. Exact topology, capacity, and command output are better carried by the live tool, bar, tables, and code block.
