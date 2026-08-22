import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const cursor: AppShortcuts = {
  slug: "cursor",
  name: "Cursor",
  category: "AI code editor",
  platforms: [...platforms],
  intro:
    "Cursor adds an AI workbench to an editor that still feels familiar to VS Code users. Start with the chat and inline-edit keys, then use the panel, autocomplete, and terminal controls when the task moves out of the file.",
  versionContext:
    "Cursor-specific defaults from the official docs in August 2026. The docs print each shortcut as a macOS and Windows/Linux pair: Windows and Linux use Ctrl wherever macOS uses Cmd, and Alt wherever macOS uses Option.",
  sourceUrl: "https://cursor.com/docs/reference/keyboard-shortcuts",
  sourceLabel: "official keyboard shortcuts",
  lastVerified: "2026-08-21",
  groups: [
    {
      id: "panels",
      title: "Panels and modes",
      intro: "Open the AI side panel, change its layout, and switch the mode used for the next request.",
      shortcuts: [
        {
          id: "command-palette",
          action: "Open command palette",
          keys: combo(platforms, ["Ctrl", "Shift", "P"], ["Cmd", "Shift", "P"]),
        },
        {
          id: "toggle-sidepanel",
          action: "Toggle AI side panel",
          keys: combo(platforms, ["Ctrl", "I"], ["Cmd", "I"]),
        },
        {
          id: "toggle-chat-panel",
          action: "Toggle chat side panel",
          keys: combo(platforms, ["Ctrl", "L"], ["Cmd", "L"]),
        },
        {
          id: "toggle-agent-layout",
          action: "Toggle Agent layout",
          keys: combo(platforms, ["Ctrl", "E"], ["Cmd", "E"]),
        },
        {
          id: "mode-menu",
          action: "Open mode menu",
          keys: combo(platforms, ["Ctrl", "."], ["Cmd", "."]),
        },
        {
          id: "cursor-settings",
          action: "Open Cursor settings",
          keys: combo(platforms, ["Ctrl", "Shift", "J"], ["Cmd", "Shift", "J"]),
        },
      ],
    },
    {
      id: "chat",
      title: "Chat and agent",
      intro: "Driving the agent chat input and its suggested changes.",
      shortcuts: [
        {
          id: "add-selection-to-chat",
          action: "Add selected code as context",
          keys: combo(platforms, ["Ctrl", "Shift", "L"], ["Cmd", "Shift", "L"]),
          note: "Requires code selected in the editor.",
        },
        {
          id: "cancel-generation",
          action: "Cancel generation",
          keys: combo(platforms, ["Ctrl", "Shift", "Backspace"], ["Cmd", "Shift", "Backspace"]),
        },
        {
          id: "reject-all-changes",
          action: "Reject all suggested changes",
          keys: combo(platforms, ["Ctrl", "Backspace"], ["Cmd", "Backspace"]),
        },
        {
          id: "rotate-agent-modes",
          action: "Rotate between agent modes",
          keys: combo(platforms, ["Shift", "Tab"]),
        },
        {
          id: "new-chat",
          action: "New chat",
          keys: combo(platforms, ["Ctrl", "N"], ["Cmd", "N"]),
          note: "Ctrl+R (Cmd+R) also starts a new chat.",
        },
        {
          id: "previous-chat",
          action: "Previous chat",
          keys: combo(platforms, ["Ctrl", "["], ["Cmd", "["]),
          note: "Use ] for the next chat.",
        },
        {
          id: "close-chat",
          action: "Close chat",
          keys: combo(platforms, ["Ctrl", "W"], ["Cmd", "W"]),
        },
      ],
    },
    {
      id: "inline-edit",
      title: "Inline edit",
      intro: "Start a prompt-driven edit at the cursor and apply the suggested change without opening a separate chat.",
      shortcuts: [
        {
          id: "inline-edit-open",
          action: "Open inline edit",
          keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]),
        },
        {
          id: "inline-edit-submit",
          action: "Submit inline edit",
          keys: combo(platforms, ["Enter"]),
        },
        {
          id: "inline-edit-cancel",
          action: "Cancel inline edit",
          keys: combo(platforms, ["Ctrl", "Shift", "Backspace"], ["Cmd", "Shift", "Backspace"]),
        },
        {
          id: "ask-quick-question",
          action: "Ask a quick question instead of editing",
          keys: perPlatformAsk(),
        },
      ],
    },
    {
      id: "autocomplete",
      title: "Tab autocomplete",
      intro: "Accept, dismiss, or move through Cursor's inline code suggestions.",
      shortcuts: [
        { id: "accept-suggestion", action: "Accept suggestion", keys: combo(platforms, ["Tab"]) },
        {
          id: "accept-next-word",
          action: "Accept next word of suggestion",
          keys: combo(platforms, ["Ctrl", "Right"], ["Cmd", "Right"]),
        },
      ],
    },
    {
      id: "terminal",
      title: "Terminal",
      intro: "Generate a shell command from natural language, then move the result into the integrated terminal.",
      shortcuts: [
        {
          id: "terminal-prompt-bar",
          action: "Open terminal prompt bar",
          keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]),
          note: "Same keys as inline edit; context decides which opens.",
        },
        {
          id: "run-generated-command",
          action: "Run generated command",
          keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Enter"]),
        },
        {
          id: "accept-command",
          action: "Accept command without running it",
          keys: combo(platforms, ["Esc"]),
        },
      ],
    },
  ],
};

function perPlatformAsk() {
  return [
    { platform: "windows" as const, keys: ["Alt", "Enter"] },
    { platform: "macos" as const, keys: ["Option", "Enter"] },
    { platform: "linux" as const, keys: ["Alt", "Enter"] },
  ];
}
