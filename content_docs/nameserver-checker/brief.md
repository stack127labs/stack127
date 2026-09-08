# Brief: Nameserver Delegation Checker

## September 6 content maintenance

Keep the glue and handoff explanation. Qualify what matching lists prove and explain that mismatches can cause intermittent failures. The database remains the only live prose source. Keep the current tool behavior and publication state unchanged.

## Who is here

A domain operator is diagnosing delegation, glue, reachability, or parent-versus-child nameserver disagreement.

## The job

They leave knowing which handoff or server address is responsible and whether UDP, TCP, authoritative SOA, glue, and nameserver sets agree.

## Show vs say

A parent-to-child-to-server chain shows the delegation. Tables carry nameserver sets, address provenance, transport results, SOA evidence, and raw responses. Sentences distinguish required glue, optional sibling glue, skipped IPv6, and shared-network context.
