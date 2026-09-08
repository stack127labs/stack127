# Brief: RAIDZ Expansion Planner

## Who is here

A ZFS administrator has one healthy RAIDZ vdev and is considering adding one or more disks with OpenZFS RAIDZ Expansion. They know their RAIDZ level, current width, smallest member size, and current physical allocation, but they need to understand the capacity they can use after each expansion and why it differs from a freshly created wider vdev.

## The job

They leave with a step-by-step expansion plan that shows modeled logical capacity before expansion, immediately after every one-disk addition, and at fresh final-width efficiency. They also leave knowing that parity does not change, old blocks keep their original geometry, and live accounting commands can report a different or pessimistic value. They do not leave with an expansion-time estimate, a safety verdict, or a command-ready device plan.

## Show vs say

- The live tool is the page's primary visual. Its full-width workbench keeps current geometry, final width, member and added-disk sizes, current physical allocation, representative block size, `ashift`, and the explicit `Plan expansion` action together.
- The result begins with the modeled capacity gained immediately and the unchanged RAIDZ level. Current, immediate final, fresh final, and geometry-gap values sit together and reported capacity is explicitly unknown.
- One exact proportional bar divides the fresh final logical envelope into old logical payload, immediately writable new data, and the geometry gap. Adjacent values remain authoritative for tiny or zero segments.
- A compact table or narrow-screen timeline shows every sequential one-disk width with immediate envelope, gain, fresh comparator, and gap. The tool does not imply that several disks attach in one command.
- A calculation disclosure carries the exact sector and integer derivation, representative-block assumption, occupancy remainder, formula version, and dated OpenZFS sources.
- A small concept table after the tool distinguishes reflow, rewrite, and reported accounting. A compact preflight table carries OpenZFS 2.3+, the feature flag, healthy-vdev requirement, new-disk size, unchanged parity, and excluded operations.
- Sentences are limited to the page promise, why old and new blocks differ, why a live reported-capacity number is not predicted, what the representative block-size model excludes, and which adjacent stack127 tool answers whole-pool or block-padding questions.
- There is no marker art or screenshot. The exact final-width composition and expansion-step table explain the important relationship directly.
