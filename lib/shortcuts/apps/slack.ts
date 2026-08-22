import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const slack: AppShortcuts = {
  slug: "slack",
  name: "Slack",
  category: "Team chat",
  platforms: [...platforms],
  intro:
    "Slack shortcuts are most useful when the conversation is moving quickly. Switch channels, act on messages, start or leave huddles, and reach workspace controls without leaving the keyboard.",
  versionContext:
    "Documented defaults from Slack Help in August 2026. macOS uses Cmd where Windows and Linux use Ctrl.",
  sourceUrl: "https://slack.com/help/articles/201374536-Slack-keyboard-shortcuts",
  sourceLabel: "official Slack keyboard shortcuts",
  lastVerified: "2026-08-21",
  groups: [
    {
      id: "navigation",
      title: "Navigation",
      intro: "Alt+Up and Alt+Down move between channels and DMs on Windows and Linux; macOS uses Option with them.",
      shortcuts: [
        {
          id: "previous-channel",
          action: "Previous channel or DM",
          keys: combo(platforms, ["Alt", "Up"], ["Option", "Up"]),
        },
        {
          id: "next-channel",
          action: "Next channel or DM",
          keys: combo(platforms, ["Alt", "Down"], ["Option", "Down"]),
        },
        {
          id: "next-unread",
          action: "Next unread channel or DM",
          keys: perPlatformNextUnread(),
        },
        {
          id: "previous-viewed",
          action: "Previous channel in your history",
          keys: combo(platforms, ["Alt", "Left"], ["Cmd", "["]),
        },
        {
          id: "search",
          action: "Open search",
          keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]),
        },
        {
          id: "quick-switcher",
          action: "Open the quick switcher",
          keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]),
          note: "Ctrl+T (Cmd+T) opens it too.",
        },
        {
          id: "new-message",
          action: "Start a new message",
          keys: combo(platforms, ["Ctrl", "N"], ["Cmd", "N"]),
        },
      ],
    },
    {
      id: "messages",
      title: "Messages",
      intro: "Act on the selected message, open a thread, add a reaction, and format a reply.",
      shortcuts: [
        {
          id: "edit-last-message",
          action: "Edit your last message in the current channel",
          keys: combo(platforms, ["Ctrl", "Up"], ["Cmd", "Up"]),
        },
        {
          id: "mark-read",
          action: "Mark everything in the current view as read",
          keys: combo(platforms, ["Esc"]),
        },
        {
          id: "mark-all-read",
          action: "Mark every message as read",
          keys: combo(platforms, ["Shift", "Esc"]),
        },
        {
          id: "react-with-emoji",
          action: "Add a reaction to the selected message",
          keys: combo(platforms, ["Ctrl", "Shift", "\\" ], ["Cmd", "Shift", "\\"]),
        },
        {
          id: "formatting",
          action: "Show the message formatting toolbar",
          keys: combo(platforms, ["Ctrl", "Shift", "F"], ["Cmd", "Shift", "F"]),
        },
      ],
    },
    {
      id: "calls-and-huddles",
      title: "Calls and huddles",
      intro: "Start, join, mute, leave, or manage a huddle while keeping the conversation open.",
      shortcuts: [
        {
          id: "toggle-mute",
          action: "Toggle mute on a call or huddle",
          keys: combo(platforms, ["Ctrl", "Shift", "Space"], ["Cmd", "Shift", "Space"]),
        },
        {
          id: "toggle-video",
          action: "Toggle video on a call",
          keys: combo(platforms, ["Ctrl", "Shift", "V"], ["Cmd", "Shift", "V"]),
        },
        {
          id: "raise-hand",
          action: "Raise or lower your hand",
          keys: combo(platforms, ["Ctrl", "Shift", "R"], ["Cmd", "Shift", "R"]),
        },
      ],
    },
    {
      id: "workspace",
      title: "Workspace",
      intro: "Open search, preferences, help, and workspace-level controls from the keyboard.",
      shortcuts: [
        {
          id: "shortcuts-list",
          action: "Open the keyboard shortcuts list",
          keys: combo(platforms, ["Ctrl", "/"], ["Cmd", "/"]),
        },
        {
          id: "preferences",
          action: "Open preferences",
          keys: combo(platforms, ["Ctrl", ","], ["Cmd", ","]),
        },
        {
          id: "toggle-sidebar",
          action: "Toggle the sidebar",
          keys: combo(platforms, ["Ctrl", "Shift", "D"], ["Cmd", "Shift", "D"]),
        },
      ],
    },
  ],
};

function perPlatformNextUnread() {
  return [
    { platform: "windows" as const, keys: ["Alt", "Shift", "Down"] },
    { platform: "macos" as const, keys: ["Option", "Shift", "Down"] },
    { platform: "linux" as const, keys: ["Alt", "Shift", "Down"] },
  ];
}
