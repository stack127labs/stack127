import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const claudeCode: AppShortcuts = {
  slug: "claude-code",
  name: "Claude Code",
  category: "AI coding agent",
  platforms: [...platforms],
  intro:
    "Claude Code spends most of its time waiting for a decision, running a tool, or holding a prompt. These keys cover those moments, including interrupts, rewinds, mode changes, multiline input, and terminal-style editing.",
  versionContext:
    "Interactive mode shortcuts from the official docs in August 2026. Keys can vary by terminal; Alt key shortcuts need Option configured as Meta on macOS. Bindings are customizable since v2.1.18 through /keybindings.",
  sourceUrl: "https://code.claude.com/docs/en/interactive-mode",
  sourceLabel: "official interactive mode reference",
  lastVerified: "2026-08-21",
  groups: [
    {
      id: "session-control",
      title: "Session control",
      intro:
        "Esc is the normal way to stop Claude mid-turn and keep finished work. Ctrl+C cancels input or generation, and exits only after two presses.",
      shortcuts: [
        {
          id: "interrupt",
          action: "Interrupt Claude mid-turn",
          keys: combo(platforms, ["Esc"]),
          note: "Keeps the work done so far.",
        },
        {
          id: "rewind",
          action: "Clear input draft, or open the rewind menu when input is empty",
          keys: combo(platforms, ["Esc", "Esc"]),
        },
        {
          id: "cancel-or-exit",
          action: "Cancel current input or generation",
          keys: combo(platforms, ["Ctrl", "C"]),
          note: "First press clears the prompt when nothing is running; second press exits.",
        },
        { id: "exit-session", action: "Exit the session", keys: combo(platforms, ["Ctrl", "D"]) },
        {
          id: "clear-screen",
          action: "Redraw the terminal screen, keeping history",
          keys: combo(platforms, ["Ctrl", "L"]),
        },
        {
          id: "background-bash",
          action: "Move a running Bash command to the background",
          keys: combo(platforms, ["Ctrl", "B"]),
        },
        {
          id: "stop-background-work",
          action: "Stop all running background agents",
          keys: combo(platforms, ["Ctrl", "X", "Ctrl", "K"]),
          note: "Press the sequence twice within three seconds to confirm.",
        },
        { id: "toggle-task-list", action: "Toggle Claude's task checklist", keys: combo(platforms, ["Ctrl", "T"]) },
        { id: "stash-prompt", action: "Stash or restore the current prompt", keys: combo(platforms, ["Ctrl", "S"]) },
        { id: "suspend-session", action: "Suspend Claude Code to the shell", keys: combo(platforms, ["Ctrl", "Z"]), note: "Unix only. Run fg to resume." },
        { id: "switch-dialog-tab", action: "Cycle through permission dialog tabs", keys: combo(platforms, ["Left", "Right"]), note: "Use either arrow key to move between tabs." },
        { id: "switch-model", action: "Switch models without clearing the prompt", keys: [{ platform: "macos", keys: ["Option", "P"] }, { platform: "windows", keys: ["Alt", "P"] }, { platform: "linux", keys: ["Alt", "P"] }] },
        { id: "toggle-fast-mode", action: "Toggle fast mode", keys: [{ platform: "macos", keys: ["Option", "O"] }, { platform: "windows", keys: ["Alt", "O"] }, { platform: "linux", keys: ["Alt", "O"] }] },
      ],
    },
    {
      id: "modes",
      title: "Modes and thinking",
      intro: "Change permission and thinking modes while the session stays open.",
      shortcuts: [
        {
          id: "cycle-permission-modes",
          action: "Cycle permission modes",
          keys: combo(platforms, ["Shift", "Tab"]),
          note:
            "Cycles default, acceptEdits, plan, and any enabled modes such as auto or bypassPermissions.",
        },
        {
          id: "toggle-thinking",
          action: "Toggle extended thinking",
          keys: combo(platforms, ["Tab"]),
        },
        {
          id: "enable-vim-mode",
          action: "Enable vim-style editing",
          keys: [],
          note: "Run /vim once; Esc then switches to NORMAL mode and i to INSERT.",
        },
      ],
    },
    {
      id: "input-and-history",
      title: "Input and history",
      intro: "Move through prompts, edit the current line, search history, and open the transcript or external editor.",
      shortcuts: [
        {
          id: "history",
          action: "Navigate command history",
          keys: combo(platforms, ["Up"]),
          note: "Down moves forward. In multiline input the arrows move the cursor first.",
        },
        {
          id: "reverse-search",
          action: "Reverse search through prompt history",
          keys: combo(platforms, ["Ctrl", "R"]),
          note: "Tab or Esc accepts a match for editing; Enter runs it.",
        },
        {
          id: "transcript",
          action: "Toggle the transcript viewer",
          keys: combo(platforms, ["Ctrl", "O"]),
        },
        {
          id: "external-editor",
          action: "Open the current prompt in your external editor",
          keys: combo(platforms, ["Ctrl", "G"]),
        },
        {
          id: "undo-input-edit",
          action: "Undo the last input edit",
          keys: combo(platforms, ["Ctrl", "_"]),
          note: "Ctrl+Shift+- does the same.",
        },
        {
          id: "word-back",
          action: "Move cursor back one word",
          keys: combo(platforms, ["Alt", "B"]),
          note: "Requires Option as Meta on macOS.",
        },
        {
          id: "word-forward",
          action: "Move cursor forward one word",
          keys: combo(platforms, ["Alt", "F"]),
          note: "Requires Option as Meta on macOS.",
        },
        { id: "line-start", action: "Move cursor to the start of the current line", keys: combo(platforms, ["Ctrl", "A"]) },
        { id: "line-end", action: "Move cursor to the end of the current line", keys: combo(platforms, ["Ctrl", "E"]) },
        { id: "delete-to-end", action: "Delete from the cursor to the end of the line", keys: combo(platforms, ["Ctrl", "K"]) },
        { id: "delete-to-start", action: "Delete from the cursor to the start of the line", keys: combo(platforms, ["Ctrl", "U"]) },
        { id: "delete-next-word", action: "Delete the next word", keys: combo(platforms, ["Alt", "D"]), note: "Requires Option as Meta on macOS." },
        { id: "paste-deleted", action: "Paste the most recently deleted text", keys: combo(platforms, ["Ctrl", "Y"]) },
        { id: "cycle-paste-history", action: "Cycle through deleted-text history", keys: combo(platforms, ["Alt", "Y"]), note: "Press after Ctrl+Y. Requires Option as Meta on macOS." },
      ],
    },
    {
      id: "multiline-input",
      title: "Multiline input",
      intro: "Add a line break without sending the message, whether the terminal supports Shift+Enter or not.",
      shortcuts: [
        {
          id: "backslash-enter",
          action: "New line with backslash then Enter",
          keys: combo(platforms, ["\\", "Enter"]),
          note: "Works in all terminals.",
        },
        {
          id: "ctrl-j",
          action: "New line with a line feed",
          keys: combo(platforms, ["Ctrl", "J"]),
        },
        {
          id: "option-enter",
          action: "New line on macOS defaults",
          keys: [{ platform: "macos", keys: ["Option", "Enter"] }],
        },
        {
          id: "shift-enter",
          action: "New line after running /terminal-setup",
          keys: combo(platforms, ["Shift", "Enter"]),
          note: "Native in iTerm2, WezTerm, Ghostty, Kitty, Warp, Apple Terminal, and Windows Terminal.",
        },
      ],
    },
    {
      id: "prompt-prefixes",
      title: "Prompt prefixes",
      intro: "The first character of an empty prompt changes what the line does.",
      shortcuts: [
        {
          id: "slash-commands",
          action: "Run a slash command",
          keys: combo(platforms, ["/"]),
        },
        {
          id: "bash-mode",
          action: "Run the line as a shell command in the session",
          keys: combo(platforms, ["!"]),
        },
        {
          id: "memory-shortcut",
          action: "Add the line to CLAUDE.md memory",
          keys: combo(platforms, ["#"]),
        },
        {
          id: "file-mention",
          action: "Reference a file, agent, or MCP resource",
          keys: combo(platforms, ["@"]),
        },
      ],
    },
    {
      id: "display-and-help",
      title: "Display and help",
      intro: "Open the in-session help and control how Claude's response is displayed while you work.",
      shortcuts: [
        { id: "theme-syntax", action: "Toggle syntax highlighting in the theme picker", keys: combo(platforms, ["Ctrl", "T"]) },
        { id: "shortcut-help", action: "Toggle the shortcut help panel on an empty prompt", keys: combo(platforms, ["?"]) },
        { id: "voice-input", action: "Start or stop voice dictation", keys: combo(platforms, ["Space"]), note: "Requires voice dictation to be enabled." },
        { id: "transcript-help", action: "Toggle transcript viewer shortcut help", keys: combo(platforms, ["?"]), note: "Use inside the transcript viewer." },
        { id: "transcript-scrollback", action: "Write the full conversation to terminal scrollback", keys: combo(platforms, ["["]), note: "Available in fullscreen transcript rendering." },
        { id: "transcript-editor", action: "Open the transcript in your editor", keys: combo(platforms, ["V"]), note: "Available in fullscreen transcript rendering." },
      ],
    },
  ],
};
