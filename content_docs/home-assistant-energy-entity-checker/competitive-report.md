# Competitive report: Home Assistant Energy Entity Eligibility Checker

Status: ready
Tool: Home Assistant Energy Entity Eligibility Checker
Route: `/home-assistant-energy-entity-checker`
Researched: 2026-08-09
Direct competitors reviewed: 5
Saturation exception: yes

## Research scope

### Current stack127 state

The route is locked to the flat canonical URL `/home-assistant-energy-entity-checker`, with future source ownership under `app/(site)/(tools)/home-assistant-energy-entity-checker/` and page documents under this folder. Repository inspection found no existing route, engine, test, script, ownership manifest, or other document for this tool. The only existing requirement is the roadmap entry in `content_ideas/2026-08-06-low-competition-search-opportunities.md`, which scores the idea 24/25 and proposes a local decision engine over an entity's intended Energy role, domain, value, `device_class`, `state_class`, and `unit_of_measurement`.

This passes the stack127 surface rule: it computes a result from user-provided attributes and current universal Home Assistant rules, remains useful without a curated entity catalog, and does not promise that an entity is safe or correct. The result must distinguish attribute eligibility from recorder/statistics health and from actual data availability.

### Method and coverage

Research used four query shapes: the exact phrase `Home Assistant Energy Entity Eligibility Checker`; the underlying job `Home Assistant entity not showing in energy dashboard checker`; the specialist variation `Home Assistant state_class total_increasing eligibility tool`; and the pain variation `Home Assistant energy dashboard unit not supported long term statistics`. Additional repository and GitHub searches looked for an entity validator or diagnostic utility.

Google and Bing were operated in the in-app Browser on 2026-08-09. The five closest current diagnostic workflows were then operated in the public Home Assistant demo at a reported 1280 × 720 viewport: Energy source configuration, Developer Tools Statistics, Developer Tools States, Developer Tools Template, and Developer Tools YAML. These are the direct workflows a user must currently combine to answer the proposed tool's job; no dedicated standalone checker was found. The public demo exposes representative frontend states but stubs some backend WebSocket commands, which is called out per workflow. A temporary narrow-viewport request was not applied by the Browser backend, so narrow behavior is `Unknown` rather than inferred.

### Search saturation evidence

- Queries tried: `"Home Assistant Energy Entity Eligibility Checker"`, `Home Assistant entity not showing in energy dashboard checker`, `Home Assistant state_class total_increasing eligibility tool`, `Home Assistant energy dashboard unit not supported long term statistics`, `Home Assistant energy sensor checker tool`, and GitHub-focused entity-validator variations.
- Repeated domains: Google repeatedly returned `home-assistant.io`, `community.home-assistant.io`, GitHub issues, Reddit discussions, and YouTube explainers. Bing's exact quoted query returned setup videos rather than a checker. The quoted Google query explicitly reported no result for the exact phrase and fell back to community threads and official documentation.
- Exclusions: Home Assistant documentation, forum answers, Reddit threads, videos, integration-specific setup guides, and generic YAML/template validators were not counted as standalone checker competitors. Five in-product diagnostic workflows were reviewed because they are the closest interactive substitutes. More search results repeated prose troubleshooting and did not provide a sixth direct eligibility workflow.

## Search intent

| Intent | Example query | What the user needs now | Current result shape |
| --- | --- | --- | --- |
| Diagnose a missing picker option | `Home Assistant entity not showing in energy dashboard` | Identify the exact failed eligibility condition | FAQ, forum, Reddit, video |
| Check Energy role compatibility | `Home Assistant energy sensor checker tool` | Test one entity against grid, solar, battery, gas, water, or device rules | No dedicated checker found |
| Choose metadata | `Home Assistant state_class total_increasing eligibility` | Understand whether `measurement`, `total`, or `total_increasing` fits the sensor | Developer documentation and Q&A |
| Resolve unit rejection | `Home Assistant energy dashboard unit not supported` | See the accepted unit family and exact character form | FAQ plus in-product help text |
| Diagnose statistics eligibility | `Home Assistant sensor not showing long term statistics` | Separate statistics support from Energy dashboard support | Developer Tools Statistics, docs, issues |
| Convert a power sensor | `Home Assistant power sensor energy dashboard` | Learn that power and accumulated energy serve different fields, and identify a deterministic next step | Documentation and integration guides |

## User pain evidence

| Repeated problem or question | Evidence | Frequency signal | Product implication |
| --- | --- | --- | --- |
| An entity has plausible attributes but still does not appear | [Home Assistant Core issue #89739](https://github.com/home-assistant/core/issues/89739) records an `energy` / `total_increasing` / `Wh` sensor excluded because recorder did not include it | Repeated across issue and forum results | Never reduce eligibility to three attributes; show recorder/statistics as a separate unresolved check |
| Users do not know whether they need power or energy | [Current Reddit discussion](https://www.reddit.com/r/homeassistant/comments/1tydx4s/energy_dashboard_doesnt_show_any_entities/) and [community question](https://community.home-assistant.io/t/why-is-the-entity-not-available-to-be-selected-in-the-energy-tab/763855) | Recent plus long-lived | Ask for the intended Energy field before evaluating metadata |
| Advice confuses source sensors, integral sensors, and utility meters | [Home Assistant Core issue #130537](https://github.com/home-assistant/core/issues/130537) contains a long troubleshooting path with conflicting generated advice | Repeated, high-friction thread | Explain only deterministic fixes; do not generate YAML when ownership of the entity is unknown |
| Correct-looking classes still fail because units or statistics metadata disagree | [Home Assistant Community: why sensors are not showing](https://community.home-assistant.io/t/why-are-my-sensors-not-showing-in-the-energy-dashboard/593820) | Repeated | Return one failing field at a time and direct users to Statistics for stored-unit issues |
| Users describe the configuration as unexpectedly complicated | [Home Assistant Community: why is it so complicated](https://community.home-assistant.io/t/why-the-heck-is-it-so-complicated-to-add-entities-to-the-the-energy-dashboard/467538) | Long-lived, echoed by current results | Put the answer before the explanation and keep advanced distinctions behind a trace |

## Technical truth to verify

| Claim or formula | Source of truth | Status | Notes |
| --- | --- | --- | --- |
| Energy picker eligibility and long-term-statistics eligibility are related but not identical | [Energy FAQ](https://www.home-assistant.io/docs/energy/faq/) and [sensor developer documentation](https://developers.home-assistant.io/docs/core/entity/sensor/) | Documented | The tool needs two conclusions, not one combined pass/fail |
| The entity must be in the `sensor` domain for the Energy picker | [Energy FAQ](https://www.home-assistant.io/docs/energy/faq/) | Documented | An `input_number` needs a sensor wrapper; eligibility does not prove the wrapper is semantically correct |
| Electricity grid, solar, and battery accept `energy` or `power`; gas requires `gas`; water requires `water` | [Energy FAQ](https://www.home-assistant.io/docs/energy/faq/) | Documented | Which of `energy` or `power` is valid depends on the specific field selected |
| Power uses `state_class: measurement`; accumulated energy, gas, and water use `total` or `total_increasing` | [Energy FAQ](https://www.home-assistant.io/docs/energy/faq/) | Documented | The checker must not recommend `total_increasing` solely because a value is energy |
| `total_increasing` is for a monotonically increasing positive total that may restart from zero | [Sensor entity documentation](https://developers.home-assistant.io/docs/core/entity/sensor/) | Documented | A noisy or bidirectional counter can produce wrong sum statistics under this class |
| `total` without `last_reset` is the current preferred choice when it fits; other total modes exist for reset behavior | [Sensor entity documentation](https://developers.home-assistant.io/docs/core/entity/sensor/) | Documented | Ask how the counter behaves before suggesting a state class |
| Long-term statistics require `measurement`, `total`, or `total_increasing`; total classes record a `sum` while measurement records mean/min/max | [Statistics documentation](https://data.home-assistant.io/docs/statistics/) | Documented | This supports a distinct statistics interpretation panel |
| The Energy configuration backend has an `energy/validate` command and separate source fields for grid import/export, solar, battery charge/discharge, gas, water, and devices | [Home Assistant frontend energy source](https://github.com/home-assistant/frontend/blob/dev/src/data/energy.ts) | Documented | Pin behavior to a named Home Assistant release during implementation rather than tracking `dev` silently |
| The entity must have no statistics errors before it appears | [Energy FAQ](https://www.home-assistant.io/docs/energy/faq/) | Documented | A browser-only checker cannot inspect the user's recorder; return `needs Home Assistant check`, not `eligible`, when that fact is absent |
| Exact accepted units are role-specific and exponent characters must match exactly | [Energy FAQ](https://www.home-assistant.io/docs/energy/faq/) | Documented | Extract and test the release-pinned allowlists from authoritative code/help text; do not invent a partial unit list from memory |

## Competitor reviews

These five surfaces are the closest interactive substitutes, not five independent standalone websites. Their fragmentation is itself the competitive finding.

### Competitor 1: Home Assistant Energy source configuration

- URL: https://demo.home-assistant.io/#/config/energy
- Accessed: 2026-08-09 at 1280 × 720; frontend accessible, validation backend unavailable in the public demo.
- Audience and promise: [Observed] A configuration surface for adding and validating Energy dashboard sources inside a user's Home Assistant instance.
- Inputs and defaults: [Documented] Source-specific selectors cover grid import/export and power, solar production and power, battery energy in/out and power, gas, water, individual-device consumption, prices, and optional names; the data contract is visible in the official frontend source.
- Action and state behavior: [Observed] Direct navigation reached the page, but the demo returned `WS Command energy/validate is not implemented in provide_hass` and offered only Back.
- Results and visuals: [Observed] On a real instance the result is selection/filtering plus validation issues; the demo exposed a single alert rather than a diagnostic trace.
- Formula or data source: [Documented] The frontend calls `energy/get_prefs`, `energy/save_prefs`, and `energy/validate`; source fields are declared in `src/data/energy.ts`.
- Errors and edge behavior: [Observed] The public demo fails visibly when validation is unavailable, but does not explain entity metadata or offer a fallback.
- Mobile and accessibility: [Unknown] Narrow behavior could not be verified; the alert and Back button had semantic roles in the inspected DOM.
- Privacy: [Documented] Home Assistant says the instance runs on the user's hardware and data is stored locally: https://www.home-assistant.io/faq/is-my-data-private/
- Performance: [Observed] The shell loaded promptly after a short demo initialization; no benchmark was run.
- Search-content structure: [Observed] In-app surface with a Back control and alert, not an indexable explanation page.
- What works: It evaluates the actual instance and can know recorder and source state that an external checker cannot.
- What fails: Users see only eligible choices or backend issues after entering Home Assistant; they do not get a portable, field-by-field explanation before configuration.
- Do not copy: Do not reproduce the entire Energy settings form or imply remote access to a user's instance.

```text
+--------------------------------------+
| ←  Energy configuration              |
+--------------------------------------+
| Alert: energy/validate unavailable   |
|                                      |
| [ Back ]                             |
+--------------------------------------+
```

### Competitor 2: Home Assistant Developer Tools Statistics

- URL: https://demo.home-assistant.io/#/developer-tools/statistics
- Accessed: 2026-08-09 at 1280 × 720; fully accessible as a table, with no demo statistics rows.
- Audience and promise: [Observed] Instance-level inspection and repair of statistics metadata and issues.
- Inputs and defaults: [Observed] Search box; group by Device, Area, Source, Issue, or no grouping; collapse/expand; sort by Issue, Name, Device, Area, Statistic ID, Statistics unit, or Source; selection mode and table customization.
- Action and state behavior: [Observed] Live search/group/sort controls operate over instance statistics; the demo's empty state read `No statistics found.`
- Results and visuals: [Observed] A dense table exposes Name, Device, Area, Statistic ID, Statistics unit, Source, Issue, Fix issue, and Adjust sum.
- Formula or data source: [Documented] Home Assistant stores five-minute short-term statistics and hourly long-term aggregates; `measurement` supplies mean/min/max and total classes supply state/sum.
- Errors and edge behavior: [Observed] Empty state is explicit, but it does not distinguish no tracked entities from demo data limitations.
- Mobile and accessibility: [Unknown] Narrow table reflow was not verified; search and table columns were semantically exposed.
- Privacy: [Documented] Statistics are stored in the user's Home Assistant instance; optional analytics is separate and opt-in.
- Performance: [Observed] Empty table and controls rendered without a visible loading delay after the demo initialized.
- Search-content structure: [Observed] H1-equivalent page label `Debug tools`, selected `Statistics` tab, table-first content, no explanatory search copy.
- What works: It is the authoritative place to reveal unit/statistics errors and repair stored metadata.
- What fails: It answers only after the entity is in the user's instance and assumes the user already understands how the issue relates to an Energy role.
- Do not copy: Do not turn the checker into an admin table or offer destructive sum adjustment.

```text
+--------------------------------------------------------------+
| Tools / Debug tools   YAML States ... [Statistics]            |
+--------------------------------------------------------------+
| [Search] [Group by] [Sort by Issue] [Table settings]          |
| Name | Statistic ID | Unit | Source | Issue | Fix | Adjust     |
|                    No statistics found                         |
+--------------------------------------------------------------+
```

### Competitor 3: Home Assistant Developer Tools States

- URL: https://demo.home-assistant.io/#/developer-tools/state
- Accessed: 2026-08-09 at 1280 × 720; fully accessible with representative demo entities.
- Audience and promise: [Observed] Inspect current entity IDs, states, devices, areas, and attributes; optionally set a temporary state.
- Inputs and defaults: [Observed] Device, Area, and Attributes columns defaulted on; filters exist for entity, state, device, area, and attributes; `Set state` is the primary action.
- Action and state behavior: [Observed] Filtering is live. A representative energy row exposed `sensor.tesla_wall_connector_session_energy`, state `16.3`, `device_class: energy`, `state_class: total_increasing`, and `unit_of_measurement: kWh`.
- Results and visuals: [Observed] One large table combines copy-ID and more-info actions with raw attribute text.
- Formula or data source: [Documented] It reads the current Home Assistant state machine; current attributes are necessary evidence but do not by themselves prove recorder/statistics health.
- Errors and edge behavior: [Observed] Missing attributes appear as absent text rather than a role-specific error; unrelated entities remain unless the user filters them.
- Mobile and accessibility: [Unknown] Narrow table behavior was not verified; filters, checkboxes, links, and column headers had semantic roles.
- Privacy: [Documented] State data remains in the user's local instance under Home Assistant's default local-data model.
- Performance: [Observed] A long mixed entity table rendered quickly in the demo; no benchmark was run.
- Search-content structure: [Observed] `Current entity states` heading, selected States tab, filters, then table; no guidance connecting an attribute combination to Energy eligibility.
- What works: It exposes the exact raw facts users must copy into an external checker.
- What fails: It presents facts without judgment, lets users temporarily overwrite state, and does not show the deciding Energy rule.
- Do not copy: Do not include unrelated entity administration or a `Set state` capability.

```text
+---------------------------------------------------------------+
| Tools / Debug tools     [States] Statistics Template ...       |
+---------------------------------------------------------------+
| Current entity states       [Device✓ Area✓ Attributes✓]        |
| [Set state]                                                   |
| Entity filter | State | Device | Area | Attribute filter       |
| sensor...     | 16.3  | —      | —    | energy / total / kWh   |
+---------------------------------------------------------------+
```

### Competitor 4: Home Assistant Developer Tools Template

- URL: https://demo.home-assistant.io/#/developer-tools/template
- Accessed: 2026-08-09 at 1280 × 720; editor accessible, public demo did not evaluate the controlled attribute probe.
- Audience and promise: [Observed] Test Home Assistant templates and inspect a rendered result while authoring sensors or automations.
- Inputs and defaults: [Observed] A multiline editor starts with a demo template; controls include reset, clear, undo, redo, copy, find/replace, and fullscreen.
- Action and state behavior: [Observed] The result area updates in the same page. In the public demo, a probe using `state_attr()` remained visible as raw template text rather than evaluated values, exposing the demo backend limitation.
- Results and visuals: [Observed] Split editor/result hierarchy with result type and an event-listening note.
- Formula or data source: [Documented] Home Assistant's template functions read entity state and attributes; this surface has no built-in Energy-role decision table.
- Errors and edge behavior: [Observed] The demo did not show a clear error when evaluation was unavailable; it displayed raw text, which could be mistaken for a valid result.
- Mobile and accessibility: [Unknown] Narrow editor stacking was not verified; named toolbar buttons and textbox semantics were present.
- Privacy: [Documented] Templates run in the user's Home Assistant instance under the local-data model.
- Performance: [Observed] Editor and result changes appeared without a page navigation; no benchmark was run.
- Search-content structure: [Observed] `Template editor` and `Result` headings plus an `About templates` control; it targets authors, not Energy troubleshooting search intent.
- What works: Expert users can build a bespoke attribute probe and copy the result.
- What fails: It requires knowing the exact template and eligibility rules before starting.
- Do not copy: Do not make users write Jinja or expose a generic code editor for a three-attribute check.

```text
+--------------------------------------------------------+
| Template editor                         [About]         |
+--------------------------+-----------------------------+
| multiline Jinja editor   | Result                      |
|                          | Result type: string         |
+--------------------------+-----------------------------+
| Reset Clear Undo Redo Copy Find Fullscreen             |
+--------------------------------------------------------+
```

### Competitor 5: Home Assistant Developer Tools YAML

- URL: https://demo.home-assistant.io/#/developer-tools/yaml
- Accessed: 2026-08-09 at 1280 × 720; page accessible, demo check action produced no visible completion state.
- Audience and promise: [Observed] Validate the whole Home Assistant YAML configuration before restarting and reload supported configuration areas.
- Inputs and defaults: [Observed] No pasted-input field; actions are Check configuration, Restart, All YAML configuration, Location & customisations, Automations, Groups/group entities/notify services, and Scripts.
- Action and state behavior: [Observed] Validation is explicit-submit. Clicking `Check configuration` in the public demo did not add a visible success, error, or loading message.
- Results and visuals: [Observed] Calm two-section layout: `Check and restart` followed by `YAML configuration reloading`.
- Formula or data source: [Documented] It validates instance configuration sufficiently to prevent startup failures; it is not an Energy picker eligibility validator.
- Errors and edge behavior: [Unknown] No invalid configuration could safely be injected into the public demo, and the stub produced no observable completion response.
- Mobile and accessibility: [Unknown] Narrow behavior was not verified; all actions had button roles and headings were semantically exposed.
- Privacy: [Documented] Configuration stays on the user's Home Assistant instance under the local-data model.
- Performance: [Observed] The page rendered promptly; the check action's completion could not be measured in the demo.
- Search-content structure: [Observed] Headings and short descriptions explain validation versus reloading, but there is no entity-attribute result.
- What works: It provides a safe next verification step after editing YAML.
- What fails: A configuration can be syntactically valid while its entity remains ineligible for an Energy field.
- Do not copy: Do not claim YAML syntax validation proves semantic eligibility or offer restart/reload actions.

```text
+-----------------------------------------------+
| Check and restart                             |
| Basic configuration validation                |
| [Check configuration] [Restart]               |
+-----------------------------------------------+
| YAML configuration reloading                  |
| [All YAML] [Customisations] [Automations] ... |
+-----------------------------------------------+
```

## Comparison matrix

| Capability | Energy configuration | Statistics | States | Template | YAML | User value |
| --- | --- | --- | --- | --- | --- | --- |
| Knows intended Energy role | Yes, through field context | No | No | Only if authored | No | High |
| Reads current entity attributes | Yes, in instance | Partial metadata | Yes | Yes, with code | No | High |
| Explains the deciding rule | Limited | Issue-specific | No | User-authored | No | High |
| Checks statistics errors | Yes through validation | Yes | No | No | No | High |
| Works before editing Home Assistant | No | No | No | No | No | High |
| Distinguishes Energy and LTS eligibility | Implicit | Statistics only | No | User-authored | No | High |
| Gives deterministic correction direction | Limited | Repair for stored issues | No | No | Syntax only | High |
| Accepts copied attributes without instance access | No | No | No | No | No | High |
| Keeps data local | Yes | Yes | Yes | Yes | Yes | High |
| Indexable answer for search users | No | No | No | No | No | Medium |

## Formula and data disagreements

| Question | Different behaviors | Best evidence | Decision still needed |
| --- | --- | --- | --- |
| Does valid metadata mean the entity is eligible? | States shows metadata only; Energy validation also considers statistics issues and configured fields | Energy FAQ plus `energy/validate` frontend contract | No: present separate `attribute result` and `instance checks still required` states |
| Should accumulated energy always use `total_increasing`? | Forum answers often prescribe it universally; current developer docs recommend `total` without `last_reset` when it fits and reserve `total_increasing` for reset-to-zero monotonic counters | Sensor developer documentation | Yes: product plan must define the counter-behavior questions and avoid universal repair snippets |
| Is a power sensor valid? | It is valid for optional power measurement fields but not as the accumulated energy statistic used for totals | Energy overview and FAQ | No: the intended field must be a required input |
| Which units are accepted for each role? | FAQ delegates exact lists to in-product help and warns about superscript characters; code owns device-class unit validation | Current Home Assistant release source and UI help | Yes: implementation must pin a release and extract/test exact allowlists before coding |
| Can the external checker guarantee picker visibility? | It cannot inspect recorder inclusion, stored-unit transitions, integration errors, or live backend validation | Energy FAQ and issue #89739 | No: the strongest honest result is `attributes eligible; verify Statistics and Energy settings in your instance` |

## Evidence-backed opportunities

1. **Ask for the Energy field first**: competitors force users to infer whether they are configuring accumulated energy, optional power, gas, water, or an individual device. Role-first evaluation prevents the common power-versus-energy false answer.
2. **Return two conclusions**: show Energy attribute eligibility separately from long-term-statistics eligibility, then list the live-instance checks that cannot be performed in a browser-only tool.
3. **Show the first failing rule and a complete trace**: state the expected and received domain, device class, state class, unit family, and counter behavior without making users scan a table of every entity.
4. **Support pasted state attributes**: the States tool already exposes copyable facts, but no current workflow turns them into a role-specific explanation outside the instance.
5. **Version-anchor the rules**: display the Home Assistant release/source date and link each decision to the official rule so the tool can be updated without pretending the rules are timeless.
6. **Use guarded correction guidance**: suggest a template sensor or integration issue only when deterministic; otherwise identify who owns the metadata and the exact next inspection surface.

## Table stakes

- Role-specific evaluation for grid import, grid export, solar production, battery charge, battery discharge, optional power measurement, gas, water, and individual-device energy.
- Manual fields plus a paste path for copied Home Assistant state attributes.
- Clear invalid, incomplete, attribute-pass, attribute-fail, and needs-instance-check states.
- Separate domain, numeric value, device class, state class, unit, and counter-behavior checks.
- Direct links to Developer Tools States, Statistics, the Energy FAQ, and the relevant sensor documentation.
- Local-only browser processing with no Home Assistant URL, token, or entity history upload.
- Keyboard-operable controls, semantic result status, narrow-screen reflow, reset, and repeat checking.
- Release-pinned fixtures derived from official Home Assistant code and documentation.

## Ideas to reject

- **Connect directly to the user's Home Assistant instance**: it creates authentication, network, and privacy risk that is unnecessary for an MVP.
- **Guarantee “will appear”**: recorder exclusion and statistics errors remain unknowable without instance access.
- **Generate YAML for every failure**: integrations, helpers, MQTT entities, template sensors, and customizations have different owners; generic snippets can be wrong.
- **Always recommend `total_increasing`**: it mishandles counters that decrease, are noisy, or fit `total` semantics.
- **Copy Home Assistant's full settings UI**: the useful wedge is faster diagnosis, not another dashboard configuration form.
- **Add an FAQ or long methodology essay**: the tool should answer first, expose a compact rule trace, and link to primary sources.
- **Store pasted entity data or tokens**: the checker needs only non-sensitive metadata and should process it locally.

## Open questions and blockers

- Product planning must choose the first release's supported Home Assistant version and extract the exact role/unit allowlists from that release's authoritative frontend/Core behavior.
- Product planning must decide whether optional current-value checks are advisory or required; attributes can be evaluated without the user's historical series.
- No research blocker remains. The public demo's unimplemented `energy/validate` backend prevents a successful live validation example, but official source and documentation establish the contract, and the limitation itself was observed and recorded.

## Sources

- Home Assistant Energy FAQ: https://www.home-assistant.io/docs/energy/faq/, accessed 2026-08-09. Documented picker requirements, domain constraint, statistics-error dependency, and unit warning.
- Home Assistant energy overview: https://www.home-assistant.io/docs/energy/, accessed 2026-08-09. Documented source roles and accumulated-energy versus optional-power inputs.
- Home Assistant sensor entity documentation: https://developers.home-assistant.io/docs/core/entity/sensor/, accessed 2026-08-09. Documented state classes, long-term-statistics rules, reset behavior, and total semantics.
- Home Assistant statistics documentation: https://data.home-assistant.io/docs/statistics/, accessed 2026-08-09. Documented aggregation cadence and measurement-versus-total result fields.
- Home Assistant frontend energy contract: https://github.com/home-assistant/frontend/blob/dev/src/data/energy.ts, accessed 2026-08-09. Documented current preference fields and validation commands; implementation must pin a release rather than `dev`.
- Home Assistant Core sensor validation: https://github.com/home-assistant/core/blob/dev/homeassistant/components/sensor/__init__.py, accessed 2026-08-09. Documented device-class/state-class/unit validation behavior; implementation must pin a release.
- Home Assistant privacy FAQ: https://www.home-assistant.io/faq/is-my-data-private/, accessed 2026-08-09. Documented local-storage default.
- Home Assistant public demo: https://demo.home-assistant.io/, accessed 2026-08-09. Observed all five interactive substitute workflows and their demo limitations.
- Home Assistant Core issue #89739: https://github.com/home-assistant/core/issues/89739, accessed 2026-08-09. Documented recorder exclusion as a failure beyond visible attributes.
- Home Assistant Core issue #130537: https://github.com/home-assistant/core/issues/130537, accessed 2026-08-09. Community pain evidence for fragmented and conflicting troubleshooting.
- Home Assistant Community missing-entity thread: https://community.home-assistant.io/t/why-is-the-entity-not-available-to-be-selected-in-the-energy-tab/763855, accessed 2026-08-09. User-pain evidence for power versus energy confusion.
- Home Assistant Community sensor thread: https://community.home-assistant.io/t/why-are-my-sensors-not-showing-in-the-energy-dashboard/593820, accessed 2026-08-09. User-pain evidence for attribute and statistics confusion.
- Home Assistant Community complexity thread: https://community.home-assistant.io/t/why-the-heck-is-it-so-complicated-to-add-entities-to-the-the-energy-dashboard/467538, accessed 2026-08-09. Long-lived user-pain evidence.
- Reddit current missing-entity discussion: https://www.reddit.com/r/homeassistant/comments/1tydx4s/energy_dashboard_doesnt_show_any_entities/, accessed 2026-08-09. Recent demand evidence.
- Google exact search: https://www.google.com/search?q=%22Home+Assistant+Energy+Entity+Eligibility+Checker%22, accessed 2026-08-09 in Browser. Observed no exact result and fallback to docs/community results.
- Bing exact search: https://www.bing.com/search?q=%22Home+Assistant+Energy+Entity+Eligibility+Checker%22, accessed 2026-08-09 in Browser. Observed video-led results and no dedicated checker.
