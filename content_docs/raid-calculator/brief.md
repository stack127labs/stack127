# Brief: RAID Capacity and Level Explorer

## Current supporting-content direction

Approved September 6, 2026. Preserve the comparison and topology reasoning, consolidate duplicate FAQ content into the relevant sections, and end with platform verification, backup limits, and actual URL-sharing behavior.

The working tool stays first. Follow `stack127_docs/writing-style.md` for writing and visual choices. Store live copy only in the development tool-page row through the reviewed content command. Publication remains a separate operation.

## Who is here

Someone has a set of equal or mixed-size drives and wants to know what a conventional RAID layout would make usable before creating an array. They understand drive sizes and RAID names, but may not know how nested groups or mixed capacities change the answer.

## The job

They leave with an exact theoretical capacity breakdown, a visible topology, the capacity lost to redundancy and size mismatch, the layout's failure boundary, and enough context to reject an invalid configuration. They do not leave with a filesystem capacity promise or a performance prediction.

## Show vs say

- A clean visit shows an empty drive inventory. Add drive is available immediately and adds exactly one blank editable row, so equal and mixed-capacity arrays use the same input model.
- Drives stay as one-line inventory rows with capacity, unit, optional group placement, and removal kept in stable columns at every width. The inventory never needs to be revealed by another action.
- Editing RAID level, a drive, grouping, adding a drive, or removing a drive hides the stale answer. Show result remains the one explicit calculation action for the current inventory.
- The answer makes theoretical usable capacity the strongest result, with the output unit control attached to it.
- A precise segmented allocation bar shows usable, redundancy, and size mismatch as parts of raw capacity. A compact exact-value list carries the numbers beside it.
- An exact topology strip groups drives into stripes, mirrors, or nested RAID groups without nested cards.
- Failure tolerance and the classic small random write reference are compact result facts, not explanatory sections.
- A compact comparison table carries minimum drives, failure tolerance, and the classic small random write reference across RAID levels.
- Sentences explain only the smallest-member model, topology-dependent failure tolerance, filesystem and unit boundaries, why RAID is not backup, and the common questions that need a direct judgment.
- There is no marker art. The result uses an exact dynamic allocation bar, a compact value list, the topology strip, and the comparison table because those are faster to scan than prose.
