# Brief: Synology SHR Capacity Calculator

## Current supporting-content direction

Approved September 6, 2026. Explain mixed-drive capacity bands through a verified hypothetical inventory, compare SHR-1 and SHR-2, then separate fresh-pool capacity, system reserve, filesystem space, and existing-pool expansion.

The working tool stays first. Use connected explanation at the depth the task needs, with no word, section, sentence, or visual-ratio quota. This direction supersedes earlier supporting-prose budgets in this page's planning artifacts; it does not change the engine or input contract. Store live copy only in the development tool-page row through the reviewed content command. Publication remains a separate operation.

## Who is here

A homelab builder is planning a Synology NAS with drives already on hand or on a shopping list. They may know that SHR handles mixed sizes, but they need to see how much capacity becomes data, protection, unused space, and system reserve before they commit to a pool.

## The job

They leave with a versioned fresh-pool estimate for SHR-1 or SHR-2, an exact mixed-drive allocation table, a clear fault-tolerance boundary, and a result they can compare in TB and TiB. They do not leave with a promise about an existing pool after expansion, filesystem free space, NAS model compatibility, rebuild time, or backup safety.

## Show vs say

- The tool UI is the main visual: one full-width workbench with visible SHR-1 and SHR-2 choices, individual drive rows, explicit Calculate capacity, Reset, Copy result, and an explicit Share configuration action.
- The result starts with estimated pool capacity after the documented per-drive system reserve, then shows raw capacity, protection, unused space, and fault tolerance. A compact comparison table keeps both SHR modes visible when the inventory supports them.
- One exact allocation bar and one responsive tier table show how each capacity band becomes data, protection, or unused space. The table carries the precise numbers; the bar carries the relationship.
- Supporting content later uses sentences for the fresh-pool boundary, the difference between pool capacity and volume free space, why mixed-drive tiers matter, local handling, and the next Synology verification step. Repeated capacity facts stay in the tool or table.
- No marker art, screenshot, model recommendation, filesystem slider, rebuild estimate, or generic RAID comparison is planned. Those would add assumptions instead of improving the SHR answer.
