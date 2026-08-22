# Shortcut coverage audit

Reviewed 2026-08-22. This document is an editorial QA record for the structured data in `lib/shortcuts/apps/`. It is not displayed on the public pages.

## Coverage standard

Each first-release app should include the useful, documented keyboard actions a reader is likely to need while working in the app. Sections follow the task the shortcut supports, not the order used by a vendor help page. A row is included only when the key is explicit in the reviewed reference or is a stable platform-level action clearly labelled as such.

The reference does not attempt to enumerate every command in a remappable keymap, every extension or plugin binding, mobile touch gestures, mouse-only actions, or every keyboard layout variant. Those are separate surfaces and should not be mixed into the default tables.

## Official references reviewed

| App or family | Reference | Review focus |
| --- | --- | --- |
| Chrome | https://support.google.com/chrome/answer/157179 | Tabs, windows, pages, address bar, browser actions, scrolling, find |
| Firefox | https://support.mozilla.org/en-US/kb/keyboard-shortcuts-perform-firefox-tasks-quickly | Navigation, tabs, history, bookmarks, search, media, developer tools |
| Windows | https://support.microsoft.com/en-us/windows/keyboard-shortcuts-in-windows-dcc61a57-8ff0-cffe-9796-cb9706c75eec | Window management, system actions, File Explorer, accessibility, text editing |
| macOS | https://support.apple.com/en-us/102650 | Common actions, Finder, system controls, screenshots, text editing, accessibility |
| Google Sheets | https://support.google.com/docs/answer/181110 | Common actions, formatting, navigation, comments, menus, rows and columns, formulas |
| Microsoft Excel | https://support.microsoft.com/en-us/office/keyboard-shortcuts-in-excel-1798d9d5-842a-42b8-9c99-9b7213f0040f | Frequent actions, cells, formatting, data, formulas, ribbon, function keys |
| Gmail | https://support.google.com/mail/answer/6594 | Navigation, inbox triage, composing, formatting, search, conversations, accessibility |
| GitHub | https://docs.github.com/en/get-started/accessibility/keyboard-shortcuts | Sitewide, repositories, code browsing, issues, pull requests, projects, actions |
| Notion | https://www.notion.com/help/keyboard-shortcuts | Desktop actions, Markdown, blocks, search, navigation, database and page actions |
| Visual Studio Code | https://code.visualstudio.com/docs/reference/default-keybindings | Editing, navigation, search, files, layout, terminals, source control, chat |
| Claude Code | https://code.claude.com/docs/en/interactive-mode | Session controls, input editing, modes, multiline input, quick commands, transcript |

The remaining app records retain their reviewed official or project reference in their structured metadata. Their next QA pass should follow the same section-by-section method before adding more pages.

## Deliberate exclusions

- Public pages do not show source-check labels, verification footers, or research timestamps.
- Unbound actions are not rendered as fake key combinations. Where a setup command or mode is required, the row explains that setup in a note.
- Platform-specific differences stay in separate key entries whenever a shared `Ctrl` or `Cmd` row would be misleading.
- A sequence such as `Ctrl`, `X`, `Ctrl`, `K` is kept as one action with a note explaining that it is sequential rather than simultaneous.

## Follow-up queue

The next audit should deepen the remaining records with unusually dynamic bindings: Zed and OpenCode keymaps, terminal defaults, PowerShell's PSReadLine profile, Figma's in-product shortcut panel, and application-specific Vim or Neovim configurations. These should be reviewed from their current defaults before being described as exhaustive.
