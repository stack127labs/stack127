# Shortcut coverage audit

Reviewed 2026-08-26. This is the editorial QA record for the structured data in `lib/shortcuts/apps/`. It is not displayed on the public pages.

## Coverage standard

The 26 published app records were checked against the current official reference for that app or platform. Rows use documented default bindings and supported built-in bindings, grouped by the work a reader is trying to do. Platform differences remain explicit, and documented alternative bindings are rendered as alternatives rather than as one impossible multi-key chord.

The reference does not pretend that a remappable keymap, extension or plugin, user profile, shell integration, language server, Vim or Helix mode, or keyboard layout has one finite universal list. Those cases are called out in the app context or row note, and the official runtime/default keymap is linked where the source itself is the complete reference.

## Official references reviewed

| App | Official reference | Review focus |
| --- | --- | --- |
| Brave | https://support.brave.app/hc/en-us/articles/360032272171-What-keyboard-shortcuts-can-I-use-in-Brave | Browser tabs, windows, navigation, pages, search, downloads, developer tools |
| Chrome | https://support.google.com/chrome/answer/157179 | Tabs, windows, pages, address bar, browser actions, scrolling, developer tools |
| Claude Code | https://code.claude.com/docs/en/interactive-mode | Input editing, modes, multiline input, transcript, history, image paste |
| Codex | https://github.com/openai/codex/blob/main/codex-rs/tui/src/keymap.rs | Current TUI defaults, prompt editing, overlays, transcript controls |
| Cursor | https://cursor.com/docs/reference/keyboard-shortcuts | General editor, chat, inline edit, context, terminal |
| Microsoft Excel | https://support.microsoft.com/en-us/office/keyboard-shortcuts-in-excel-1798d9d5-842a-42b8-9c99-9b7213f0040f | Workbook, ribbon, navigation, selection, formatting, data, formulas, Copilot |
| Figma | https://help.figma.com/hc/en-us/articles/360040328653-Use-Figma-products-with-a-keyboard | Tools, canvas navigation, selection, layers, objects, presentation |
| Firefox | https://support.mozilla.org/en-US/kb/keyboard-shortcuts-perform-firefox-tasks-quickly | Navigation, tabs, history, bookmarks, search, media, PDF, developer tools |
| Ghostty | https://ghostty.org/docs/config/keybind | Splits, tabs, clipboard, search, scrollback, view, configuration |
| GitHub | https://docs.github.com/en/get-started/accessibility/keyboard-shortcuts | Sitewide, repositories, code browsing, issues, pull requests, projects, actions |
| Gmail | https://support.google.com/mail/answer/6594 | Compose, formatting, inbox triage, conversations, views, search, accessibility |
| GNOME | https://help.gnome.org/gnome-help/shell-keyboard-shortcuts.html | Activities, windows, workspaces, system controls, screenshots, recording |
| Google Sheets | https://support.google.com/docs/answer/181110 | Common actions, formatting, navigation, comments, menus, rows and columns, formulas |
| iTerm2 | https://iterm2.com/documentation-one-page.html | Panes, tabs, windows, search, replay, clipboard, marks, fullscreen |
| macOS | https://support.apple.com/en-us/102650 | Common actions, Finder, screenshots, text editing, accessibility, system controls |
| Neovim | https://neovim.io/doc/user/quickref/ and https://neovim.io/doc/user/lsp/ | Modal editing, motions, operators, search, windows, terminal mode, built-in LSP/commenting |
| Notion | https://www.notion.com/help/keyboard-shortcuts | Desktop actions, Markdown, blocks, databases, page movement, search |
| OpenCode | https://opencode.ai/docs/keybinds | Leader key, sessions, models, prompt editing, dialogs, transcript, terminal |
| Pi coding agent | https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/keybindings.md | Editor, queue, transcript, sessions, models, tools, Windows/WSL differences |
| PowerShell / PSReadLine | https://learn.microsoft.com/en-us/powershell/module/psreadline/about/about_psreadline_functions?view=powershell-7.6 | Emacs and Vi modes, cursor movement, editing, history, completion, selection |
| Slack | https://slack.com/help/articles/201374536-Slack-keyboard-shortcuts | Workspace navigation, conversations, messages, huddles, formatting, canvas |
| Vim | https://vimhelp.org/quickref.txt.html | Modes, motions, operators, search, folds, windows, files, commands |
| Visual Studio Code | https://code.visualstudio.com/docs/reference/default-keybindings | Basic editing, language services, navigation, files, display, search, chat, debug, tasks |
| Windows | https://support.microsoft.com/en-us/windows/keyboard-shortcuts-in-windows-dcc61a57-8ff0-cffe-9796-cb9706c75eec | Text editing, Windows key, desktops, windows, File Explorer, command prompt, accessibility |
| Windows Terminal | https://learn.microsoft.com/en-us/windows/terminal/customize-settings/actions | Tabs, panes, clipboard, search, scrollback, font, settings, command palette limits |
| Zed | https://zed.dev/docs/key-bindings | Workspace, editor, search, language services, panes, agent, terminal, Git; current platform keymaps |

## Deliberate exclusions and caveats

- Public pages do not show source-check labels, verification footers, or research timestamps. Source metadata stays in the structured records and this audit.
- Unbound actions are not rendered as guessed key combinations. A row can say that the current official default has no binding, or explain the setup needed for an action to work.
- Platform-specific differences stay in separate key entries whenever a shared `Ctrl` or `Cmd` row would be misleading.
- A sequence such as `Ctrl`, `X`, `Ctrl`, `K` is one action with sequential strokes. Alternative sequences are stored separately and rendered with an `or` separator.
- Gmail shortcuts must be enabled. Slack's single-key layer is desktop-focused and language-sensitive. Figma, Notion, GitHub, and browser lists can also vary with focus or browser context.
- Ghostty and Zed provide a complete build or runtime keymap through their own commands or source files; the page presents the documented daily-use defaults and links that authoritative complete list.
- Vim and Neovim are modal. Neovim LSP rows require an attached language server; its current built-in LSP defaults are documented separately from the quick reference, and plugin or user mappings can replace core behavior.
- Claude Code, Codex, OpenCode, and Pi are terminal interfaces. Terminal emulator, shell, OS, and user keymap behavior can intercept a sequence before the application sees it.
