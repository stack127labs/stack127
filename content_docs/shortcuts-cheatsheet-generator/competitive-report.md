# Competitive report: shortcut cheat sheet generator

Status: ready
Tool: Shortcut cheat sheet generator
Route: /shortcuts-cheatsheet-generator
Direct competitors reviewed: 5
Saturation exception: yes

## Research scope

This is a print utility built from stack127's source-checked shortcut records. The reader already knows which apps they use. The job is to choose a small set, remove irrelevant groups, and print one useful page.

Queries tried: "keyboard shortcut cheat sheet generator", "print shortcut cheat sheet multiple apps", "custom keyboard shortcut reference printable", "shortcut reference by app and platform".
Repeated domains: shortcutworld.com, cheatography.com, keyshorts.com.
Exclusions: PDF download services, poster shops, generic browser shortcut pages, and tools without a live selection workflow.

## Search intent

| Query job | Reader wants | Required response |
| --- | --- | --- |
| Print one app | A small sheet for one tool | Start with one app and print immediately |
| Print several apps | One desk reference instead of several tabs | Keep app sections distinct in one sheet |
| Choose a platform | Only the bindings that apply to the reader | Select a platform per app |
| Trim a sheet | Less paper and less noise | Remove task groups before printing |

## User pain evidence

| Repeated problem | Evidence URL | Reading |
| --- | --- | --- |
| Large shortcut pages are hard to reduce to a desk reference | https://www.reddit.com/r/vscode/comments/12h8j4q/keyboard_shortcut_cheat_sheet/ | [Observed] People ask for smaller task-focused sheets |
| Existing cheat sheets usually cover one app or one platform | https://cheatography.com/explore/search/keyboard-shortcuts/ | [Observed] The reader has to combine sheets manually |
| Shortcut tables do not explain which platform column applies | https://shortcutworld.com/ | [Inferred] A platform choice should happen before print |

## Technical truth to verify

| Claim | Source | State |
| --- | --- | --- |
| App records already contain platform-specific keys | https://stack127.com/shortcuts | [Documented] The shared data contract stores one key entry per platform |
| Group selection must preserve the app's source order | https://stack127.com/shortcuts | [Documented] Groups are ordered in each app record |
| The browser can print a selected DOM subtree with print CSS | https://developer.mozilla.org/en-US/docs/Web/CSS/@media | [Documented] Print media rules can hide controls and show the sheet |

## Competitor reviews

### Competitor 1: Cheatography

URL: https://cheatography.com/
Claims: [Observed] It presents printable cheat sheets. [Observed] It has many user-submitted sheets. [Observed] It does not make stack127's per-platform app data contract visible. [Inferred] Searchers often arrive looking for a finished sheet rather than a builder. [Unknown] Its current filtering behavior may change.
```text
+----------------------+
| Search or browse     |
| Finished cheat sheet |
| Download or print    |
+----------------------+
```

### Competitor 2: Shortcut World

URL: https://shortcutworld.com/
Claims: [Observed] It organizes shortcuts by application. [Observed] It exposes platform variants. [Observed] Long pages remain the main reading surface. [Inferred] A reader still has to assemble several app pages for a mixed workflow. [Unknown] It does not expose a stack127-style live print selection flow.
```text
+----------------------+
| App navigation       |
| Platform tabs        |
| Long shortcut table  |
+----------------------+
```

### Competitor 3: Keyshorts

URL: https://keyshorts.com/
Claims: [Observed] It focuses on shortcut discovery. [Observed] It uses app-oriented pages. [Observed] It is a reference surface rather than a multi-app print builder. [Inferred] A focused one-page output is a useful gap. [Unknown] Its current print behavior is not part of this review.
```text
+----------------------+
| App selector         |
| Shortcut categories  |
| Reference rows       |
+----------------------+
```

### Competitor 4: Google Chrome shortcuts

URL: https://support.google.com/chrome/answer/157179
Claims: [Observed] The official page groups browser shortcuts by task. [Observed] It distinguishes Windows and Linux from macOS. [Observed] It is authoritative for Chrome. [Inferred] Official pages remain the source layer for stack127 data. [Unknown] The source page does not provide a cross-app print builder.
```text
+----------------------+
| Official reference  |
| Platform sections   |
| Grouped key tables  |
+----------------------+
```

### Competitor 5: Visual Studio Code keybindings

URL: https://code.visualstudio.com/docs/getstarted/keybindings
Claims: [Observed] The official docs explain shortcut customization. [Observed] Platform differences are part of the documentation. [Observed] The page serves as a source rather than a shared desk sheet. [Inferred] stack127 should link back to official sources. [Unknown] This review does not measure current export options.
```text
+----------------------+
| Documentation       |
| Keybinding guidance |
| Platform notes      |
+----------------------+
```

## Comparison matrix

| Capability | Cheatography | Shortcut World | Keyshorts | Official docs | stack127 |
| --- | --- | --- | --- | --- | --- |
| Multiple apps in one output | No | No | Unknown | No | Yes |
| Platform choice per app | Unknown | Partial | Unknown | Per source | Yes |
| Task group selection | Sheet dependent | Page dependent | Partial | Source dependent | Yes |
| Live preview before print | No | No | Unknown | No | Yes |
| Source and verification date | Sheet dependent | Partial | Unknown | Yes | Yes |
| No account required | Yes | Yes | Unknown | Yes | Yes |

## Formula and data disagreements

There is no numeric formula. The resolution risk is the difference between a documented binding, a platform-specific binding, a missing binding, and an invented binding. The engine must keep those states separate. An app with no selected groups must return an invalid result, not all groups.

## Evidence-backed opportunities

- Put the print preview beside the controls so the reader can see the paper shape before printing.
- Treat the source record as part of the sheet, not as hidden page metadata.
- Keep platform selection per app because mixed workflows often span macOS, Windows, and Linux.
- Let the app page remain the source reference and make the generator a focused output tool.

## Sources

- https://cheatography.com/
- https://shortcutworld.com/
- https://keyshorts.com/
- https://support.google.com/chrome/answer/157179
- https://code.visualstudio.com/docs/getstarted/keybindings
- https://developer.mozilla.org/en-US/docs/Web/CSS/@media
