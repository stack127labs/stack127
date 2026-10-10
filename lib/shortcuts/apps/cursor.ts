import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const cursor: AppShortcuts = {
  slug: "cursor",
  name: "Cursor",
  category: "AI code editor",
  platforms: [...platforms],
  versionContext:
    "Default Cursor bindings from cursor.com checked August 26, 2026. Cursor notes that the full list is available by pressing Cmd+R or Ctrl+R and saving with Cmd+S or Ctrl+S. Every shortcut can be remapped.",
  sourceUrl: "https://cursor.com/docs/reference/keyboard-shortcuts",
  sourceLabel: "official Cursor keyboard shortcuts",
  lastVerified: "2026-08-26",
  groups: [
    {
      id: "general-and-panels",
      title: "General and panels",
      intro: "Open Cursor's command palette, settings, side panels, layouts, voice mode, and model controls.",
      shortcuts: [
        { id: "toggle-sidepanel", action: "Toggle the side panel", keys: combo(platforms, ["Ctrl", "I"], ["Cmd", "I"]) },
        { id: "toggle-chat-panel", action: "Toggle the chat side panel", keys: combo(platforms, ["Ctrl", "L"], ["Cmd", "L"]) },
        { id: "agent-layout", action: "Open Agent layout", keys: combo(platforms, ["Ctrl", "E"], ["Cmd", "E"]) },
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
        { id: "nudge", action: "Send a nudge in the chat input", keys: combo(platforms, ["Enter"]) },
        { id: "queue-message", action: "Queue a message", keys: perPlatform(platforms, { windows: ["Ctrl", "Enter"], macos: ["Ctrl", "Enter"], linux: ["Ctrl", "Enter"] }) },
        { id: "force-send", action: "Force-send the chat message", keys: perPlatform(platforms, { windows: ["Ctrl", "Enter"], macos: ["Cmd", "Enter"], linux: ["Ctrl", "Enter"] }), note: "Cursor documents Ctrl+Enter as queue and Cmd+Enter or Ctrl+Enter as force-send according to the input state." },
        { id: "cancel-generation", action: "Cancel generation", keys: combo(platforms, ["Ctrl", "Shift", "Backspace"], ["Cmd", "Shift", "Backspace"]) },
        { id: "add-selection-context", action: "Add selected code as context", keys: combo(platforms, ["Ctrl", "Shift", "L"], ["Cmd", "Shift", "L"]) },
        { id: "add-clipboard-context", action: "Add clipboard content as context", keys: combo(platforms, ["Ctrl", "V"], ["Cmd", "V"]) },
        { id: "paste-chat-input", action: "Paste clipboard content into chat input", keys: combo(platforms, ["Ctrl", "Shift", "V"], ["Cmd", "Shift", "V"]) },
        { id: "accept-all-changes", action: "Accept all suggested changes", keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Enter"]), note: "The same key is context-sensitive in chat; use the visible action hint when queueing or sending." },
        { id: "reject-all-changes", action: "Reject all suggested changes", keys: combo(platforms, ["Ctrl", "Backspace"], ["Cmd", "Backspace"]) },
        { id: "next-message", action: "Move to the next chat message", keys: combo(platforms, ["Tab"]) },
        { id: "rotate-agent-modes", action: "Rotate through agent modes", keys: combo(platforms, ["Shift", "Tab"]) },
        { id: "toggle-model", action: "Toggle the model selector", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "/"], macos: ["Cmd", "Option", "/"], linux: ["Ctrl", "Alt", "/"] }) },
        { id: "new-chat", action: "Start a new chat", keys: combo(platforms, ["Ctrl", "N"], ["Cmd", "N"]), note: "Cmd+R or Ctrl+R also starts a new chat from the chat view." },
        { id: "new-chat-tab", action: "Open a new chat tab", keys: combo(platforms, ["Ctrl", "T"], ["Cmd", "T"]) },
        { id: "previous-chat", action: "Open the previous chat", keys: combo(platforms, ["Ctrl", "["], ["Cmd", "["]) },
        { id: "next-chat", action: "Open the next chat", keys: combo(platforms, ["Ctrl", "]"], ["Cmd", "]"]) },
        { id: "close-chat", action: "Close the current chat", keys: combo(platforms, ["Ctrl", "W"], ["Cmd", "W"]) },
        { id: "unfocus-chat", action: "Unfocus the chat input", keys: combo(platforms, ["Esc"]) },
      ],
    },
    {
      id: "inline-edit",
      title: "Inline edit",
      intro: "Open an inline edit, submit it, cancel it, or ask a quick question about the selected code.",
      shortcuts: [
        { id: "inline-edit-open", action: "Open inline edit", keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]) },
        { id: "inline-edit-focus", action: "Toggle focus in the inline-edit input", keys: combo(platforms, ["Ctrl", "Shift", "K"], ["Cmd", "Shift", "K"]) },
        { id: "inline-edit-submit", action: "Submit inline edit", keys: combo(platforms, ["Enter"]) },
        { id: "inline-edit-cancel", action: "Cancel inline edit", keys: combo(platforms, ["Ctrl", "Shift", "Backspace"], ["Cmd", "Shift", "Backspace"]) },
        { id: "ask-quick-question", action: "Ask a quick question instead of editing", keys: perPlatform(platforms, { windows: ["Alt", "Enter"], macos: ["Option", "Return"], linux: ["Alt", "Enter"] }) },
      ],
    },
    {
      id: "code-context-and-suggestions",
      title: "Code context and suggestions",
      intro: "Attach code, search the codebase, change file-reading strategy, and accept suggestions one word at a time.",
      shortcuts: [
        { id: "mention", action: "Open file, symbol, or other context mentions", keys: combo(platforms, ["@"]) },
        { id: "slash-commands", action: "Open chat shortcut commands", keys: combo(platforms, ["/"]) },
        { id: "selection-to-chat", action: "Add the selection to a new chat", keys: combo(platforms, ["Ctrl", "L"], ["Cmd", "L"]) },
        { id: "selection-to-edit", action: "Add the selection to inline edit", keys: combo(platforms, ["Ctrl", "Shift", "K"], ["Cmd", "Shift", "K"]) },
        { id: "selection-to-context", action: "Add the selection to chat context", keys: combo(platforms, ["Ctrl", "Shift", "L"], ["Cmd", "Shift", "L"]) },
        { id: "file-reading-strategy", action: "Toggle file-reading strategies", keys: combo(platforms, ["Ctrl", "M"], ["Cmd", "M"]) },
        { id: "accept-next-word", action: "Accept the next word of an inline suggestion", keys: combo(platforms, ["Ctrl", "Right"], ["Cmd", "Right"]) },
        { id: "search-codebase", action: "Search the codebase in chat", keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Enter"]) },
        { id: "copy-reference-code", action: "Copy selected code and paste it as a reference", keys: combo(platforms, ["Ctrl", "C", "Ctrl", "V"], ["Cmd", "C", "Cmd", "V"]), note: "Cursor documents this as a copy then paste gesture when selected code is used as context." },
        { id: "copy-code-text-context", action: "Paste copied code as text context", keys: combo(platforms, ["Ctrl", "C", "Ctrl", "Shift", "V"], ["Cmd", "C", "Cmd", "Shift", "V"]), note: "Cursor documents this as a copy then paste gesture." },
        { id: "accept-suggestion", action: "Accept an inline suggestion", keys: combo(platforms, ["Tab"]) },
      ],
    },
    {
      id: "terminal",
      title: "Terminal prompt",
      intro: "Ask Cursor to generate a terminal command, run it, or accept it into the terminal without running it.",
      shortcuts: [
        { id: "terminal-prompt-bar", action: "Open the terminal prompt bar", keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]) },
        { id: "run-generated-command", action: "Run the generated terminal command", keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Enter"]) },
        { id: "accept-command", action: "Accept the generated command without running it", keys: combo(platforms, ["Esc"]) },
      ],
    },
  ],
};

export default cursor;
