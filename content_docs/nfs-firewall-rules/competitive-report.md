# Competitive report: NFS Firewall Rules Planner

Status: ready
Tool: NFS Firewall Rules Planner
Route: `/nfs-firewall-rules`
Researched: 2026-08-09
Direct competitors reviewed: 5
Saturation exception: yes

## Research scope

### Current stack127 state

The route, route-owned docs, tests, scripts, and engine did not exist at intake. The flat canonical route is locked to `/nfs-firewall-rules`, with source under `app/(site)/(tools)/nfs-firewall-rules/`. The existing opportunity report scored this idea 21/25 and deliberately placed it behind three lower-risk tools because NFSv3 port assignment, distro differences, and firewall consequences make careless command generation unsafe.

The worktree contains extensive user-owned route-flattening and tool work. This page must remain unpublished and route-owned. No registry, publication, or shared route changes are authorized.

The idea passes the stack127 surface decision rule. The answer is a deterministic plan over facts the user supplies: NFS version, transport, address family, client source, firewall position, firewall family, and verified service ports. It does not require a curated vendor database or live scan. It remains useful when it refuses a complete NFSv3 plan until dynamic RPC assignments are verified.

### Method and coverage

The following search shapes were checked in live Google and Bing result pages in the in-app Browser on 2026-08-09:

- exact: `NFS firewall rules planner`;
- job: `which ports open firewall NFSv3 NFSv4`;
- specialist: `nftables NFSv3 mountd lockd statd firewall`;
- pain: `NFS mount timeout firewall rpcinfo ports`;
- generator variation: `NFS firewall rule generator` from the prior opportunity review.

Google returned official distro documentation, the long-running Server Fault question, prose guides, community discussions, and an AI overview. Google marked `planner` as missing from several results. The nftables-specific query degraded into general NFS and generic nftables pages. Bing returned about 52,800 indexed results for the exact phrase and about 2,120 for the timeout query. These are result-density counts, not monthly search volume. Bing's exact results were prose guides and official documentation; its only adjacent interactive result was a generic firewall simulator.

Five closest distinct workflows were opened and inspected at desktop width. Four are NFS-specific guides that users must translate manually. One is an interactive generic firewall rule simulator and was operated with an allow rule for TCP/2049. Mobile behavior was checked at 390 px where the page runtime exposed reliable measurements. No dedicated NFS-aware planner, port-set validator, or cross-firewall rules table appeared in either engine.

Primary technical facts were checked against current RHEL 9 documentation, Linux nfs-utils manual pages, current RFCs, official firewalld documentation, the Netfilter nftables wiki, and Ubuntu's UFW manual and server documentation. Community and guide sources are used only as demand or competitor evidence.

### Search saturation evidence

- Queries tried: `NFS firewall rules planner`, `which ports open firewall NFSv3 NFSv4`, `nftables NFSv3 mountd lockd statd firewall`, `NFS mount timeout firewall rpcinfo ports`, `NFS firewall rule generator`, `NFSv3 firewall ports`, and `NFSv4 port 2049`.
- Repeated domains: Red Hat Documentation, Server Fault, OneUptime, Simplified Guide, Baeldung, vendor documentation, Stack Exchange, and generic Linux blogs repeated across both engines.
- Exclusions: official documentation and RFCs are sources, not competitors; question pages do not calculate a scoped plan; vendor-specific instructions do not generalize across Linux hosts; generic port references omit RPC assignment and directionality; generic firewall generators do not know NFS service dependencies. The five closest distinct workflows exhaust the visible product shapes. Only one is interactive, and it requires the user to already know every rule.

The exception is necessary because there are no five direct standalone NFS planners to inspect. The report therefore treats four NFS instruction workflows and one adjacent interactive firewall planner as the closest workflows and does not claim that five direct competitors exist.

## Search intent

| Intent | Example query | What the user needs now | Current result shape |
| --- | --- | --- | --- |
| Required ports | `which ports open firewall NFSv3 NFSv4` | A version-specific service and port set | AI summary, Q&A, official docs, prose guides |
| Legacy NFS planning | `NFSv3 firewall ports` | Identify and pin dynamic RPC helpers before opening a firewall | Distro instructions and old community recipes |
| Simple NFSv4 path | `NFSv4 port 2049` | Confirm whether one inbound TCP rule is enough | RFCs, vendor docs, short explainers |
| Firewall translation | `nftables NFSv3 mountd lockd statd firewall` | Convert the same verified service set into the local firewall model | Generic nftables docs plus NFS prose; no combined workflow |
| Failure diagnosis | `NFS mount timeout firewall rpcinfo ports` | Distinguish blocked service ports from export or filesystem errors | Troubleshooting guides and question threads |
| Rule generation | `NFS firewall rule generator` | Get a source-scoped reviewable plan without missing callbacks or dynamic ports | Generic generators and articles; no NFS-aware planner |

## User pain evidence

| Repeated problem or question | Evidence | Frequency signal | Product implication |
| --- | --- | --- | --- |
| Users do not know which NFS ports to open | https://serverfault.com/questions/377170/which-ports-do-i-need-to-open-in-the-firewall-to-use-nfs | 915,000 views, ten answers, asked in 2012 and modified in 2025 | Put the version-specific port table before any commands |
| Answers list 111 and 2049 but later comments add mountd, lockd, statd, and rquotad | Same Server Fault thread | Conflicting answers and follow-up comments across 14 years | Show required, conditional, and locally verified services separately |
| NFSv3 mounts time out even when 2049 is reachable | Google and Bing timeout searches; https://serverfault.com/questions/372731/nfs-client-mount-fails-behind-firewall | Repeated troubleshooting result shape across both engines | Explain which phase each service enables and provide ordered verification |
| Users copy fixed ports from another distro or old startup file | Server Fault answers, Baeldung, DevelopnSolve, and Simplified Guide use different ports and files | Multiple incompatible examples in the same result set | Never present example port numbers as discovered facts; require user confirmation |
| Client-side callbacks and status traffic are overlooked | https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_file_systems/mounting-nfs-shares_managing-file-systems | Current official procedure exists, but most guides discuss only the server | Ask where the firewall sits and show server and client listeners separately |
| Generic firewall tools assume the user already knows the full rule set | Browser-operated AllTheSystems simulator on 2026-08-09 | Only adjacent interactive result found | Derive the reviewable NFS service plan first, then translate cautiously |
| Users confuse network reachability with export authorization | Timeout and access-denied discussions in competitor guides | Repeated distinction in troubleshooting pages | End with mount, export, and listener verification; do not claim firewall rules prove access |

## Technical truth to verify

| Claim or formula | Source of truth | Status | Notes |
| --- | --- | --- | --- |
| NFSv4 must support TCP and normally uses registered port 2049 without rpcbind | https://www.rfc-editor.org/rfc/rfc7530.html | Documented | RFC 7530 requires TCP support and explains that registered port 2049 lets NFS transit firewalls without RPC binding |
| NFSv4.1 clients should not use RPC binding protocols and normally use port 2049 | https://www.rfc-editor.org/info/rfc8881/ | Documented | NFSv4.1 sessions can carry callbacks over client-established connections |
| NFSv4.0 can require a separate client callback listener, while NFSv4.1 and later use the pre-existing connection | https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_file_systems/mounting-nfs-shares_managing-file-systems and https://www.rfc-editor.org/info/rfc8881/ | Documented | A planner must distinguish 4.0 from 4.1+ if it discusses client firewall callbacks |
| RHEL 9 requires rpcbind only for NFSv3 and lists lockd and rpc.statd as NFSv3 services | https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_using_network_file_services/deploying-an-nfs-server_configuring-and-using-network-file-services | Documented | `rpc.mountd` also has server-internal NFSv4 responsibilities, but its MOUNT listener is an NFSv3 network concern |
| NFSv3 helper ports can be dynamic and should be fixed before a narrow port firewall plan | https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html-single/securing_networks/index and https://man7.org/linux/man-pages/man5/nfs.conf.5.html | Documented | `[mountd] port`, `[statd] port`, and `[lockd] port` or `udp-port` are configurable; actual listeners still require verification |
| `rpcinfo -p` is the authoritative local check for registered RPC programs and ports | Current RHEL 9 NFS firewall procedure | Documented | The tool can plan verification, but cannot inspect the user's host |
| NFSv3 server-to-client status and lock recovery can require client-side listeners | Current RHEL 9 NFS client firewall procedure | Documented | Host firewall direction is relative to the protected endpoint, not the human concept of upload or download |
| Firewalld rich rules can scope a service or port to a source and family | https://firewalld.org/documentation/man-pages/firewalld.richlanguage.html | Documented | Rule order and zone assignment still matter, so generated lines cannot prove final policy behavior |
| UFW full syntax supports direction, interface, protocol, source, destination, and destination port | https://manpages.ubuntu.com/manpages/jammy/man8/ufw.8.html | Documented | UFW defaults to host ingress when direction is omitted; IPv6 depends on UFW IPv6 configuration |
| nftables can match source address, protocol, and destination-port sets | https://wiki.netfilter.org/wiki-nftables/index.php/Sets and https://wiki.netfilter.org/wiki-nftables/index.php/Nftables_families | Documented | The surrounding table, chain, hook, priority, and default policy are deployment-specific; a fragment cannot safely create them |
| Address family is a rule decision, not a cosmetic label | Firewalld, UFW, and nftables official syntax | Documented | IPv4 CIDRs require `ip saddr`; IPv6 CIDRs require `ip6 saddr`; firewalld rich rules require a matching family when a source address is used |
| Stateful firewalls normally allow reply traffic on an established connection | Ubuntu security firewall documentation and firewall ecosystem docs | Documented | NFSv3 callbacks and server-originated status traffic are not merely replies and need separate endpoint planning |
| rquotad is conditional and may expose quota information to NFS clients | Current RHEL NFS service table | Documented | Do not include it universally; require an explicit quota-service choice and verified port |
| Fixed port examples are not universal defaults | RHEL 9, Oracle Linux, Baeldung, OneUptime, and community pages all use different values | Documented | Product must distinguish user-entered verified values from examples |

## Competitor reviews

### Competitor 1: Baeldung Configuring firewalld for NFS Connections

- URL: https://www.baeldung.com/linux/firewalld-nfs-connections-settings
- Accessed: 2026-08-09 at desktop and 390 px; fully accessible and inspected.
- Audience and promise: [Observed] Linux administrators configuring an NFS server with firewalld.
- Inputs and defaults: [Observed] No interactive inputs. The article fixes a CentOS 7 server/client example, an `nfs-clients` zone, one client IP, and example ports 20048, 32767, and 32765.
- Action and state behavior: [Observed] Sequential copyable commands create a zone, add a source, add services, set fixed ports, reload firewalld, restart services, and test NFSv3 and NFSv4 mounts.
- Results and visuals: [Observed] Command output and failure examples are embedded in prose. There is no calculated plan, dependency table tailored to a user's NFS version, or separate client-side path.
- Formula or data source: [Documented] The page links RFCs, RHEL docs, nfs-utils manual pages, and firewalld docs, but the runnable example is pinned to CentOS 7 and does not disclose fixture testing.
- Errors and edge behavior: [Observed] It demonstrates NFSv3 failure before supplementary services are opened. It does not classify IPv6, NFSv4.0 callback, quota, routed firewall, or already-fixed dynamic ports.
- Mobile and accessibility: [Observed] At 390 px the document and body scroll widths equaled the viewport. The long article remains linear; many copy buttons are discoverable.
- Privacy: [Unknown] No user data is entered into a tool.
- Performance: [Observed] The content loaded after a moderate initial delay and remained readable.
- Search-content structure: [Observed] H1, introduction, ports and services, version comparison, detailed setup, verification, conclusion, and related material.
- What works: It proves the difference between an NFSv4 mount and an NFSv3 failure with actual commands.
- What fails: Users must translate an old single-distro recipe and cannot see which choices are universal versus example-specific.
- Do not copy: The long tutorial, fixed sample topology, or implication that the chosen helper ports are general defaults.

```text
Configuring firewalld for NFS Connections
metadata and tags
1. Introduction
2. NFS ports and services
   version comparison
3. Configure firewalld
   create zone and source
   allow nfs
   set helper ports
   allow supplementary services
   run mount checks
long conclusion and related content
```

### Competitor 2: OneUptime How to Set Up NFS Firewall Rules on RHEL

- URL: https://oneuptime.com/blog/post/2026-03-04-nfs-firewall-rules-rhel-9/view
- Accessed: 2026-08-09 at desktop and 390 px; fully accessible and inspected.
- Audience and promise: [Observed] RHEL administrators who want firewalld commands for NFSv3 or NFSv4.
- Inputs and defaults: [Observed] No interactive inputs. The examples assume RHEL, firewalld, an IPv4 source subnet, and fixed helper ports 20048, 32803, 662, and 2020.
- Action and state behavior: [Observed] Copyable code blocks open predefined services or ports, configure `/etc/nfs.conf`, create zones or rich rules, test with `nc`, `rpcinfo`, `showmount`, and optionally disable NFSv3.
- Results and visuals: [Observed] A port summary table distinguishes NFSv4 and NFSv3. Commands follow the table. No planner state or invalid configuration exists.
- Formula or data source: [Unknown] The page is labeled technically validated and open source but does not cite the exact RHEL or RFC sources beside its port claims.
- Errors and edge behavior: [Observed] It includes troubleshooting and a source-scoped rich rule. It does not model IPv6, NFSv4.0 callback, client-side listeners, rquotad, or differences between a firewalld service definition and the chosen fixed port.
- Mobile and accessibility: [Observed] At 390 px the document and table fit the viewport without page-level horizontal overflow. Buttons and table headings were exposed in the accessibility tree.
- Privacy: [Unknown] No interactive user data is entered.
- Performance: [Observed] The article loaded promptly and code blocks were usable.
- Search-content structure: [Observed] H1, short promise, table of contents, version sections, port table, source restriction, zones, verification, troubleshooting, and wrap-up.
- What works: It puts the version split and port summary before troubleshooting and includes verification commands.
- What fails: It compresses deployment-specific assumptions into copyable commands and omits the client firewall path.
- Do not copy: The universal-sounding fixed ports, copy-first command hierarchy, or claim that NFSv4 is always one rule without a 4.0 boundary.

```text
How to Set Up NFS Firewall Rules on RHEL
one-sentence promise
[On this page]
NFSv4 setup
NFSv3 setup
  set fixed ports
  open fixed ports
[port summary table]
source restriction and zones
verification and troubleshooting
```

### Competitor 3: Simplified Guide fixed NFSv3 ports workflow

- URL: https://www.simplified.guide/nfs/server-nfsv3-ports-configure
- Accessed: 2026-08-09 at desktop and narrow Browser viewport; fully accessible and inspected.
- Audience and promise: [Observed] Linux NFS server administrators who need stable NFSv3 helper ports before creating firewall rules.
- Inputs and defaults: [Observed] No interactive inputs. The guide supplies example ports for mountd, rpc.statd, statd outgoing, and lockd and assumes a TCP-based client subnet.
- Action and state behavior: [Observed] The workflow checks supported NFS versions, edits `/etc/nfs.conf`, dumps configuration, restarts services, checks `rpcinfo -p`, updates the firewall, performs a version-pinned mount, checks `findmnt`, and unmounts.
- Results and visuals: [Observed] A service table explains each RPC program and a sample `rpcinfo` output shows the intended listener state.
- Formula or data source: [Unknown] The page reflects current nfs-utils configuration patterns but does not display primary citations in the inspected body.
- Errors and edge behavior: [Observed] It tells users not to add firewall rules if `rpcinfo -p` still shows different ports and warns that lockd may retain old state. It excludes NFSv4.0 callback, IPv6, routed firewall, and rule translation details.
- Mobile and accessibility: [Observed] The narrow page remained readable in a single flow, but reliable scroll metrics were unavailable from this page runtime.
- Privacy: [Unknown] No interactive user data is entered.
- Performance: [Observed] The page loaded promptly.
- Search-content structure: [Observed] H1, three introductory paragraphs, related guides, one long numbered workflow, service table, and verification commands.
- What works: It makes verification precede firewall exposure and distinguishes `statd` listener and outgoing ports.
- What fails: The user still has to choose a firewall implementation and decide which endpoint and direction each port belongs to.
- Do not copy: The single long checklist or example helper ports as defaults.

```text
How to configure fixed NFSv3 ports
why dynamic helpers matter
maintenance warning
related NFS guides
ordered steps
  check versions
  [service and example-port table]
  edit nfs.conf
  restart and inspect rpcinfo
  update firewall
  mount and verify
```

### Competitor 4: DevelopnSolve NFS Ports and Firewall Configuration Guide

- URL: https://www.developnsolve.com/linux/nfs-ports-and-firewall-configuration
- Accessed: 2026-08-09 at desktop and narrow Browser viewport; fully accessible and inspected.
- Audience and promise: [Observed] General Linux users who want a secure NFS and firewall setup guide.
- Inputs and defaults: [Observed] No interactive inputs. It mixes `/etc/sysconfig/nfs` and `/etc/nfs.conf`, firewalld and iptables, and a fixed set of sample ports.
- Action and state behavior: [Observed] Copyable snippets configure ports, open them, restart services, list firewall ports, and suggest a client mount.
- Results and visuals: [Observed] Text lists and code blocks dominate. There is no role/direction table, version branch, result trace, or validation.
- Formula or data source: [Unknown] No primary sources or version anchors were visible.
- Errors and edge behavior: [Observed] It mentions dynamic ports and connection errors, but the displayed rules open the `statd` outgoing source port as an inbound destination port and use broad unscoped accept rules. It states that rpcbind is an NFS dependency without limiting that statement to NFSv3.
- Mobile and accessibility: [Observed] The narrow content remained linear; reliable scroll metrics were unavailable from this page runtime.
- Privacy: [Unknown] No interactive user data is entered.
- Performance: [Observed] The page became readable after a moderate load.
- Search-content structure: [Observed] H1, definitions, static-port instructions, firewall examples, prerequisites, six steps, common errors, best practices, conclusion, FAQ, and related guides.
- What works: It covers the query vocabulary and reminds readers to restrict access.
- What fails: It is technically under-scoped and exposes plausible-looking commands without enough endpoint, version, family, or direction context.
- Do not copy: Broad accept commands, generic FAQs, repeated sections, or the outgoing-port mistake.

```text
NFS Ports and Firewall Configuration Guide
what ports matter
how to choose static ports
firewalld and iptables snippets
prerequisites
six-step setup
errors and best practices
FAQ and related content
```

### Competitor 5: AllTheSystems Firewall Rule Simulator

- URL: https://allthesystems.com/firewall-rule-simulator
- Accessed: 2026-08-09 at desktop and 390 px; fully accessible and operated.
- Audience and promise: [Observed] Users simulating ordered allow/deny rules and packet matching in a browser.
- Inputs and defaults: [Observed] Rule source IP, destination IP, protocol, port, action, plus a test packet with the same network fields.
- Action and state behavior: [Observed] Explicit Add Rule and Test Packet actions, edit/delete controls, theme toggle, local persistence, and live status.
- Results and visuals: [Observed] A client-firewall-server diagram and a status such as `ALLOW (matched rule #1)`. A controlled TCP/2049 rule for `192.168.1.10` to `10.0.0.5` matched successfully.
- Formula or data source: [Unknown] The page does not disclose a specific firewall engine or rule semantics beyond its simple first-match model.
- Errors and edge behavior: [Observed] It accepts simple IP strings, protocols, and one port. It does not derive NFS services, validate CIDRs against address family, model dynamic RPC ports, or translate to UFW, firewalld, or nftables.
- Mobile and accessibility: [Observed] At 390 px the document and main width equaled the viewport. Form controls had accessible names. The visible page was heavily interrupted by advertisements.
- Privacy: [Documented] The companion page states that the simulator is 100 percent client-side and stores rules in localStorage.
- Performance: [Observed] The core tool responded promptly after ad-heavy initial load.
- Search-content structure: [Observed] H1, rule builder, packet tester, visual path, and an article page that explains the controls.
- What works: It makes direction fields and the matched rule visible and separates rule creation from packet testing.
- What fails: It starts after the hardest NFS-specific work and can validate only its simplified model, not the host firewall.
- Do not copy: Automatic local persistence, generic packet animation, emoji-heavy labels, ad density, or a success badge without deployment caveats.

```text
Firewall Rule Simulator
[theme]
Rules
  source | destination | protocol | port | action
  [Add Rule]
[CLIENT -> FIREWALL -> SERVER]
test packet fields
[Test Packet]
ALLOW (matched rule #1)
```

## Comparison matrix

| Capability | Baeldung | OneUptime | Simplified Guide | DevelopnSolve | AllTheSystems | User value |
| --- | --- | --- | --- | --- | --- | --- |
| NFS version branch | Prose | Yes | NFSv3 only | Weak | No | High |
| NFSv4.0 versus 4.1+ | No | No | No | No | No | High for client firewall correctness |
| Dynamic RPC guard | Prose and examples | Examples | Strong verification | Weak | No | High |
| Server and client listeners | Server only | Server only | Server focus | Server only | Generic endpoints | High |
| Source CIDR scope | One example | Rich-rule example | Guidance | Mention only | One source value | High |
| IPv4 and IPv6 | No | IPv4 only | IPv4 example | No | Unspecified | High |
| TCP and UDP choice | Some | Both for v3 | Explicit legacy choice | Broad both | Per rule | High |
| Stateful direction explanation | No | No | Partial outgoing-port note | No | Packet direction only | High |
| UFW output | No | No | Separate related guide | No | No | High |
| Firewalld output | Yes | Yes | Separate related guide | Yes | No | High |
| nftables output | No | No | No | No | No | High |
| Reviewable service table | Prose list | Fixed table | Fixed table | Text list | User-created rules | High |
| Verification order | Good | Good | Strong | Basic | Simulator only | High |
| Honest incomplete result | No | No | Stop if listeners differ | No | No | High |
| Browser-local interactive plan | No | No | No | No | Yes, generic | Medium |

## Formula and data disagreements

| Question | Different behaviors | Best evidence | Decision still needed |
| --- | --- | --- | --- |
| Is NFSv4 always only inbound TCP/2049? | Guides say yes; current RHEL docs distinguish NFSv4.0 client callback from NFSv4.1+ backchannel use | RFC 7530, RFC 8881, current RHEL 9 client-firewall docs | No: ask for v4.0 versus 4.1+ when the client firewall is in scope |
| Does NFSv3 require UDP? | Older answers open TCP and UDP universally; current workflows increasingly use TCP-only NFSv3 | RFC 1813 permits transports and distro docs expose both; actual server config decides | Yes: product should offer TCP-only by default with explicit legacy UDP selection, labeled as a product default rather than universal truth |
| Which fixed ports should be used? | RHEL, Oracle, Baeldung, OneUptime, and community recipes choose different values | nfs.conf and service manuals define configurability, not universal numbers | No: require verified user values and never prefill plausible fixed ports as facts |
| Should statd outgoing port be opened inbound? | DevelopnSolve does so; Simplified Guide identifies it as an outgoing source-port control | rpc.statd and nfs.conf semantics plus endpoint firewall state | No: do not add it to the inbound destination-port plan; mention it only for restrictive egress or peer callback analysis |
| Is mountd needed for NFSv4? | Some service bundles include mountd for both; RFC-level client traffic uses 2049 and RHEL says mountd network MOUNT requests are NFSv3 | Current RHEL service table and NFSv4 RFCs | No: do not expose mountd for ordinary NFSv4 client traffic |
| Is rquotad required? | Some Q&A answers add it; most guides omit it | Current RHEL service table identifies quota information as conditional | No: make remote quota service an explicit optional dependency with a verified port |
| Can a command fragment be universally safe? | Guides present runnable commands; firewall ecosystems require existing zone, table, chain, interface, and policy context | Official firewalld, UFW, and nftables docs | No: result must be a rules plan first and command snippets only for a pinned, declared context |

## Evidence-backed opportunities

1. **Derive the service plan before translating syntax**: ask the NFS version, minor version when callbacks matter, transport, source, family, and firewall position, then show server and client listeners separately.
2. **Refuse fake NFSv3 completeness**: when mountd, lockd, statd, or optional rquotad ports are not verified, label the plan incomplete and show exactly what to inspect with `rpcinfo -p` and `ss`.
3. **Make directionality visible**: distinguish client-originated connections, established replies, and server-originated callbacks or status notifications instead of calling every rule “inbound NFS.”
4. **Use one neutral service table across firewall families**: let the reviewable facts remain stable while syntax changes among firewalld, UFW, and nftables.
5. **Expose ecosystem boundaries honestly**: firewalld can use services or rich rules; UFW is a host-firewall frontend; nftables output must be a chain fragment unless the user supplies the surrounding ruleset contract.
6. **Keep verification part of the answer**: include listener discovery, ruleset inspection, a version-pinned mount, and an export/permission check so the planner never claims deployment success.

## Table stakes

- NFSv3, NFSv4.0, and NFSv4.1+ choices with a visible reason for the distinction.
- Server-host firewall, client-host firewall, or routed-network firewall position.
- IPv4 or IPv6 source CIDR validation and a deliberate source restriction.
- TCP and explicitly chosen legacy UDP behavior.
- Required versus conditional service rows with endpoint, direction, protocol, and port source.
- Dynamic or unverified NFSv3 ports must prevent a complete or copy-ready plan.
- Firewalld, UFW, and nftables translations that disclose their assumed context.
- Local-only processing, clean URL, reset, copy of the neutral plan, and keyboard submit.
- Verification with `rpcinfo -p`, `ss`, firewall inspection, and a version-pinned mount.
- Clear statement that firewall reachability does not prove export authorization, filesystem permissions, identity mapping, security flavor, SELinux policy, NAT behavior, or successful mounting.

## Ideas to reject

- **Universal one-click commands**: no single command set can know the user's active zone, chain, default policy, interface, distro service definitions, or existing rules.
- **Scanning the user's host**: browser-side scanning is unsafe, incomplete, and outside the deterministic contract.
- **Prefilled NFSv3 helper ports presented as defaults**: examples from one distro become dangerous when copied elsewhere.
- **An “all NFS ports” toggle**: it encourages overbroad exposure and hides optional services.
- **Automatic `any` source**: NFS should not default to every source network.
- **A green “secure” or “working” result**: the tool can produce a reviewable plan, not prove security or reachability.
- **Automatic table or chain creation for nftables**: ownership, hook, priority, and base policy belong to the user's existing ruleset.
- **iptables output at launch**: UFW, firewalld, and nftables cover the planned ecosystems; another syntax adds maintenance without resolving a new decision.
- **Persisting network details automatically**: source networks and topology should stay in memory and leave no URL or storage trace unless a later explicit share contract is approved.

## Open questions and blockers

- Product planning must decide whether NFSv3 TCP-only is the default or whether transport begins unset. The research supports TCP-first guidance but not a universal prohibition on UDP.
- Product planning must define a safe nftables fragment contract and must not create a complete ruleset.
- Product planning must decide whether routed firewalls are launch scope. If included, the output must remain a neutral bidirectional flow plan because host-specific UFW/firewalld commands do not map directly to a network appliance.
- No blocker prevents a constrained planner. Current live demand, the 915,000-view durable question, cross-engine result repetition, and absence of an NFS-aware planner satisfy the validate-before-build gate. Build only under the incomplete-until-verified NFSv3 contract described above.

## Sources

- Google exact planner search: https://www.google.com/search?q=NFS+firewall+rules+planner, accessed 2026-08-09. [Observed] Documentation, guides, Q&A, and missing-planner labels; no direct planner.
- Google ports search: https://www.google.com/search?q=which+ports+open+firewall+NFSv3+NFSv4, accessed 2026-08-09. [Observed] AI overview, PAA, Q&A, official docs, and vendor pages.
- Google nftables search: https://www.google.com/search?q=nftables+NFSv3+mountd+lockd+statd+firewall, accessed 2026-08-09. [Observed] Search correction and fragmented NFS plus nftables results.
- Bing exact search: https://www.bing.com/search?q=NFS+firewall+rules+planner, accessed 2026-08-09. [Observed] About 52,800 indexed results; guides, docs, and one generic simulator.
- Bing timeout search: https://www.bing.com/search?q=NFS+mount+timeout+firewall+rpcinfo+ports, accessed 2026-08-09. [Observed] About 2,120 indexed results; troubleshooting guides and the Server Fault thread.
- Server Fault durable question: https://serverfault.com/questions/377170/which-ports-do-i-need-to-open-in-the-firewall-to-use-nfs, accessed 2026-08-09. [Observed] 915,000 views, ten answers, conflicting ports, and recurring updates through 2025.
- RHEL 9 NFS deployment: https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_using_network_file_services/deploying-an-nfs-server_configuring-and-using-network-file-services, accessed 2026-08-09. [Documented] Current services, versions, fixed-port configuration, firewall commands, and verification.
- RHEL 9 NFS client firewall: https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_file_systems/mounting-nfs-shares_managing-file-systems, accessed 2026-08-09. [Documented] NFSv3 status callbacks and NFSv4.0 versus 4.1+ callback behavior.
- RHEL 9 securing networks: https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html-single/securing_networks/index, accessed 2026-08-09. [Documented] NFSv4 TCP/2049, NFSv3 dynamic helpers, rpcbind security, and firewalld rules.
- RFC 7530: https://www.rfc-editor.org/rfc/rfc7530.html, accessed 2026-08-09. [Documented] NFSv4 port and transport requirements and NFSv4.0 callback program behavior.
- RFC 8881: https://www.rfc-editor.org/info/rfc8881/, accessed 2026-08-09. [Documented] NFSv4.1 port, sessions, and backchannel connection behavior.
- Linux `nfs.conf(5)`: https://man7.org/linux/man-pages/man5/nfs.conf.5.html, accessed 2026-08-09. [Documented] Current mountd, statd, and lockd configuration keys.
- Firewalld rich language: https://firewalld.org/documentation/man-pages/firewalld.richlanguage.html, accessed 2026-08-09. [Documented] Source, family, service, port, action, and rule-order syntax.
- Ubuntu UFW manual: https://manpages.ubuntu.com/manpages/jammy/man8/ufw.8.html, accessed 2026-08-09. [Documented] Host and routed rule syntax, address family, direction, interface, protocol, source, and destination port.
- Netfilter nftables sets: https://wiki.netfilter.org/wiki-nftables/index.php/Sets, accessed 2026-08-09. [Documented] Source-address and destination-port set matching.
- Ubuntu firewall documentation: https://documentation.ubuntu.com/server/how-to/security/firewalls/, accessed 2026-08-09. [Documented] UFW scope and host firewall model.
- Baeldung NFS firewalld guide: https://www.baeldung.com/linux/firewalld-nfs-connections-settings, accessed 2026-08-09. [Observed] Detailed firewalld workflow and CentOS 7 example.
- OneUptime RHEL guide: https://oneuptime.com/blog/post/2026-03-04-nfs-firewall-rules-rhel-9/view, accessed 2026-08-09. [Observed] Version split, port table, source scope, and copyable firewalld commands.
- Simplified Guide fixed ports: https://www.simplified.guide/nfs/server-nfsv3-ports-configure, accessed 2026-08-09. [Observed] Verification-first NFSv3 workflow.
- DevelopnSolve NFS guide: https://www.developnsolve.com/linux/nfs-ports-and-firewall-configuration, accessed 2026-08-09. [Observed] Broad commands and current competitor weaknesses.
- AllTheSystems firewall simulator: https://allthesystems.com/firewall-rule-simulator, accessed 2026-08-09. [Observed] Generic rule and packet workflow operated with TCP/2049.

## Post-build competitive re-review

Re-reviewed 2026-08-09 after the technical planner passed its focused engine, static, Playwright, and Browser checks. The implemented page was exercised with the longest IPv6 NFSv3 TCP plus legacy UDP branch, optional rquotad, and nftables expressions, then with the NFSv4.1-or-later client branch. At 375 px, the 12 listener rows reflowed into labelled records and the document had zero page-level horizontal overflow.

| Revisited page | Live rendered evidence | Comparison with the finished planner | Launch action |
| --- | --- | --- | --- |
| OneUptime RHEL NFS firewall guide | [Observed] Version headings, a port summary, source restriction, zones, and verification remain present. The rendered body did not cover IPv6, NFSv4.0 callback listeners, client-host firewall planning, UFW, nftables, or rquotad. The only input was site chrome, not a planner. | The planner closes the endpoint, address-family, callback, and firewall-syntax decisions without copying the article workflow. | No technical gap to close. Keep the version-specific neutral table before commands. |
| Baeldung firewalld NFS guide | [Observed] Server configuration remains the core workflow. The rendered body mentions rquotad but not IPv6, NFSv4.0, a client firewall path, UFW, or nftables, and exposes no planner inputs. | The planner is narrower than the tutorial but more explicit about fixed versus locally verified ports and protected endpoint. | No technical gap to close. Keep firewalld zone context mandatory for translation. |
| Simplified Guide fixed NFSv3 ports | [Observed] The fixed-port checklist remains focused on NFSv3 server configuration and verification. It has no planner inputs and no combined IPv6, NFSv4.0 callback, or client-firewall model. | The planner retains the guide's verification-first strength while refusing to guess helper ports or emit incomplete commands. | No technical gap to close. Preserve protocol-fixed-only rows in incomplete results. |

Competitive re-review outcome: [Observed] no P0 or P1 capability gap was found against the closest live workflows. The defensible advantage remains the constrained decision model, not broader prose: server versus client host, NFSv4.0 versus v4.1+, IPv4 versus IPv6, locally verified NFSv3 helper ports, and bounded firewalld, UFW, or existing-chain nftables output.
