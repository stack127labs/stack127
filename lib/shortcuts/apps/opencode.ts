import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const opencode: AppShortcuts = {
  slug: "opencode",
  name: "OpenCode",
  category: "AI coding agent",
  platforms: [...platforms],
  intro:
    "OpenCode puts most TUI actions behind a leader key so the terminal stays usable for text input. Learn the leader sequence first, then use the session, panel, model, and command controls around it.",
  versionContext:
    "Default TUI keybinds from opencode.ai in August 2026. Every binding is remappable in tui.json. On Windows, terminal_suspend is forced off and input_undo gains a ctrl+z default because Windows terminals have no POSIX suspend.",
  sourceUrl: "https://opencode.ai/docs/keybinds",
  sourceLabel: "official keybinds reference",
  lastVerified: "2026-08-21",
  groups: [
    {
      id: "leader-basics",
      title: "Leader basics",
      intro:
        "Most actions start with the leader key, Ctrl+X by default: press it, release, then press the action key within two seconds. Ctrl+P opens the command palette, which shows the chord next to every command.",
      shortcuts: [
        {
          id: "leader",
          action: "Leader key that prefixes most chords",
          keys: combo(platforms, ["Ctrl", "X"]),
        },
        {
          id: "command-palette",
          action: "Open the command palette",
          keys: combo(platforms, ["Ctrl", "P"]),
        },
        {
          id: "exit",
          action: "Exit OpenCode",
          keys: combo(platforms, ["Ctrl", "C"]),
          note: "Ctrl+D and Ctrl+X then q also exit.",
        },
        {
          id: "interrupt",
          action: "Interrupt the current session",
          keys: combo(platforms, ["Esc"]),
        },
      ],
    },
    {
      id: "sessions",
      title: "Sessions",
      intro: "Create, switch, fork, and close sessions while keeping the agent context visible.",
      shortcuts: [
        {
          id: "new-session",
          action: "New session",
          keys: combo(platforms, ["Ctrl", "X", "N"]),
        },
        {
          id: "session-list",
          action: "List sessions",
          keys: combo(platforms, ["Ctrl", "X", "L"]),
        },
        {
          id: "compact",
          action: "Compact the session context",
          keys: combo(platforms, ["Ctrl", "X", "C"]),
        },
        {
          id: "export",
          action: "Export the session to Markdown",
          keys: combo(platforms, ["Ctrl", "X", "X"]),
        },
        {
          id: "timeline",
          action: "Show the session timeline",
          keys: combo(platforms, ["Ctrl", "X", "G"]),
        },
        {
          id: "rename-session",
          action: "Rename the session",
          keys: combo(platforms, ["Ctrl", "R"]),
        },
      ],
    },
    {
      id: "panels-and-tools",
      title: "Panels and tools",
      intro: "Open the command palette, model picker, help, permissions, and the panels around the conversation.",
      shortcuts: [
        {
          id: "models",
          action: "List models",
          keys: combo(platforms, ["Ctrl", "X", "M"]),
        },
        {
          id: "themes",
          action: "List themes",
          keys: combo(platforms, ["Ctrl", "X", "T"]),
        },
        {
          id: "editor-open",
          action: "Compose the message in an external editor",
          keys: combo(platforms, ["Ctrl", "X", "E"]),
          note: "Uses the editor in your EDITOR environment variable.",
        },
        {
          id: "sidebar-toggle",
          action: "Toggle the sidebar",
          keys: combo(platforms, ["Ctrl", "X", "B"]),
        },
        {
          id: "status-view",
          action: "Show the status view",
          keys: combo(platforms, ["Ctrl", "X", "S"]),
        },
        {
          id: "copy-message",
          action: "Copy the last message",
          keys: combo(platforms, ["Ctrl", "X", "Y"]),
          note: "Ctrl+Shift+C also copies.",
        },
        {
          id: "file-reference",
          action: "Reference a file in your message",
          keys: combo(platforms, ["@"]),
        },
        {
          id: "bash-prefix",
          action: "Run the line as a shell command",
          keys: combo(platforms, ["!"]),
        },
      ],
    },
  ],
};
