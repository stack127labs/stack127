# Brief: NFS Firewall Rules Planner

## Who is here

A Linux administrator is opening a host firewall for one NFS server or client. They know the NFS version and firewall family, but they need to separate fixed protocol ports from locally assigned RPC helpers and avoid copying a rule for the wrong endpoint.

## The job

Leave with a reviewable listener plan, a clear list of any missing verified ports, a bounded firewall translation when the facts are complete, and an ordered way to test the real hosts.

## Show vs say

The tool UI collects version, protected host, firewall family, address family, peer CIDR, transport, and branch-specific verified ports. The result is an answer-first status followed by one exact service-and-direction table, secondary command fragments, and an ordered verification list. Later supporting sentences explain why NFSv3 needs verified helper ports, why NFSv4.0 and 4.1 differ for callbacks, and what the plan cannot prove. No chart, screenshot, marker art, or FAQ is needed.
