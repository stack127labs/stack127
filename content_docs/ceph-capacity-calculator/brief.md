# Brief: Ceph Capacity and Failure-Domain Planner

## Who is here

A homelab operator or small-cluster administrator is comparing Ceph pool layouts before buying drives or writing a CRUSH rule. They know the OSD count and approximate capacities, but need to see whether their chosen replication or EC profile fits the physical failure domains.

## The job

They leave with a modeled usable-capacity number, an explicit planning target, the minimum and entered failure-domain counts, and a largest-domain-loss view that makes degraded placement visible.

## Show vs say

The tool UI owns the page: protection mode, profile inputs, repeatable OSD batches, explicit planning reserve, and the answer-first result. The result uses an exact capacity-composition bar and an exact domain inventory table. A short supporting guide uses one comparison table for replicated versus EC profiles, then a few sentences for CRUSH boundaries, small-object and live-cluster limits, privacy, and the next verification commands. No marker art is needed because the live topology and exact accounting are the useful visual explanation. No performance chart, PG dashboard, export panel, or FAQ is justified for this job.
