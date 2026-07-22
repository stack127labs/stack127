# Clean-Slate Directory Ideas

Date: 2026-07-21

This is a fresh directory-only idea slate. It was developed without using earlier Version127 idea documents. Existing live routes were checked only to avoid direct duplication.

The priority is directories that normalize a difficult decision across products through durable, source-backed fields. Unknown values should remain unknown rather than being inferred.

## Strongest Ideas

### [ ] 1. Local-Control Smart Home Integrations

Recommended URL: `/local-smart-home-integrations`

Help people find integrations that communicate locally rather than depending on a vendor cloud. Useful fields include IoT class, protocol, discovery method, cloud-account requirement, quality tier, supported platforms, and official documentation.

Initial source: Home Assistant integration manifests and documentation.

### [ ] 2. Local AI Runtimes

Recommended URL: `/local-ai-runtimes`

Compare Ollama, llama.cpp, vLLM, SGLang, LocalAI, and similar runtimes. Useful fields include supported hardware, operating systems, model formats, quantization formats, OpenAI-compatible endpoints, multimodal support, structured output, tool calling, batching, distributed inference, and model switching.

Risk: capabilities change quickly, so every fact needs a source and last-verified date.

### [ ] 3. AI Agent Sandboxes

Recommended URL: `/ai-agent-sandboxes`

Catalog self-hostable or locally deployable environments for safely executing agent-generated code. Useful fields include isolation technology, self-hosting model, API and SDK languages, persistent workspaces, snapshots, network controls, GPU support, browser or desktop support, and supported operating systems.

Risk: do not turn feature support into an automated claim that a sandbox is secure.

### [ ] 4. Smart Home Coordinators

Recommended URL: `/smart-home-coordinators`

Compare Zigbee, Thread, Matter, and Z-Wave coordinators. Useful fields include chipset, radio protocols, USB or Ethernet connectivity, PoE, supported host software, coordinator and router firmware, backup support, migration behavior, and multiprotocol limitations.

Initial sources: Zigbee2MQTT, ZHA, OpenThread, Z-Wave JS, and manufacturer documentation.

### [ ] 5. UPS Compatibility

Recommended URL: `/ups-compatibility`

Make UPS and power-device compatibility easier to search than existing hardware lists. Useful fields include manufacturer, model, NUT driver, connection type, protocol support level, USB identifiers, monitoring fields, controllable commands, shutdown testing, and last-tested NUT version.

Initial source: the Network UPS Tools hardware compatibility data and device dumps.

### [ ] 6. Self-Hosted Identity Providers

Recommended URL: `/self-hosted-identity-providers`

Compare identity and access-management systems by OIDC, OAuth, SAML, LDAP, SCIM, RADIUS, passkeys, MFA, social login, proxy authentication, multi-tenancy, user lifecycle, configuration model, and deployment requirements.

Risk: identity features are nuanced; distinguish provider, client, proxy, and provisioning capabilities.

### [ ] 7. NVR AI Accelerators

Recommended URL: `/nvr-ai-accelerators`

Compare hardware used for local video detection across Frigate and other open NVR systems. Useful fields include accelerator family, interface, supported detector backends, model formats, host requirements, video decode support, power requirements, virtualization notes, and official support status.

Risk: avoid unsourced performance comparisons and keep software-version compatibility explicit.

### [ ] 8. Local Voice Assistant Stack

Recommended URL: `/local-voice-stack`

Catalog wake-word engines, speech-to-text engines, text-to-speech engines, voice satellites, and orchestration software. Useful fields include supported languages, hardware targets, offline operation, streaming support, custom wake words, speaker and microphone requirements, APIs, and Home Assistant integration.

### [ ] 9. Backup Engines and Destinations

Recommended URL: `/backup-tools`

Compare restic, Borg, Kopia, Duplicacy, and related tools by storage backend, encryption, deduplication scope, compression, snapshots, retention policies, repository checking, repair support, mounting, operating systems, and restore workflow.

Risk: distinguish an officially supported backend from one that only works through a generic compatibility layer.

### [ ] 10. Local AI Coding Agents

Recommended URL: `/local-ai-coding-agents`

Catalog coding agents that can operate with locally hosted models. Useful fields include terminal or IDE interface, local inference backends, OpenAI-compatible API support, repository indexing, tool calling, MCP or agent-protocol support, sandboxing, approval controls, supported operating systems, and license.

Risk: do not rank agent quality using vendor benchmarks alone.

## Additional Directory Ideas

### Smart Home and Energy

- [ ] **Open-source firmware-compatible devices** — ESPHome, Tasmota, OpenBeken, and similar firmware support by exact device model.
- [ ] **Local-only IP cameras and doorbells** — RTSP, ONVIF, local recording, audio, talkback, codecs, and cloud independence.
- [ ] **Home energy integrations** — Smart meters, current clamps, plugs, gateways, protocols, and local APIs.
- [ ] **Solar inverter local APIs** — Inverters and gateways with Modbus, MQTT, documented LAN APIs, or supported local integrations.
- [ ] **EV chargers with local control** — OCPP, Modbus, MQTT, local HTTP APIs, load balancing, and Home Assistant support.
- [ ] **Open-source NVR platforms** — Camera protocols, recording modes, detection backends, clients, storage, and authentication.
- [ ] **Home automation bridge software** — MQTT, Matter, HomeKit, Zigbee, Z-Wave, Bluetooth, and proprietary-to-local bridges.
- [ ] **E-ink and low-power dashboard hardware** — Display technology, refresh behavior, power options, firmware, and integration methods.

### Local AI and Document Processing

- [ ] **Document OCR and parsing tools** — Formats, languages, layout recognition, tables, formulas, PDF/A, GPU support, and APIs.
- [ ] **Self-hosted RAG ingestion tools** — Connectors, parsers, chunking, metadata, vector stores, incremental sync, and deployment model.
- [ ] **Local AI web interfaces** — Backend support, RAG, tools, agents, multi-user features, authentication, and mobile experience.
- [ ] **AI model routers and API gateways** — Local and cloud backends, API compatibility, routing, failover, budgets, observability, and authentication.

### Homelab Infrastructure

- [ ] **Self-hosted notification infrastructure** — Push transports, mobile clients, attachments, topics, authentication, encryption, and federation.
- [ ] **S3-compatible object-storage servers** — API coverage, erasure coding, replication, object lock, versioning, identity, and deployment scale.
- [ ] **NAS and storage operating systems** — Filesystems, RAID approaches, snapshots, containers, virtualization, hardware support, and clustering.
- [ ] **Homelab remote-access platforms** — Protocol, NAT traversal, relays, identity, clients, exit nodes, subnet routing, and self-hosting scope.
- [ ] **Reverse proxies and ingress platforms** — Configuration model, service discovery, certificates, authentication, plugins, protocols, and orchestration support.
- [ ] **Storage controllers and HBAs** — Chipset, firmware modes, connector types, PCIe generation, lane width, driver support, and disk limits.
- [ ] **Homelab network adapters** — Chipset, link speeds, PCIe requirements, SR-IOV, ASPM, and Linux, BSD, Proxmox, or firewall compatibility.
- [ ] **Open-source router and firewall operating systems** — Hardware architectures, package model, VPNs, multi-WAN, routing protocols, and update model.
- [ ] **Container update and automation tools** — Update detection, notifications, automatic deployment, policies, rollback, registries, and orchestrator support.
- [ ] **Self-hosted secrets management** — Encryption model, identity methods, secret engines, rotation, audit logs, high availability, and client integrations.
- [ ] **Homelab monitoring and observability stacks** — Metrics, logs, traces, agents, storage, alerting, dashboards, and OpenTelemetry support.
- [ ] **Local-first file-sync engines** — Peer discovery, conflict handling, versioning, selective sync, encryption, relay support, and platform coverage.
- [ ] **Self-hosted browser-automation infrastructure** — CDP and WebDriver support, browser pools, sessions, recording, isolation, APIs, and scaling.
- [ ] **Webhook relays and event gateways** — Retries, signing, transformations, queues, replay, routing, observability, and deployment model.
- [ ] **Open-source Git forges and CI platforms** — Git hosting, issues, pull requests, runners, package registries, federation, and migration support.
- [ ] **Self-hosted network inventory and IPAM** — Discovery, source of truth, DNS and DHCP integration, VLANs, racks, APIs, and change history.
- [ ] **Backup verification and restore-testing tools** — Repository checks, scheduled test restores, application validation, reporting, and automation hooks.
- [ ] **Open-source document-management systems** — OCR, tagging, search, workflows, email intake, retention, permissions, export, and mobile support.

## Initial Source Set

- Home Assistant integration manifest and IoT classes: https://developers.home-assistant.io/docs/creating_integration_manifest/
- Home Assistant integration quality scale: https://developers.home-assistant.io/docs/core/integration-quality-scale/
- Zigbee2MQTT supported adapters: https://www.zigbee2mqtt.io/guide/adapters/
- Network UPS Tools: https://networkupstools.org/
- Network UPS Tools hardware compatibility list: https://networkupstools.org/networkupstools-master.github.io/stable-hcl.html
- vLLM documentation: https://docs.vllm.ai/
- Frigate recommended hardware: https://docs.frigate.video/frigate/hardware/
- Daytona sandboxes: https://www.daytona.io/docs/en/sandboxes/
- restic documentation: https://restic.readthedocs.io/en/stable/
- Kopia repository support: https://kopia.io/docs/repositories/
- OCRmyPDF: https://github.com/ocrmypdf/OCRmyPDF
- Docling: https://github.com/docling-project/docling

## Suggested Starting Order

1. Local-Control Smart Home Integrations
2. Local AI Runtimes
3. Smart Home Coordinators
4. AI Agent Sandboxes
5. UPS Compatibility

Before implementation, revalidate the exact competitor gap and official source coverage for the selected directory. Apply the surface decision rule in `skills/version127/version127-topic-research/SKILL.md`; entity-specific facts should become directory records or indexable entity pages rather than incomplete picker tools.
