Status: ready
Tool: LXC ID mapping checker
Route: /lxc-idmap-checker

## Who is here

Proxmox and Linux container operators mapping host UIDs and GIDs into an unprivileged LXC. They have `lxc.idmap` lines and subordinate ID grants and need to know whether a requested host identity is covered without trial and error.

## The job

Paste idmap lines, subuid or subgid grants, and optional queried IDs. The checker validates contiguous ranges, overlap, and grant coverage, then shows each container range as a host range. It should distinguish a mapping error from a missing host permission.

## Show vs say

Show the first mapping result, a range table, and findings for gaps or overlaps. Show UID and GID separately. Say that the result is a static configuration check; it cannot inspect `/etc/subuid`, kernel user namespaces, or a live container.
