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
    "Rocket.Chat keyboard shortcuts checked November 1, 2026. The current account guide publishes Ctrl and Alt notation for its Web/Desktop shortcuts without platform-specific variants; server settings and browser extensions can affect the active bindings.",
  sourceUrl: "https://docs.rocket.chat/docs/your-rocketchat-account",
  sourceLabel: "official Rocket.Chat keyboard shortcuts",
  lastVerified: "2026-11-01",
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
        shared("edit-previous-message", "Edit the previous message", ["Up Arrow"], "The composer must be empty; Up Arrow otherwise moves the cursor in the message."),
        {
          id: "composer-start",
          action: "Move to the beginning of the composer",
          keys: [
            { platform: "windows", keys: ["Alt", "Left Arrow"], alternatives: [["Alt", "Up Arrow"]] },
            { platform: "linux", keys: ["Alt", "Left Arrow"], alternatives: [["Alt", "Up Arrow"]] },
            { platform: "macos", keys: ["Alt", "Left Arrow"], alternatives: [["Alt", "Up Arrow"]] },
          ],
        },
        {
          id: "composer-end",
          action: "Move to the end of the composer",
          keys: [
            { platform: "windows", keys: ["Alt", "Right Arrow"], alternatives: [["Alt", "Down Arrow"]] },
            { platform: "linux", keys: ["Alt", "Right Arrow"], alternatives: [["Alt", "Down Arrow"]] },
            { platform: "macos", keys: ["Alt", "Right Arrow"], alternatives: [["Alt", "Down Arrow"]] },
          ],
        },
        shared("new-line", "Insert a new line without sending", ["Shift", "Enter"]),
      ],
    },
  ],
};

export default rocketChat;
