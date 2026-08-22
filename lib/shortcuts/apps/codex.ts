import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const codex: AppShortcuts = {
  slug: "codex",
  name: "Codex CLI",
  category: "AI coding agent",
  platforms: [...platforms],
  intro:
    "Codex CLI gives you a small TUI around a running coding task. The useful keys are the ones that steer the current turn, queue the next instruction, move through prompt history, and change reasoning effort.",
  versionContext:
    "TUI defaults as documented by OpenAI in mid 2026. Bindings are remappable with /keymap, and slash commands cover actions that have no key.",
  sourceUrl: "https://developers.openai.com/codex/cli/slash-commands",
  sourceLabel: "official Codex CLI docs",
  lastVerified: "2026-08-21",
  groups: [
    {
      id: "steering",
      title: "Steering a running task",
      intro:
        "Enter injects instructions into the current turn while Tab queues work for the next turn instead of interrupting.",
      shortcuts: [
        {
          id: "send-or-inject",
          action: "Send the message, or inject into the running turn",
          keys: combo(platforms, ["Enter"]),
        },
        {
          id: "queue-follow-up",
          action: "Queue a follow-up for the next turn",
          keys: combo(platforms, ["Tab"]),
        },
        {
          id: "interrupt",
          action: "Interrupt the running task",
          keys: combo(platforms, ["Esc"]),
        },
        {
          id: "edit-previous-message",
          action: "Edit your previous message",
          keys: combo(platforms, ["Esc", "Esc"]),
          note: "Keep pressing to walk back through the transcript. The composer must be empty.",
        },
      ],
    },
    {
      id: "session-control",
      title: "Session control",
      intro: "Stop, resume, exit, or change the current Codex session without abandoning the terminal.",
      shortcuts: [
        {
          id: "cancel",
          action: "Cancel the current operation",
          keys: combo(platforms, ["Ctrl", "C"]),
          note: "Press twice to quit the session.",
        },
        {
          id: "exit",
          action: "Exit Codex",
          keys: combo(platforms, ["Ctrl", "D"]),
          note: "Press twice to force quit.",
        },
        {
          id: "clear-tui",
          action: "Clear the terminal UI, keeping the conversation",
          keys: combo(platforms, ["Ctrl", "L"]),
        },
        {
          id: "shortcut-overlay",
          action: "Toggle the shortcut overlay",
          keys: combo(platforms, ["?"]),
        },
      ],
    },
    {
      id: "input-and-history",
      title: "Input and history",
      intro: "Edit the prompt in progress and move through the instructions you have already entered.",
      shortcuts: [
        {
          id: "external-editor",
          action: "Open the current draft in an external editor",
          keys: combo(platforms, ["Ctrl", "G"]),
          note: "Uses VISUAL, falling back to EDITOR.",
        },
        {
          id: "copy-last-response",
          action: "Copy the last agent response to the clipboard",
          keys: combo(platforms, ["Ctrl", "O"]),
        },
        {
          id: "reverse-search",
          action: "Reverse search command history",
          keys: combo(platforms, ["Ctrl", "R"]),
        },
        {
          id: "next-match",
          action: "Next match in reverse search",
          keys: combo(platforms, ["Ctrl", "S"]),
        },
        {
          id: "draft-history",
          action: "Navigate draft history",
          keys: combo(platforms, ["Up"]),
          note: "Down moves forward.",
        },
        {
          id: "file-reference",
          action: "Fuzzy search files to attach to the conversation",
          keys: combo(platforms, ["@"]),
        },
        {
          id: "shell-prefix",
          action: "Run the line as a shell command",
          keys: combo(platforms, ["!"]),
        },
      ],
    },
    {
      id: "reasoning",
      title: "Reasoning effort",
      intro: "Change how much reasoning Codex spends on the current task before you send the next instruction.",
      shortcuts: [
        {
          id: "increase-effort",
          action: "Increase reasoning effort",
          keys: combo(platforms, ["Shift", "Up"]),
        },
        {
          id: "decrease-effort",
          action: "Decrease reasoning effort",
          keys: combo(platforms, ["Shift", "Down"]),
        },
        {
          id: "edit-queued",
          action: "Edit the most recently queued message",
          keys: combo(platforms, ["Shift", "Left"]),
        },
      ],
    },
  ],
};
