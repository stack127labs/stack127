import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const piCodingAgent: AppShortcuts = {
  slug: "pi-coding-agent",
  name: "Pi coding agent",
  category: "AI coding agent",
  platforms: [...platforms],
  intro:
    "Pi's keyboard model separates the message you are writing from the work already running. These keys handle session control, model and thinking changes, queued messages, and editing the current prompt.",
  versionContext:
    "Documented defaults from the official README and keybindings guide in August 2026. Every shortcut is remappable in ~/.pi/agent/keybindings.json, and /hotkeys lists them in-app.",
  sourceUrl: "https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent",
  sourceLabel: "official README and keybindings docs",
  lastVerified: "2026-08-21",
  groups: [
    {
      id: "session-control",
      title: "Session control",
      intro: "Interrupt, clear, exit, or change the current pi session without losing the terminal.",
      shortcuts: [
        {
          id: "cancel-or-exit",
          action: "Clear the editor, or exit on the second press",
          keys: combo(platforms, ["Ctrl", "C"]),
        },
        {
          id: "exit-empty",
          action: "Exit when the editor is empty",
          keys: combo(platforms, ["Ctrl", "D"]),
        },
        {
          id: "abort",
          action: "Cancel autocomplete or abort streaming",
          keys: combo(platforms, ["Esc"]),
        },
        {
          id: "session-tree",
          action: "Open the session tree to jump to an earlier point",
          keys: combo(platforms, ["Esc", "Esc"]),
        },
        {
          id: "suspend",
          action: "Suspend to the background",
          keys: combo(platforms, ["Ctrl", "Z"]),
          note: "Resume with fg in the shell.",
        },
      ],
    },
    {
      id: "models-and-thinking",
      title: "Models and thinking",
      intro: "Switch models, providers, and thinking levels while the prompt remains available.",
      shortcuts: [
        {
          id: "model-selector",
          action: "Open the model selector",
          keys: combo(platforms, ["Ctrl", "L"]),
        },
        {
          id: "cycle-models",
          action: "Cycle scoped models forward",
          keys: combo(platforms, ["Ctrl", "P"]),
          note: "Shift+Ctrl+P cycles backward.",
        },
        {
          id: "thinking-level",
          action: "Cycle the thinking level",
          keys: combo(platforms, ["Shift", "Tab"]),
        },
        {
          id: "tool-output",
          action: "Toggle tool output expansion",
          keys: combo(platforms, ["Ctrl", "O"]),
        },
        {
          id: "thinking-blocks",
          action: "Toggle thinking block visibility",
          keys: combo(platforms, ["Ctrl", "T"]),
        },
      ],
    },
    {
      id: "message-queue",
      title: "Message queue",
      intro:
        "While the agent works, Enter queues a steering message delivered after the current tool call, and Alt+Enter queues a follow-up for after all work finishes.",
      shortcuts: [
        {
          id: "send-steering",
          action: "Send now, or queue a steering message while busy",
          keys: combo(platforms, ["Enter"]),
        },
        {
          id: "queue-follow-up",
          action: "Queue a follow-up message",
          keys: combo(platforms, ["Alt", "Enter"]),
        },
        {
          id: "abort-queue",
          action: "Abort and restore queued messages to the editor",
          keys: combo(platforms, ["Esc"]),
        },
      ],
    },
    {
      id: "editing",
      title: "Editing and input",
      intro: "Move through the prompt, edit text, open history, and insert a line without sending it.",
      shortcuts: [
        {
          id: "path-completion",
          action: "Complete paths or accept autocomplete",
          keys: combo(platforms, ["Tab"]),
        },
        {
          id: "file-reference",
          action: "Fuzzy search project files to reference",
          keys: combo(platforms, ["@"]),
        },
        {
          id: "external-editor",
          action: "Edit the message in your external editor",
          keys: combo(platforms, ["Ctrl", "G"]),
          note: "Uses VISUAL or EDITOR.",
        },
        {
          id: "paste-image",
          action: "Paste an image from the clipboard",
          keys: combo(platforms, ["Ctrl", "V"]),
        },
        {
          id: "delete-word-back",
          action: "Delete one word backwards",
          keys: combo(platforms, ["Ctrl", "W"]),
          note: "Option+Backspace does the same on macOS.",
        },
        {
          id: "delete-to-start",
          action: "Delete to the start of the line",
          keys: combo(platforms, ["Ctrl", "U"]),
        },
        {
          id: "delete-to-end",
          action: "Delete to the end of the line",
          keys: combo(platforms, ["Ctrl", "K"]),
        },
      ],
    },
  ],
};
