import { combo } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

const shared = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: combo(platforms, keys),
  ...(note ? { note } : {}),
});

export const rocketChat: AppShortcuts = {
  slug: "rocket-chat",
  name: "Rocket.Chat",
  category: "Team chat",
  platforms: [...platforms],
  versionContext:
    "Rocket.Chat web and desktop. One set of keys is listed, with no separate macOS keys.",
  sourceUrl: "https://docs.rocket.chat/docs/your-rocketchat-account",
  sourceLabel: "official Rocket.Chat keyboard shortcuts",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "global",
      title: "Global navigation",
      intro: "Open Rocket.Chat's shortcut help, search for a channel or user, and clear unread state from the main interface.",
      shortcuts: [
        shared("shortcut-help", "Show keyboard shortcuts", ["Shift", "?"]),
        {
          id: "search-channel-user",
          action: "Search for a channel or user",
          keys: [
            { platform: "windows", keys: ["Ctrl", "P"], alternatives: [["Ctrl", "K"]] },
            { platform: "linux", keys: ["Ctrl", "P"], alternatives: [["Ctrl", "K"]] },
            { platform: "macos", keys: ["Ctrl", "P"], alternatives: [["Ctrl", "K"]] },
          ],
        },
        shared("mark-all-read", "Mark all messages as read", ["Ctrl", "Escape"]),
      ],
    },
    {
      id: "composer",
      title: "Message composer",
      intro: "Move through composer history, reach its boundaries, and insert a line break while writing a Rocket.Chat message.",
      shortcuts: [
        shared("edit-previous-message", "Edit the previous message", ["Up Arrow"], "Meant for an empty message box. With text in the box, it can still open your last message, so use Alt+Up Arrow to reach the top."),
        shared("line-start", "Move to the beginning of the line", ["Alt", "Left Arrow"]),
        shared("line-end", "Move to the end of the line", ["Alt", "Right Arrow"]),
        shared("message-start", "Move to the beginning of the message", ["Alt", "Up Arrow"]),
        shared("message-end", "Move to the end of the message", ["Alt", "Down Arrow"]),
        shared("new-line", "Insert a new line without sending", ["Shift", "Enter"]),
      ],
    },
  ],
};

export default rocketChat;
