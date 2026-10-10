import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

export const superhuman: AppShortcuts = {
  slug: "superhuman",
  name: "Superhuman",
  category: "Email",
  platforms: [...platforms],
  versionContext:
    "Superhuman Mail desktop shortcuts checked September 1, 2026. The official guide and shortcut PDF note that bindings can vary by platform and that the Command menu exposes the current list.",
  sourceUrl: "https://help.superhuman.com/hc/en-us/articles/46005701270541-Keyboard-Shortcuts-in-Superhuman-Mail",
  sourceLabel: "official Superhuman Mail keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "inbox",
      title: "Inbox and conversations",
      intro: "Inbox shortcuts search, select, label, move, complete, snooze, star, and remove conversations without leaving the keyboard.",
      shortcuts: [
        { id: "command", action: "Open Superhuman Command", keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]) },
        { id: "search", action: "Search", keys: perPlatform(platforms, { windows: ["/"], macos: ["/"] }) },
        { id: "undo", action: "Undo", keys: combo(platforms, ["Ctrl", "Z"], ["Cmd", "Z"]) },
        { id: "select-conversation", action: "Select a conversation", keys: perPlatform(platforms, { windows: ["X"], macos: ["X"] }) },
        { id: "select-all", action: "Select all conversations from here", keys: combo(platforms, ["Ctrl", "A"], ["Cmd", "A"]) },
        { id: "select-all-conversations", action: "Select all conversations", keys: combo(platforms, ["Ctrl", "Shift", "A"], ["Cmd", "Shift", "A"]) },
        { id: "add-label", action: "Add or remove a label", keys: perPlatform(platforms, { windows: ["L"], macos: ["L"] }) },
        { id: "move", action: "Move a conversation", keys: perPlatform(platforms, { windows: ["V"], macos: ["V"] }) },
        { id: "done", action: "Mark a conversation done", keys: perPlatform(platforms, { windows: ["E"], macos: ["E"] }) },
        { id: "not-done", action: "Mark a conversation not done", keys: perPlatform(platforms, { windows: ["Shift", "E"], macos: ["Shift", "E"] }) },
        { id: "snooze", action: "Snooze a conversation", keys: perPlatform(platforms, { windows: ["H"], macos: ["H"] }) },
        { id: "star", action: "Star or unstar a conversation", keys: perPlatform(platforms, { windows: ["S"], macos: ["S"] }) },
        { id: "read", action: "Mark read or unread", keys: perPlatform(platforms, { windows: ["U"], macos: ["U"] }) },
        { id: "trash", action: "Move a conversation to Trash", keys: perPlatform(platforms, { windows: ["#"], macos: ["#"] }) },
        { id: "spam", action: "Mark a conversation as spam", keys: perPlatform(platforms, { windows: ["!"], macos: ["!"] }) },
        { id: "mute", action: "Mute a conversation", keys: perPlatform(platforms, { windows: ["Shift", "M"], macos: ["Shift", "M"] }) },
        { id: "unsubscribe", action: "Unsubscribe from a mailing list", keys: combo(platforms, ["Ctrl", "U"], ["Cmd", "U"]) },
      ],
    },
    {
      id: "compose",
      title: "Compose and format",
      intro: "Compose shortcuts open replies and drafts, manage recipients and attachments, format text, and send or discard a message.",
      shortcuts: [
        { id: "compose-message", action: "Compose", keys: perPlatform(platforms, { windows: ["C"], macos: ["C"] }) },
        { id: "reply", action: "Reply", keys: perPlatform(platforms, { windows: ["R"], macos: ["R"] }) },
        { id: "reply-all", action: "Reply all", keys: perPlatform(platforms, { windows: ["Enter"], macos: ["Return"] }) },
        { id: "forward", action: "Forward", keys: perPlatform(platforms, { windows: ["F"], macos: ["F"] }) },
        { id: "attachment", action: "Attach a file", keys: combo(platforms, ["Ctrl", "Shift", "A"], ["Cmd", "Shift", "A"]) },
        { id: "bold", action: "Bold", keys: perPlatform(platforms, { windows: ["Ctrl", "B"], macos: ["Cmd", "B"] }) },
        { id: "italic", action: "Italic", keys: perPlatform(platforms, { windows: ["Ctrl", "I"], macos: ["Cmd", "I"] }) },
        { id: "underline", action: "Underline", keys: perPlatform(platforms, { windows: ["Ctrl", "U"], macos: ["Cmd", "U"] }) },
        { id: "hyperlink", action: "Add a hyperlink", keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]) },
        { id: "discard-draft", action: "Discard a draft", keys: perPlatform(platforms, { windows: ["Shift", "\\"], macos: ["Shift", "\\"] }) },
        { id: "send", action: "Send", keys: perPlatform(platforms, { windows: ["Enter"], macos: ["Return"] }) },
        { id: "send-done", action: "Send and mark done", keys: perPlatform(platforms, { windows: ["Shift", "Enter"], macos: ["Shift", "Return"] }) },
        { id: "instant-send", action: "Send immediately", keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Return"]) },
      ],
    },
    {
      id: "navigation",
      title: "Navigation and tabs",
      intro: "Navigation shortcuts move between folders, messages, splits, tabs, accounts, and the conversation page while preserving focus.",
      shortcuts: [
        { id: "open-inbox", action: "Open Inbox", keys: perPlatform(platforms, { windows: ["G", "I"], macos: ["G", "I"] }) },
        { id: "open-sent", action: "Open Sent", keys: perPlatform(platforms, { windows: ["G", "S"], macos: ["G", "S"] }) },
        { id: "open-drafts", action: "Open Drafts", keys: perPlatform(platforms, { windows: ["G", "D"], macos: ["G", "D"] }) },
        { id: "open-calendar", action: "Open Calendar", keys: perPlatform(platforms, { windows: ["G", "0"], macos: ["G", "0"] }) },
        { id: "next-conversation", action: "Open the next conversation", keys: perPlatform(platforms, { windows: ["J"], macos: ["J"] }) },
        { id: "previous-conversation", action: "Open the previous conversation", keys: perPlatform(platforms, { windows: ["K"], macos: ["K"] }) },
        { id: "next-tab", action: "Open the next tab", keys: combo(platforms, ["Ctrl", "Shift", "]"], ["Cmd", "Shift", "]"]) },
        { id: "previous-tab", action: "Open the previous tab", keys: combo(platforms, ["Ctrl", "Shift", "["], ["Cmd", "Shift", "["]) },
        { id: "switch-tab", action: "Switch to a tab by number", keys: combo(platforms, ["Ctrl", "1"], ["Cmd", "1"]) },
        { id: "new-window", action: "Open a new window", keys: combo(platforms, ["Ctrl", "Shift", "N"], ["Cmd", "Shift", "N"]) },
        { id: "close-tab", action: "Close the current tab", keys: combo(platforms, ["Ctrl", "W"], ["Cmd", "W"]) },
        { id: "copy-link", action: "Copy the page link", keys: combo(platforms, ["Ctrl", "L"], ["Cmd", "L"]) },
        { id: "back", action: "Go back", keys: combo(platforms, ["Ctrl", "["], ["Cmd", "["]) },
      ],
    },
  ],
};

export default superhuman;
