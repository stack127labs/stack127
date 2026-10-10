import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const telegram: AppShortcuts = {
  slug: "telegram",
  name: "Telegram",
  category: "Messaging",
  platforms: [...platforms],
  versionContext:
    "Telegram Desktop shortcuts checked September 1, 2026 against the current desktop source and official translation strings. Telegram lets users customize and reset these bindings in Chat Settings > Keyboard shortcuts.",
  sourceUrl: "https://github.com/telegramdesktop/tdesktop/blob/dev/Telegram/SourceFiles/core/shortcuts.cpp",
  sourceLabel: "official Telegram Desktop shortcut definitions",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "application",
      title: "Application and windows",
      intro: "Application shortcuts close, lock, minimize, and quit Telegram Desktop, while search opens the current chat search field.",
      shortcuts: [
        { id: "close-window", action: "Close the current window", keys: combo(platforms, ["Ctrl", "W"], ["Cmd", "W"]) },
        { id: "close-window-alt", action: "Close the current window alternative", keys: perPlatform(platforms, { windows: ["Ctrl", "F4"], macos: ["Cmd", "W"], linux: ["Ctrl", "F4"] }) },
        { id: "lock", action: "Lock Telegram", keys: combo(platforms, ["Ctrl", "L"], ["Cmd", "L"]) },
        { id: "minimize", action: "Minimize the window", keys: combo(platforms, ["Ctrl", "M"], ["Cmd", "M"]) },
        { id: "quit", action: "Quit Telegram", keys: combo(platforms, ["Ctrl", "Q"], ["Cmd", "Q"]) },
        { id: "search", action: "Search messages", keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]) },
        { id: "keyboard-settings", action: "Open Keyboard shortcuts settings", keys: perPlatform(platforms, { windows: ["Ctrl", ","], macos: ["Cmd", ","], linux: ["Ctrl", ","] }) },
      ],
    },
    {
      id: "chat-navigation",
      title: "Chat navigation",
      intro: "Chat navigation shortcuts move among chats, pinned chats, folders, saved messages, contacts, and the archive.",
      shortcuts: [
        { id: "next-chat", action: "Open the next chat", keys: perPlatform(platforms, { windows: ["Ctrl", "PageDown"], macos: ["Cmd", "PageDown"], linux: ["Ctrl", "PageDown"] }) },
        { id: "previous-chat", action: "Open the previous chat", keys: perPlatform(platforms, { windows: ["Ctrl", "PageUp"], macos: ["Cmd", "PageUp"], linux: ["Ctrl", "PageUp"] }) },
        { id: "next-chat-alt", action: "Open the next chat alternative", keys: perPlatform(platforms, { windows: ["Alt", "Down"], macos: ["Option", "Down"], linux: ["Alt", "Down"] }) },
        { id: "previous-chat-alt", action: "Open the previous chat alternative", keys: perPlatform(platforms, { windows: ["Alt", "Up"], macos: ["Option", "Up"], linux: ["Alt", "Up"] }) },
        { id: "first-chat", action: "Open the first chat", keys: combo(platforms, ["Ctrl", "Alt", "Home"], ["Cmd", "Option", "Home"]) },
        { id: "last-chat", action: "Open the last chat", keys: combo(platforms, ["Ctrl", "Alt", "End"], ["Cmd", "Option", "End"]) },
        { id: "pinned-chat", action: "Open pinned chat 1", keys: combo(platforms, ["Ctrl", "1"], ["Cmd", "1"]), note: "Use the number from 1 through 8 for a pinned chat." },
        { id: "saved-messages", action: "Open Saved Messages", keys: combo(platforms, ["Ctrl", "0"], ["Cmd", "0"]) },
        { id: "archive", action: "Open Archive", keys: combo(platforms, ["Ctrl", "9"], ["Cmd", "9"]) },
        { id: "contacts", action: "Open Contacts", keys: combo(platforms, ["Ctrl", "J"], ["Cmd", "J"]) },
        { id: "next-folder", action: "Open the next folder", keys: combo(platforms, ["Ctrl", "Shift", "Down"], ["Cmd", "Shift", "Down"]) },
        { id: "previous-folder", action: "Open the previous folder", keys: combo(platforms, ["Ctrl", "Shift", "Up"], ["Cmd", "Shift", "Up"]) },
      ],
    },
    {
      id: "chat-actions",
      title: "Chat actions",
      intro: "Chat actions mark a chat read and expose the desktop chat menu and message controls shown by Telegram's translation settings.",
      shortcuts: [
        { id: "mark-read", action: "Mark the current chat as read", keys: combo(platforms, ["Ctrl", "R"], ["Cmd", "R"]) },
        { id: "chat-menu", action: "Show the chat menu", keys: combo(platforms, ["Ctrl", "Shift", "M"], ["Cmd", "Shift", "M"]) },
        { id: "send", action: "Send a message", keys: perPlatform(platforms, { windows: ["Enter"], macos: ["Return"], linux: ["Enter"] }) },
        { id: "send-silent", action: "Send silently", keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Return"]) },
        { id: "scheduled", action: "Send or schedule a message", keys: combo(platforms, ["Ctrl", "Shift", "Enter"], ["Cmd", "Shift", "Return"]) },
        { id: "next-message", action: "Go to the next message", keys: perPlatform(platforms, { windows: ["Down"], macos: ["Down"], linux: ["Down"] }) },
        { id: "previous-message", action: "Go to the previous message", keys: perPlatform(platforms, { windows: ["Up"], macos: ["Up"], linux: ["Up"] }) },
      ],
    },
  ],
};

export default telegram;
