# Brief: ZFS Block Size and Padding Calculator

## Who is here

A ZFS administrator is choosing or diagnosing a dataset `recordsize` or zvol `volblocksize` on a known RAIDZ vdev. They already know their RAIDZ level and member count, but need to see why one logical block consumes more physical space than expected.

## The job

They leave with the exact theoretical allocation for one uncompressed block: logical bytes, sector rounding, parity, padding, physical bytes, and efficiency. They can compare nearby block sizes, audit the integer math, and share the configuration without mistaking the answer for whole-pool capacity or a universal recommendation.

## Show vs say

- The tool UI is the page's primary visual. Five visible controls set RAIDZ level, vdev width, workload terminology, logical block size, and `ashift`, followed by one persistent `Calculate allocation` action.
- The result starts with one large physical-allocation value and its logical-block efficiency. A labeled exact allocation bar separates logical data, sector rounding, parity, and padding without relying on color alone.
- A compact table compares the selected power-of-two block size with up to two lower and two higher valid sizes. It shows physical allocation and efficiency but never labels a winner or optimum.
- One calculation disclosure carries exact divisions, remainders, round-up steps, formula version, assumptions, and source links. Copy and share follow the evidence. Reset stays beside Calculate so it appears only once.
- Sentences are reserved for the later manual content stage: what `recordsize` and `volblocksize` mean, why RAIDZ padding appears, why space efficiency is not workload advice, and what the block model excludes.
- The existing ZFS pool capacity calculator gets an internal link in that later content instead of being duplicated here. There is no marker art or screenshot because the live exact visualization is the clearest medium.
