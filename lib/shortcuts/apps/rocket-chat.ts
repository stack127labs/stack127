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
  intro:
    "Rocket.Chat's documented defaults cover global search, read-state management, and the message composer. This reference keeps the composer-specific keys separate because they only apply while the empty or active composer has focus.",
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
        desktop("search-channel-user", "Search for a channel or user", ["Ctrl", "P"], ["Cmd", "P"]),
        desktop("search-channel-user-alternative", "Search for a channel or user", ["Ctrl", "K"], ["Cmd", "K"], "Rocket.Chat documents Ctrl/Cmd+K as an additional search binding."),
        desktop("mark-all-read", "Mark all messages as read", ["Ctrl", "Escape"], ["Cmd", "Escape"]),
      ],
    },
    {
      id: "composer",
      title: "Message composer",
      intro: "Move through composer history, reach its boundaries, and insert a line break while writing a Rocket.Chat message.",
      shortcuts: [
        shared("edit-previous-message", "Edit the previous message", ["Up Arrow"], "The composer must be empty; Up Arrow otherwise moves the cursor in the message."),
        desktop("composer-start", "Move to the beginning of the composer", ["Alt", "Left Arrow"], ["Option", "Left Arrow"]),
        desktop("composer-start-alt", "Move to the beginning of the composer", ["Alt", "Up Arrow"], ["Option", "Up Arrow"]),
        desktop("composer-end", "Move to the end of the composer", ["Alt", "Right Arrow"], ["Option", "Right Arrow"]),
        desktop("composer-end-alt", "Move to the end of the composer", ["Alt", "Down Arrow"], ["Option", "Down Arrow"]),
        shared("new-line", "Insert a new line without sending", ["Shift", "Enter"]),
      ],
    },
  ],
};

export default rocketChat;
