# Edge cases and tests: shortcut cheat sheet generator

Status: ready
Tool: Shortcut cheat sheet generator
Route: /shortcuts-cheatsheet-generator
Contract type: resolution
Input fingerprint: `competitive-report.md sha256:676fa9955fe3d39ad936069881af8225df978e8a2575f96141e6d9552bb2c2c3`
Input fingerprint: `implementation-report.md sha256:475575eafd60caaa497dddd320c4084e484ec316972601c795cf356c2c4aa984`
Input fingerprint: `brief.md sha256:d4c1115657d9302ec721595b4184f8e8db6fb8bf4bc14c010fe64c18cb594992`

## Risk model

The main risk is a sheet that looks valid while silently omitting or inventing bindings. A second risk is a control state that prints a different result from the preview. A third risk is a narrow layout that clips the result.

## Requirement traceability

| Requirement | Engine | UI | Browser |
| --- | --- | --- | --- |
| R01 | Empty selection result | Disabled button and empty preview | Empty state test |
| R02 | Platform and group filtering | Checkboxes and radios | Selected app test |
| R03 | Explicit invalid reason | Status region | Unit fixture |
| R04 | Source metadata retained | Source footer | App selection test |
| R05 | Print root marked | Print CSS | Print smoke coverage |
| R06 | No page overflow | CSS reflow | Mobile project |
| R07 | No URL mutation | No browser history code | Reload smoke coverage |

## Coverage checklist

| Family | Coverage |
| --- | --- |
| Input grammar | EC-01, EC-02, EC-03 |
| Numeric boundaries | Not applicable: the tool has no numeric input |
| Configuration dependencies | EC-04 |
| Technical truth | EC-02, EC-05 |
| Submission and concurrency | EC-08 |
| Network and upstream | Not applicable: the client uses server-provided records |
| Persistence and sharing | Not applicable: the first release has no saved state |
| Accessibility | EC-06, EC-07 |
| Responsive and themes | EC-07, EC-08 |
| Security and privacy | EC-05 |
| SSR and SEO | EC-01, EC-08 |
| Performance | EC-08 |

## Edge-case matrix

| ID | Priority | State | Input | Expected engine result | Expected UI | Failure signal | Test layer | Requirements |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EC-01 | P0 | Empty | No selected apps | Invalid with a print reason | Empty preview and disabled button | Button enables without an app | Unit and browser | R01 |
| EC-02 | P0 | Valid | One app, all platforms, all groups | One app section with source data | Preview matches the app page | Count or source differs | Unit and browser | R02, R04 |
| EC-03 | P1 | Partial | One app with one platform | Only that platform remains | One platform choice is visible | Other platform columns remain | Unit | R02 |
| EC-04 | P1 | Invalid | Unknown app or group ID | Explicit invalid reason | Status reports the reason | Plausible sheet appears | Unit | R03 |
| EC-05 | P1 | Missing | Known app with missing platform binding | Missing entry stays absent | Cell says Not documented | Guessed key appears | Unit and browser | R03, R04 |
| EC-06 | P1 | Accessibility | Keyboard-only controls | Native inputs remain reachable | Labels and status are readable | Focus disappears | Browser | R06 |
| EC-07 | P1 | Narrow | 320px and 375px viewport | Same resolved document | Controls reflow and sheet stays contained | Page-level horizontal overflow | Browser | R06 |
| EC-08 | P1 | Print | Valid selection and browser print | Same selected sections | Controls hide, sheet remains | Wrong content prints | Browser | R05, R07 |

## Formula or resolution fixtures

| Fixture | Input | Expected |
| --- | --- | --- |
| RF-001 | brave, macOS, all groups | 24 shortcuts in one app section |
| RF-002 | brave, macOS, empty group list | Invalid result with no sheet |
| RF-003 | brave, Windows, tabs-and-windows only | One section with the selected group |

## Test plan

### Pure engine and unit tests

Use exact app records for empty selection, platform filtering, group filtering, missing bindings, and unknown IDs. Keep resolution outside React.

### Browser tests

Run the directory, app page, generator empty state, selected app state, narrow mobile project, keyboard focus, and print-only assertions. Use the guarded local registry helper.

### Static and SEO tests

Run the route ownership manifest checks, static policy, unpublished route checks, and build. Keep shortcut routes out of the production registry until approved.

## Manual verification

| View | State | Check |
| --- | --- | --- |
| Desktop dark | Empty generator | Workbench, controls, and empty preview align |
| Desktop dark | Brave selected | Preview table is readable and source footer is present |
| Mobile dark | Directory | App rows reflow without page overflow |
| Mobile light | Brave selected | Key chips and labels remain readable |
| Print preview | Brave selected | Only the sheet is visible |

## Plan completion criteria

The generator is ready when the pure engine, route tests, static policy, desktop view, mobile view, light theme, dark theme, and print output agree on the same selected document.
