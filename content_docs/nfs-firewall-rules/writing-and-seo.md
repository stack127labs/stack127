# Writing and SEO plan: NFS Firewall Rules Planner

Follow `stack127_docs/writing-style.md` for all writing, visual choices, and SEO wording.

Status: ready
Tool: NFS Firewall Rules Planner
Route: `/nfs-firewall-rules`
Depends on: `competitive-report.md`, `implementation-report.md`, `edge-cases-and-tests.md`, `brief.md`
SERP checked: 2026-08-09
Primary medium: Tool UI

## Search intent

| Priority | Query family | Immediate job | Expected result shape | Page response |
| --- | --- | --- | --- | --- |
| Primary | `NFS firewall rules planner`, `NFS firewall rules calculator` | Identify the inbound listener rules for one NFS server or client host | Version-specific listener table plus bounded firewall syntax | The tool separates protected endpoint, fixed ports, locally verified ports, source CIDR, and verification |
| Close | `which ports open firewall NFSv3 NFSv4` | Understand why NFSv4 can be one server listener while NFSv3 needs RPC helpers | Exact version and endpoint comparison | The result table and static branch table separate v3, v4.0, and v4.1+ |
| Close | `NFSv3 mountd lockd statd firewall ports` | Turn locally assigned RPC listeners into narrow rules without copying example ports | Incomplete state until verified values are supplied | The tool shows only fixed known rows while helper ports are missing and emits no commands |
| Close | `nftables NFS firewall rules`, `UFW NFS firewall rules`, `firewalld NFS source subnet` | Translate one complete neutral plan into the selected host firewall syntax | Source-scoped rule fragments with deployment boundaries | The tool emits firewalld rich rules, UFW commands, or existing-chain nftables expressions |

### Post-build search and competitor check

- Google exact-planner, version-and-ports, and nftables-helper searches on 2026-08-09 showed documentation, Q&A, and distro-specific guides rather than a direct NFS host-firewall planner.
- Bing exact-planner and mount-timeout searches on 2026-08-09 showed guide, documentation, troubleshooting, and generic simulator shapes.
- A fresh Browser re-review of OneUptime, Baeldung, and Simplified Guide on 2026-08-09 confirmed that none combines IPv6, NFSv4.0 client callbacks, server-versus-client firewall placement, verified NFSv3 helper ports, and three bounded firewall translations in an interactive result.
- The finished planner closes that approved gap. No P0 or P1 competitive omission remains inside the host-firewall scope.

### Intent not targeted

- General NFS setup, export configuration, permissions, SELinux, identity mapping, DNS, or mount troubleshooting: these need real host and service state that the planner does not inspect.
- Routed firewalls, cloud security groups, pfSense, OPNsense, iptables, port forwarding, NAT, or appliance ACLs: launch scope is one stateful Linux host firewall.
- Automatic port discovery, firewall scanning, configuration application, or security audit: the page accepts user-verified facts and returns review fragments only.
- NFS over RDMA or TLS, Kerberos and RPCSEC_GSS, pNFS, clustered servers, containers, and vendor NAS services: these require additional topology and protocol inputs.

## Page promise

Choose the NFS version, protected Linux host, peer CIDR, and firewall to produce a reviewable inbound-listener plan. NFSv3 commands remain unavailable until every local helper port is verified, and no result claims that the real firewall, export, or mount works.

## Content completeness map

| User question | Where answered | Medium | Evidence | Repetition guard |
| --- | --- | --- | --- | --- |
| What is the tool and who is it for? | H1 introduction | Sentences | `brief.md`; primary intent | Define one host-firewall planning job once |
| Which inputs, modes, sources, or scope choices matter? | Tool groups and `What changes between NFSv3 and NFSv4` | Tool UI and Table | Implementation input and branch contract | Do not narrate each radio or field |
| How should someone choose meaningful inputs and use it for the real task? | `Verify NFSv3 helper ports on the protected host` | Sentences | RHEL 9 NFS procedures; `nfs.conf(5)` | Explain where facts come from, not button clicks |
| How should the result and its important terms or uncertainty be interpreted? | Dynamic listener table and `Treat the output as a review plan` | Exact result visualization and Sentences | Formula contract; result fixtures | Do not repeat each result row or command |
| Which concepts, syntax, ordering, or edge cases commonly surprise users? | Version table, dynamic incomplete state, and result boundaries | Table, Tool UI, Exact result visualization | RFC 7530, RFC 8881, RHEL 9, firewall docs | Keep fixed values and local assignments visibly separate |
| What does the tool not inspect, calculate, prove, recommend, or guarantee? | `What the planner cannot verify` | Sentences | Product non-goals and exclusions | One compact boundary section, no warning wall |
| How are user inputs handled? | H1 introduction and limitation section | Sentences | Static privacy tests and implementation R20 | Scope the claim to current browser calculation only |
| What should the reader verify or do next? | Dynamic verification list and final limitation section | Exact result visualization and Sentences | Implementation verification contract | Do not duplicate the rendered command sequence |

## Heading and media outline

| Order | Level and proposed heading | User question | Takeaway, not draft prose | Medium | Evidence | Limit/repetition guard | Writer section ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | H1: `NFS Firewall Rules Planner` plus short introduction | What does this page produce? | Name server-or-client host scope, result table and firewall fragments, local calculation, and no-live-inspection boundary | Sentences | `brief.md`; implementation R1 and R20 | Prose. | COPY-01 |
| 2 | Interactive planner | Which facts change the plan? | Collect version, protected host, firewall family, address family, peer CIDR, transport, and branch-specific verified ports | Tool UI | Implementation input contract | Tool stays before supporting content; no click instructions | n/a |
| 3 | Dynamic listener plan | Which inbound listeners fit this scenario? | Return invalid, incomplete, ready, or no-additional-rule; show endpoint, source, protocol, port, and provenance without guessing | Exact result visualization | Implementation and test contract | Do not restate rows below the tool | n/a |
| 4 | H2: `What changes between NFSv3 and NFSv4` | Why is the port set different? | Compare protected host, version, fixed listener, verified listener, and callback boundary in repeated rows | Table | RFC 7530, RFC 8881, RHEL 9 NFS docs | Four compact rows; no commands or helper-port examples | n/a |
| 5 | Incomplete NFSv3 state | What happens before every helper port is known? | Show protocol-fixed rows and exact missing facts, with no translation or copy | Exact result visualization | Implementation R10; FF-010 | Keep recovery beside the missing fields | n/a |
| 6 | H2: `Verify NFSv3 helper ports on the protected host` | Where do mountd, statd, and lockd values come from? | Use local configuration and active listener evidence; dynamic examples are not defaults; incomplete plans intentionally withhold syntax | Sentences | RHEL 9; `nfs.conf(5)`; competitive evidence | Prose. | COPY-02 |
| 7 | Firewall translation | What syntax can be reviewed after the neutral plan is complete? | Show source-scoped commands or expressions under the selected firewalld, UFW, or nftables boundary | Exact result visualization | Implementation R12 to R14 | No apply button or universal context | n/a |
| 8 | H2: `Treat the output as a review plan` | What do fixed, user verified, and firewall translation mean? | Explain the neutral table first, source scope, firewalld zone context, UFW IPv6 boundary, and existing-chain nftables fragment | Sentences | Firewalld, UFW, Netfilter docs; implementation R12 to R15 | Do not narrate visible rows. | COPY-03 |
| 9 | Verification list and formula provenance | What should be checked next and which contract produced the result? | Keep version-pinned mount, listener, firewall, and negotiated-option checks with formula version and source date | Exact result visualization | Implementation R15 and R20 | Do not repeat the sequence in prose | n/a |
| 10 | H2: `What the planner cannot verify` | What still needs checking on real hosts? | State no live inspection, application, routing, export, permissions, SELinux, identity, or reachability proof; calculation stays in current browser; use rendered verification steps | Sentences | Product non-goals, privacy tests, RHEL verification path | Prose. | COPY-04 |

No marker art, screenshot, chart, FAQ, methodology section, universal port list, or full NFS tutorial is justified. The exact listener table, version comparison table, command block, and verification list carry the technical relationships.

## Formula explanation

| Concept | What the reader needs | Presentation | Example/source | Caveat placement |
| --- | --- | --- | --- | --- |
| Protected endpoint | A server firewall and client firewall expose different inbound listeners | Tool selection and dynamic endpoint column | RHEL 9 server and client procedures | In COPY-01 and beside the result table identity |
| NFSv4 server path | v4.0 and v4.1+ servers use TCP/2049 for ordinary client traffic | Version table and result | RFC 7530 and RFC 8881 | v4.0 client callback is a separate row, not implied coverage |
| NFSv4 callback path | v4.0 can require a verified client callback listener; v4.1+ uses the client-established session | Version table and no-additional-rule result | RFC 7530, RFC 8881, RHEL 9 client docs | Keep the stateful host-firewall assumption beside the claim |
| NFSv3 helpers | rpcbind and NFS have fixed registered ports in the model; mountd, statd, lockd, and optional rquotad depend on local verified facts | Dynamic incomplete/ready result and COPY-02 | RHEL 9 and `nfs.conf(5)` | Never publish example helper ports as defaults |
| Translation boundary | The neutral table is independent of firewall syntax; firewalld needs a zone, UFW needs correct IPv6 configuration, and nftables output needs an existing inet input chain | Dynamic translation and COPY-03 | Official firewall docs | Call output review fragments, never apply scripts |
| Formula provenance | Dependency branches and output syntax are pinned to `nfs-firewall-plan-v1` and source date 2026-08-09 | Quiet result provenance | Implementation report and primary source ledger | Re-review fixtures when protocol branches or command syntax change |

## Metadata proposal

- Registry label: `NFS firewall planner`
- Meta title: `NFS Firewall Rules Planner for v3 and v4`
- Meta description: `Plan source-scoped NFSv3 or NFSv4 host-firewall listeners for firewalld, UFW, or nftables. Verified helper ports are required for NFSv3.`
- Page type: `WebApplication`
- Publication recommendation: `Keep unpublished until final page QA and explicit publication approval update the central registry.`

## Internal links

| Direction | Destination | Reader reason | Anchor intent | Placement |
| --- | --- | --- | --- | --- |
| Out | `/privacy` | Understand stack127's sitewide handling boundaries after the page-local statement | `privacy policy` | Final limitation section |
| Out | `https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_using_network_file_services/deploying-an-nfs-server_configuring-and-using-network-file-services` | Verify current server-side NFS services, assigned ports, and real host setup | `RHEL NFS server documentation` | COPY-02 source note |
| Out | `https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_file_systems/mounting-nfs-shares_managing-file-systems` | Verify client-side NFSv3 and NFSv4 callback behavior | `RHEL NFS client documentation` | Version table source note |
| Out | `https://man7.org/linux/man-pages/man5/nfs.conf.5.html` | Find the local mountd, statd, and lockd configuration keys | `nfs.conf manual` | COPY-02 |

No existing stack127 page directly continues this host-firewall planning job. Do not add an unrelated collection link only for link count.

## Manual prose handoff

### Sections reserved for later manual writing

| Section ID | Heading | Purpose | Required facts and sources | Planned format | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | H1 introduction | Define the scenario, output, local handling, and live-system boundary | `brief.md`; implementation R1 and R20 | Prose. | No best, secure, correct, complete-network, scan, or apply claim |
| COPY-02 | `Verify NFSv3 helper ports on the protected host` | Explain why helper ports cannot be universal defaults and where to verify them | RHEL 9 server/client docs; `nfs.conf(5)`; implementation step 5 | Prose. | No example port values, distro setup tutorial, or button narration |
| COPY-03 | `Treat the output as a review plan` | Explain the table-first model and the selected syntax boundary | Firewalld rich language, UFW manual, Netfilter sets/families; R12 to R15 | Prose. | No command repetition, application claim, or recommendation of a firewall family |
| COPY-04 | `What the planner cannot verify` | State the real-system and topology exclusions, privacy boundary, and next check | Product non-goals/exclusions; privacy tests; rendered verification contract | Prose. | No guarantee, security audit claim, broad legal/privacy promise, or duplicated verification steps |

### Page constraints

- Call the output a plan or review fragment, never an applied, secure, reachable, or working firewall configuration.
- Keep NFSv4.0 and NFSv4.1-or-later callback behavior distinct.
- Call every NFSv3 helper port user verified or locally assigned. Never present sample values as defaults.

### Tool-build exclusion

`$stack127-tool-build` must not draft or integrate these sections. The later `$stack127-tool-writing` stage owns content integration.

## Source ledger

- RFC 7530: https://www.rfc-editor.org/rfc/rfc7530.html, checked 2026-08-09. Supports NFSv4 registered TCP/2049 and v4.0 callback behavior.
- RFC 8881: https://www.rfc-editor.org/info/rfc8881/, checked 2026-08-09. Supports NFSv4.1 sessions and backchannel behavior.
- RHEL 9 NFS server deployment: https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_using_network_file_services/deploying-an-nfs-server_configuring-and-using-network-file-services, checked 2026-08-09. Supports version dependencies, locally assigned helper ports, and verification.
- RHEL 9 NFS client firewall: https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_file_systems/mounting-nfs-shares_managing-file-systems, checked 2026-08-09. Supports client-side NFSv3 services and v4.0-versus-v4.1 callback behavior.
- Linux `nfs.conf(5)`: https://man7.org/linux/man-pages/man5/nfs.conf.5.html, checked 2026-08-09. Supports mountd, statd, and lockd configuration keys.
- Firewalld rich language: https://firewalld.org/documentation/man-pages/firewalld.richlanguage.html, checked 2026-08-09. Supports source, family, port, protocol, and zone syntax.
- Ubuntu UFW manual: https://manpages.ubuntu.com/manpages/jammy/man8/ufw.8.html, checked 2026-08-09. Supports source-scoped host-ingress syntax and the IPv6 configuration boundary.
- Netfilter nftables sets and families: https://wiki.netfilter.org/wiki-nftables/index.php/Sets, checked 2026-08-09. Supports source matches, destination-port sets, and existing-family expressions.

## Open questions and blockers

- None. The route remains unpublished. Any change to the competitive, implementation, test, or brief artifact invalidates these fingerprints and requires this plan to be reviewed again.
