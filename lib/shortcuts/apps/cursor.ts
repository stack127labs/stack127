import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const cursor: AppShortcuts = {
  slug: "cursor",
  name: "Cursor",
  category: "AI code editor",
  platforms: [...platforms],
  versionContext:
    "Mac uses Cmd where Windows and Linux use Ctrl. Every shortcut can be remapped in Keyboard Shortcuts settings.",
  sourceUrl: "https://cursor.com/docs/reference/keyboard-shortcuts",
  sourceLabel: "official Cursor keyboard shortcuts",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "general-and-panels",
      title: "General and panels",
      intro: "Open Cursor's command palette, settings, side panel, layouts, voice mode, and model controls.",
      shortcuts: [
        {
          id: "toggle-sidepanel",
          action: "Toggle the side panel",
          keys: platforms.map((platform) =>
            platform === "macos"
              ? { platform, keys: ["Cmd", "I"], alternatives: [["Cmd", "L"], ["Cmd", "K"]] }
              : { platform, keys: ["Ctrl", "I"], alternatives: [["Ctrl", "L"], ["Ctrl", "K"]] },
          ),
          note: "These keys toggle the side panel unless they are bound to a mode.",
        },
        { id: "agent-layout", action: "Toggle the Agent layout", keys: combo(platforms, ["Ctrl", "E"], ["Cmd", "E"]) },
        { id: "mode-menu", action: "Open the mode menu", keys: combo(platforms, ["Ctrl", "."], ["Cmd", "."]) },
        { id: "loop-models", action: "Loop through available models", keys: combo(platforms, ["Ctrl", "/"], ["Cmd", "/"]) },
        { id: "cursor-settings", action: "Open Cursor settings", keys: combo(platforms, ["Ctrl", "Shift", "J"], ["Cmd", "Shift", "J"]) },
        { id: "voice-mode", action: "Toggle Voice Mode", keys: combo(platforms, ["Ctrl", "Shift", "Space"], ["Cmd", "Shift", "Space"]) },
        { id: "general-settings", action: "Open general settings", keys: combo(platforms, ["Ctrl", ","], ["Cmd", ","]) },
        { id: "command-palette", action: "Open the command palette", keys: combo(platforms, ["Ctrl", "Shift", "P"], ["Cmd", "Shift", "P"]) },
      ],
    },
    {
      id: "chat",
      title: "Chat and sessions",
      intro: "Send, queue, cancel, navigate, and manage the conversations that sit beside the editor.",
      shortcuts: [
        { id: "queue-message", action: "Queue a message", keys: combo(platforms, ["Enter"]) },
        { id: "force-send", action: "Force-send the chat message", keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Enter"]), note: "While typing in the chat input." },
        { id: "cancel-generation", action: "Cancel generation", keys: combo(platforms, ["Ctrl", "Shift", "Backspace"], ["Cmd", "Shift", "Backspace"]) },
        { id: "add-selection-context", action: "Add selected code as context", keys: combo(platforms, ["Ctrl", "Shift", "L"], ["Cmd", "Shift", "L"]) },
        { id: "add-clipboard-context", action: "Add clipboard content as context", keys: combo(platforms, ["Ctrl", "V"], ["Cmd", "V"]), note: "When the clipboard holds code or a log." },
        { id: "paste-chat-input", action: "Paste clipboard content into chat input", keys: combo(platforms, ["Ctrl", "Shift", "V"], ["Cmd", "Shift", "V"]), note: "When the clipboard holds code or a log." },
        { id: "accept-all-changes", action: "Accept all suggested changes", keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Enter"]), note: "When Cursor has suggested changes." },
        { id: "reject-all-changes", action: "Reject all suggested changes", keys: combo(platforms, ["Ctrl", "Shift", "Backspace"], ["Cmd", "Shift", "Backspace"]), note: "When Cursor has suggested changes." },
        { id: "next-message", action: "Move to the next chat message", keys: combo(platforms, ["Tab"]) },
        { id: "rotate-agent-modes", action: "Rotate through agent modes", keys: combo(platforms, ["Shift", "Tab"]) },
        { id: "toggle-model", action: "Toggle the model selector", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "/"], macos: ["Cmd", "Option", "/"], linux: ["Ctrl", "Alt", "/"] }) },
        {
          id: "new-chat",
          action: "Start a new chat",
          keys: platforms.map((platform) =>
            platform === "macos"
              ? { platform, keys: ["Cmd", "N"], alternatives: [["Cmd", "R"]] }
              : { platform, keys: ["Ctrl", "N"], alternatives: [["Ctrl", "R"]] },
          ),
        },
        { id: "new-chat-tab", action: "Open a new chat tab", keys: combo(platforms, ["Ctrl", "T"], ["Cmd", "T"]) },
        { id: "previous-chat", action: "Open the previous chat", keys: combo(platforms, ["Ctrl", "["], ["Cmd", "["]) },
        { id: "next-chat", action: "Open the next chat", keys: combo(platforms, ["Ctrl", "]"], ["Cmd", "]"]) },
        { id: "close-chat", action: "Close the current chat", keys: combo(platforms, ["Ctrl", "W"], ["Cmd", "W"]) },
        { id: "unfocus-chat", action: "Unfocus the chat input", keys: combo(platforms, ["Esc"]) },
      ],
    },
    {
      id: "code-context-and-suggestions",
      title: "Code context and suggestions",
      intro: "Attach code, search the codebase, and accept suggestions whole or one word at a time.",
      shortcuts: [
        { id: "mention", action: "Open file, symbol, or other context mentions", keys: combo(platforms, ["@"]) },
        { id: "slash-commands", action: "Open chat shortcut commands", keys: combo(platforms, ["/"]) },
        {
          id: "selection-to-chat",
          action: "Add the selection to a new chat",
          keys: platforms.map((platform) =>
            platform === "macos"
              ? { platform, keys: ["Cmd", "L"], alternatives: [["Cmd", "K"]] }
              : { platform, keys: ["Ctrl", "L"], alternatives: [["Ctrl", "K"]] },
          ),
        },
        { id: "selection-to-context", action: "Add the selection to chat context", keys: combo(platforms, ["Ctrl", "Shift", "L"], ["Cmd", "Shift", "L"]) },
        { id: "accept-next-word", action: "Accept the next word of an inline suggestion", keys: combo(platforms, ["Ctrl", "Right"], ["Cmd", "Right"]) },
        { id: "search-codebase", action: "Search the codebase in chat", keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Enter"]) },
        { id: "copy-reference-code", action: "Copy selected code and paste it as a reference", keys: combo(platforms, ["Ctrl", "C", "Ctrl", "V"], ["Cmd", "C", "Cmd", "V"]), note: "Select the code first, then copy it and paste it into chat." },
        { id: "copy-code-text-context", action: "Paste copied code as text context", keys: combo(platforms, ["Ctrl", "C", "Ctrl", "Shift", "V"], ["Cmd", "C", "Cmd", "Shift", "V"]), note: "Select the code first, then copy it and paste it into chat." },
        { id: "accept-suggestion", action: "Accept an inline suggestion", keys: combo(platforms, ["Tab"]) },
      ],
    },
  ],
};

export default cursor;
