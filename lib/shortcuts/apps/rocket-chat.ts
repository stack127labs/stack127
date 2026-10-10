import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

const desktop = (id: string, action: string, windowsLinux: string[], macos: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: windowsLinux, linux: windowsLinux, macos }),
  ...(note ? { note } : {}),
});

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
    "Rocket.Chat account and release-note shortcut references checked September 1, 2026. Rocket.Chat says macOS uses Command and Option where Windows and Linux use Control and Alt; server settings, browser extensions, and custom keymaps can change the active bindings.",
  sourceUrl: "https://docs.rocket.chat/docs/your-rocketchat-account",
  sourceLabel: "official Rocket.Chat keyboard shortcuts",
  lastVerified: "2026-09-01",
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
            { platform: "macos", keys: ["Cmd", "P"], alternatives: [["Cmd", "K"]] },
          ],
        },
        desktop("mark-all-read", "Mark all messages as read", ["Ctrl", "Escape"], ["Cmd", "Escape"]),
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
            { platform: "macos", keys: ["Option", "Left Arrow"], alternatives: [["Option", "Up Arrow"]] },
          ],
        },
        {
          id: "composer-end",
          action: "Move to the end of the composer",
          keys: [
            { platform: "windows", keys: ["Alt", "Right Arrow"], alternatives: [["Alt", "Down Arrow"]] },
            { platform: "linux", keys: ["Alt", "Right Arrow"], alternatives: [["Alt", "Down Arrow"]] },
            { platform: "macos", keys: ["Option", "Right Arrow"], alternatives: [["Option", "Down Arrow"]] },
          ],
        },
        shared("new-line", "Insert a new line without sending", ["Shift", "Enter"]),
      ],
    },
  ],
};

export default rocketChat;
