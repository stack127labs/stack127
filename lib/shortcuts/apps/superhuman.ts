import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

export const superhuman: AppShortcuts = {
  slug: "superhuman",
  name: "Superhuman",
  category: "Email",
  platforms: [...platforms],
  versionContext:
    "Superhuman Mail desktop shortcuts for Windows and Mac, from Superhuman's official v8 keyboard shortcut PDFs (Mac Edition and Windows & Linux Edition). The full list is in the app: press Cmd/Ctrl+K, then choose Shortcuts.",
  sourceUrl: "https://help.superhuman.com/hc/en-us/articles/46005701270541-Keyboard-Shortcuts-in-Superhuman-Mail",
  sourceLabel: "official Superhuman Mail keyboard shortcuts",
  lastVerified: "2026-11-03",
  groups: [
    {
      id: "inbox",
      title: "Inbox and conversations",
      intro: "Inbox shortcuts search, select, label, move, complete, snooze, star, and remove conversations without leaving the keyboard.",
      shortcuts: [
        { id: "command", action: "Open Superhuman Command", keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]) },
        { id: "search", action: "Search", keys: perPlatform(platforms, { windows: ["/"], macos: ["/"] }) },
        { id: "undo", action: "Undo", keys: perPlatform(platforms, { windows: ["Z"], macos: ["Z"] }) },
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
        { id: "discard-draft", action: "Discard a draft", keys: combo(platforms, ["Ctrl", "Shift", ","], ["Cmd", "Shift", ","]) },
        { id: "send", action: "Send", keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Enter"]) },
        { id: "send-done", action: "Send and mark done", keys: combo(platforms, ["Ctrl", "Shift", "Enter"], ["Cmd", "Shift", "Enter"]) },
        { id: "instant-send", action: "Send immediately", keys: perPlatform(platforms, { macos: ["Cmd", "Shift", "Z"] }) },
      ],
    },
    {
      id: "navigation",
      title: "Navigation and tabs",
      intro: "Navigation shortcuts move between folders, messages, splits, tabs, accounts, and the conversation page while preserving focus.",
      shortcuts: [
        { id: "open-inbox", action: "Open Inbox", keys: perPlatform(platforms, { windows: ["G", "then", "I"], macos: ["G", "then", "I"] }) },
        { id: "open-sent", action: "Open Sent", keys: perPlatform(platforms, { windows: ["G", "then", "T"], macos: ["G", "then", "T"] }) },
        { id: "open-drafts", action: "Open Drafts", keys: perPlatform(platforms, { windows: ["G", "then", "D"], macos: ["G", "then", "D"] }) },
        { id: "open-calendar", action: "Open the Calendar day view", keys: perPlatform(platforms, { windows: ["0"], macos: ["0"] }) },
        { id: "next-conversation", action: "Open the next conversation", keys: perPlatform(platforms, { windows: ["J"], macos: ["J"] }) },
        { id: "previous-conversation", action: "Open the previous conversation", keys: perPlatform(platforms, { windows: ["K"], macos: ["K"] }) },
        { id: "next-tab", action: "Open the next tab", keys: combo(platforms, ["Ctrl", "Shift", "]"], ["Cmd", "Shift", "]"]) },
        { id: "previous-tab", action: "Open the previous tab", keys: combo(platforms, ["Ctrl", "Shift", "["], ["Cmd", "Shift", "["]) },
        { id: "switch-tab", action: "Switch to a tab by number", keys: combo(platforms, ["Ctrl", "1"], ["Cmd", "1"]) },
        { id: "new-window", action: "Open a new window", keys: combo(platforms, ["Ctrl", "N"], ["Cmd", "N"]) },
        { id: "close-tab", action: "Close the current tab", keys: combo(platforms, ["Ctrl", "W"], ["Cmd", "W"]) },
        { id: "copy-link", action: "Copy the page link", keys: combo(platforms, ["Alt", "/"], ["Ctrl", "/"]) },
        { id: "back", action: "Go back", keys: perPlatform(platforms, { windows: ["Esc"], macos: ["Esc"] }) },
      ],
    },
  ],
};

export default superhuman;
