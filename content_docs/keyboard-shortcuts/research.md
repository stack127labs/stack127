# Shortcuts reference research record

Researched 2026-08-21 and source-rechecked 2026-08-26 against official documentation for every included app. Scorecard per the plan: relevance to stack127 readers, search demand, shortcut depth, official docs quality, platform coverage, generator value.

## Finalized core 20

19 of the 20 working candidates passed the scorecard and are included: Visual Studio Code, Cursor, GitHub, Windows Terminal, PowerShell, iTerm2, Vim, Neovim, Google Chrome, Mozilla Firefox, Windows, macOS, Linux GNOME, Microsoft Excel, Google Sheets, Gmail, Slack, Notion, Figma.

Docker Desktop failed the scorecard and is dropped from the first release. Docker does not publish an official keyboard shortcut reference; third-party lists contradict each other (one claims 18 shortcuts, another 46), several listed bindings do not exist in the current app, and the genuinely documented set is a handful of generic navigation keys. Verification confidence is too low for a source-checked reference. It stays a later candidate if Docker ships official documentation.

## Explicit additions

Approved for the first release:

- Claude Code (code.claude.com/docs/en/interactive-mode): rich official shortcut tables, all three platforms.
- Codex (developers.openai.com/codex/cli): documented TUI keys plus slash commands, all three platforms.
- OpenCode (opencode.ai/docs/keybinds): full default keybind list with leader key, all three platforms.
- Pi coding agent (github.com/badlogic/pi-mono coding-agent docs): documented hotkey tables, all three platforms.
- Ghostty (ghostty.org/docs/config/keybind): documented defaults with real macOS versus Linux splits.
- Zed (zed.dev/docs/key-bindings): default keymap documented per platform family.
- Brave Browser (support.brave.com keyboard shortcuts article): official Windows/Linux and macOS tables.

Deferred as later candidates:

- Grok Build: real product (x.ai/cli, early beta) but only a handful of keys are officially documented so far (Enter send, Shift+Tab mode, Ctrl+H home, Ctrl+Q quit). Too thin to verify a useful set. Revisit after beta.
- OrbStack: no official keyboard shortcut documentation exists; only third-party posters of unverified provenance.

## First release

The dataset contains 26 app records: the 19 passing core apps plus 7 approved additions. Every app record carries its official source URL, version context where it affects accuracy, and lastVerified 2026-08-26. The cheatsheet generator preserves documented alternative bindings as separate alternatives, and the app records explicitly identify remappable, mode-specific, focus-specific, and setup-dependent behavior.
