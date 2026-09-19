Status: ready
Tool: Home Assistant MQTT discovery checker
Route: /mqtt-discovery-checker
Direct competitors reviewed: 5
Saturation exception: yes

## Research scope

Queries tried: `Home Assistant MQTT discovery checker`, `MQTT discovery JSON validator`, `homeassistant discovery payload test`, and `MQTT config topic checker`.

Repeated domains: home-assistant.io, github.com, community.home-assistant.io, and MQTT client libraries.

Exclusions: broker clients, general JSON validators, and dashboards that publish payloads without explaining Home Assistant findings.

## Search intent

| Query job | User wording | Desired answer | Current gap |
|---|---|---|---|
| Validate discovery JSON | home assistant mqtt discovery validator | Is this payload accepted | Results point to docs or schemas |
| Debug topic | homeassistant config topic wrong | Which segment is wrong | No focused checker found |
| Check device metadata | mqtt discovery device info | Why entities do not group | Examples are scattered |
| Test before publish | mqtt discovery payload test | Safe local feedback | Tools tend to publish to a broker |

## User pain evidence

| Repeated problem | Evidence | Product implication |
|---|---|---|
| Discovery does not appear | [Observed] https://community.home-assistant.io/t/mqtt-discovery-does-not-seem-to-run/336276 | Give path-level errors and topic checks |
| Schemas are hard to keep in one place | [Observed] https://community.home-assistant.io/t/mqtt-discovery-json-schemas/905165 | Show supported subset and source date |
| Users need component-specific examples | [Documented] https://www.home-assistant.io/integrations/mqtt | Detect component and tailor checks |

## Technical truth to verify

| Claim | Source | Verification decision |
|---|---|---|
| Discovery topic uses a prefix and component | [Documented] https://www.home-assistant.io/integrations/mqtt | Parse `homeassistant/<component>/.../config` |
| Device metadata is nested under `device` | [Documented] https://www.home-assistant.io/integrations/mqtt | Validate object shape and identifiers |
| Core discovery code is versioned in Home Assistant | [Documented] https://github.com/home-assistant/core/blob/dev/homeassistant/components/mqtt/discovery.py | Pin checks to a documented subset |

## Competitor reviews

### Competitor 1: Home Assistant MQTT integration docs

URL: https://www.home-assistant.io/integrations/mqtt

[Documented] The page defines discovery topics and payload examples. [Documented] It lists component-specific configuration fields. [Observed] Examples require manual comparison. [Inferred] A parser can turn examples into repeatable checks. [Unknown] The docs do not expose a standalone validator.

```text
documentation -> copy example -> compare by eye -> publish
```

### Competitor 2: Home Assistant discovery source

URL: https://github.com/home-assistant/core/blob/dev/homeassistant/components/mqtt/discovery.py

[Documented] Core code parses discovery messages. [Documented] It handles component setup and removal. [Observed] Source is difficult for users troubleshooting a payload. [Inferred] Findings should cite field paths rather than Python branches. [Unknown] No user-facing checker ships with the source.

```text
broker message -> core parser -> entity setup or log
```

### Competitor 3: community schema discussion

URL: https://community.home-assistant.io/t/mqtt-discovery-json-schemas/905165

[Observed] Users ask for machine-readable discovery schemas. [Observed] Replies compare examples and version behavior. [Inferred] A documented subset with warnings is more honest than a fake universal schema. [Unknown] There is no stable hosted checker in the thread. [Documented] The integration docs remain the reference.

```text
payload question -> community examples -> manual correction
```

### Competitor 4: ha-mqtt-discoverable library

URL: https://github.com/unixorn/ha-mqtt-discoverable

[Documented] The library generates discovery payloads. [Observed] It targets programmatic publishing. [Observed] It does not focus on arbitrary payload diagnosis. [Inferred] A checker complements it for hand-written integrations. [Unknown] It does not promise offline field-level explanations.

```text
Python config -> generated JSON -> broker publish
```

### Competitor 5: generic JSON schema validators

URL: https://www.jsonschemavalidator.net/

[Observed] They validate JSON syntax and schemas. [Documented] They do not know MQTT discovery topics. [Inferred] Domain findings need topic and component context. [Unknown] Home Assistant schema coverage is absent. [Observed] Users still need interpretation after syntax passes.

```text
JSON text -> generic schema result -> no MQTT diagnosis
```

## Comparison matrix

| Capability | HA docs | Core source | Community | Generator library | Proposed tool |
|---|---|---|---|---|---|
| Validate topic segments | Manual | Internal | Narrative | No | Yes |
| Parse arbitrary payload | Manual | Runtime | Examples | Limited | Yes |
| Field-path findings | No | Logs | Narrative | No | Yes |
| Distinguish error and warning | No | Internal | Mixed | No | Yes |
| Broker-free workflow | Yes | No | Yes | No | Yes |

## Formula and data disagreements

Home Assistant accepts different fields by component and changes over time. The checker should classify only stable structural rules as errors, mark component-specific omissions as warnings, and display the validation profile version. Payload values remain opaque; the tool never publishes or stores them.

## Evidence-backed opportunities

Offer a topic-aware, privacy-preserving checker with clear errors such as “config suffix missing” and “device identifiers incomplete.” Add a normalized preview and links to the exact integration docs. This covers a high-intent task with little direct tool competition.

## Sources

- https://www.home-assistant.io/integrations/mqtt
- https://github.com/home-assistant/core/blob/dev/homeassistant/components/mqtt/discovery.py
- https://community.home-assistant.io/t/mqtt-discovery-json-schemas/905165
- https://community.home-assistant.io/t/mqtt-discovery-does-not-seem-to-run/336276
- https://github.com/unixorn/ha-mqtt-discoverable
