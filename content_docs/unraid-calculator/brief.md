# Brief: Unraid Main Array Calculator

## Current supporting-content direction

Approved September 6, 2026. Start with data versus parity roles and a capacity example, explain the largest-data-drive requirement, then a proposed larger-drive dependency. Consolidate filesystem limits and keep operational changes in official documentation.

The working tool stays first. Follow `stack127_docs/writing-style.md` for writing and visual choices. Store live copy only in the development tool-page row through the reviewed content command. Publication remains a separate operation.

## Who is here

A homelab builder has mixed HDDs and is deciding which ones should be parity or data in an Unraid Main Array. They understand drive capacities and parity, but need to see the role boundary and the consequence of adding one larger disk later.

## The job

They leave with an array-level data-capacity answer, the exact parity and raw-capacity accounting, the protection boundary for zero, single, or dual parity, and a clear dependency chain when a proposed data disk is larger than the current parity ceiling.

## Show vs say

- The tool UI is the primary visual: one full-width workbench keeps parity mode, explicit parity rows, explicit data rows, one proposed data drive, and the calculation action together.
- The result uses an exact data-versus-parity accounting bar and value table, followed by a role topology that names every drive and capacity. The table stays authoritative for zero or very small segments.
- One proposed drive gets a short topology sequence showing either `add the drive` or `upgrade undersized parity disks, then add the drive`. It is a future scenario, never a hidden part of the current result.
- A compact comparison table carries zero, single, and dual parity protection. A native disclosure carries the exact equation, unit definitions, official sources, and formula version.
- Sentences are limited to the array-level boundary, why explicit roles matter, why filesystem-visible capacity is unknown, why parity is not backup, and what the proposed-drive dependency does and does not model.
- There is no marker art, clean chart, or screenshot. The live role topology, exact accounting visualization, and growth dependency are more useful than decorative media.
