import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

const shared = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: combo(platforms, keys),
  ...(note ? { note } : {}),
});

const desktop = (id: string, action: string, windowsLinux: string[], macos: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: windowsLinux, linux: windowsLinux, macos }),
  ...(note ? { note } : {}),
});

export const mattermost: AppShortcuts = {
  slug: "mattermost",
  name: "Mattermost",
  category: "Team chat",
  platforms: [...platforms],
  intro:
    "Mattermost shortcuts cover channel navigation, search, message editing, formatting, file uploads, calls, and desktop tab management.",
  versionContext:
    "Current Mattermost keyboard shortcuts checked September 1, 2026. The official table covers Windows, Linux, and macOS. Some call controls depend on Mattermost Calls being enabled, and desktop tab commands apply to the Mattermost desktop app.",
  sourceUrl: "https://docs.mattermost.com/end-user-guide/collaborate/keyboard-shortcuts.html",
  sourceLabel: "official Mattermost keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "channels-and-search",
      title: "Channels and search",
      intro: "Move between channels, search the current channel, and open channel details or preferences.",
      shortcuts: [
        desktop("previous-channel", "Go to the previous channel", ["Alt", "Up"], ["Option", "Up"]),
        desktop("next-channel", "Go to the next channel", ["Alt", "Down"], ["Option", "Down"]),
        desktop("previous-unread-channel", "Go to the previous unread channel", ["Alt", "Shift", "Up"], ["Option", "Shift", "Up"]),
        desktop("next-unread-channel", "Go to the next unread channel", ["Alt", "Shift", "Down"], ["Option", "Shift", "Down"]),
        desktop("find-channels", "Find channels or open a selected link", ["Ctrl", "K"], ["Cmd", "K"]),
        desktop("find-direct-messages", "Find direct messages", ["Ctrl", "Shift", "K"], ["Cmd", "Shift", "K"]),
        desktop("channel-settings", "Open channel settings", ["Ctrl", "Shift", "A"], ["Cmd", "Shift", "A"]),
        desktop("mentions", "Open mentions", ["Ctrl", "Shift", "M"], ["Cmd", "Shift", "M"]),
        desktop("focus-message-input", "Focus the message input", ["Ctrl", "Shift", "L"], ["Cmd", "Shift", "L"]),
        desktop("toggle-right-sidebar", "Toggle the right sidebar", ["Ctrl", "."], ["Cmd", "."]),
        desktop("resize-right-sidebar", "Resize the right sidebar", ["Ctrl", "Shift", "."], ["Cmd", "Shift", "."]),
        desktop("search-channel", "Search the current channel", ["Ctrl", "Shift", "F"], ["Cmd", "Shift", "F"]),
        desktop("unread-channels", "Open unread channels or search", ["Ctrl", "Shift", "U"], ["Cmd", "Shift", "U"]),
        desktop("channel-info", "Open channel information", ["Ctrl", "Shift", "I"], ["Cmd", "Shift", "I"]),
      ],
    },
    {
      id: "messages",
      title: "Messages and formatting",
      intro: "Move through message history, reply, edit, react, and add formatting while composing a message.",
      shortcuts: [
        desktop("upload-file", "Upload a file", ["Ctrl", "U"], ["Cmd", "U"]),
        desktop("previous-message", "Move through message history upward", ["Ctrl", "Up"], ["Cmd", "Up"]),
        desktop("next-message", "Move through message history downward", ["Ctrl", "Down"], ["Cmd", "Down"]),
        shared("reply-message", "Reply to the selected message", ["Shift", "Up"]),
        shared("edit-last-message", "Edit your last message", ["Up"]),
        desktop("react-message", "Open the reaction picker", ["Ctrl", "Shift", "\\"], ["Cmd", "Shift", "\\"]),
        desktop("bold", "Bold selected text", ["Ctrl", "B"], ["Cmd", "B"]),
        desktop("italic", "Italicize selected text", ["Ctrl", "I"], ["Cmd", "I"]),
        desktop("link", "Insert a link", ["Ctrl", "Alt", "K"], ["Cmd", "Option", "K"]),
        shared("new-line", "Insert a new line in a message", ["Shift", "Enter"]),
        desktop("back", "Go back in navigation history", ["Alt", "Left"], ["Cmd", "["]),
        desktop("forward", "Go forward in navigation history", ["Alt", "Right"], ["Cmd", "]"]),
        shared("select-up", "Extend a text selection upward", ["Shift", "Up"]),
        shared("select-down", "Extend a text selection downward", ["Shift", "Down"]),
      ],
    },
    {
      id: "calls",
      title: "Calls",
      intro: "Use these controls during a Mattermost Call when the Calls plugin is available in the server and channel.",
      shortcuts: [
        desktop("join-call", "Join or leave a call", ["Ctrl", "Alt", "S"], ["Cmd", "Option", "S"]),
        desktop("toggle-mute", "Mute or unmute yourself", ["Ctrl", "Shift", "Space"], ["Cmd", "Shift", "Space"]),
        desktop("raise-hand", "Raise or lower your hand", ["Ctrl", "Shift", "Y"], ["Cmd", "Shift", "Y"]),
        desktop("screen-share", "Start or stop screen sharing", ["Ctrl", "Shift", "E"], ["Cmd", "Shift", "E"]),
        desktop("participants", "Open the participants list", ["Alt", "P"], ["Option", "P"], "Ctrl+Shift+P is also documented for Windows and Linux."),
        desktop("leave-call", "Leave the call", ["Ctrl", "Shift", "L"], ["Cmd", "Shift", "L"]),
        shared("push-to-talk", "Temporarily unmute while held", ["Space"]),
      ],
    },
    {
      id: "desktop-app",
      title: "Desktop app tabs",
      intro: "These commands are for the Mattermost desktop app rather than the browser interface.",
      shortcuts: [
        desktop("new-window", "Open a new Mattermost window", ["Ctrl", "N"], ["Cmd", "N"]),
        desktop("new-tab", "Open a new tab", ["Ctrl", "T"], ["Cmd", "T"]),
        desktop("next-tab", "Switch to the next tab", ["Ctrl", "Tab"], ["Cmd", "Option", "Right"]),
        desktop("previous-tab", "Switch to the previous tab", ["Ctrl", "Shift", "Tab"], ["Cmd", "Option", "Left"]),
        desktop("tab-1", "Switch to tab 1", ["Ctrl", "1"], ["Cmd", "1"]),
        desktop("tab-2", "Switch to tab 2", ["Ctrl", "2"], ["Cmd", "2"]),
        desktop("tab-3", "Switch to tab 3", ["Ctrl", "3"], ["Cmd", "3"]),
        desktop("tab-4", "Switch to tab 4", ["Ctrl", "4"], ["Cmd", "4"]),
        desktop("tab-5", "Switch to tab 5", ["Ctrl", "5"], ["Cmd", "5"]),
        desktop("tab-6", "Switch to tab 6", ["Ctrl", "6"], ["Cmd", "6"]),
        desktop("tab-7", "Switch to tab 7", ["Ctrl", "7"], ["Cmd", "7"]),
        desktop("tab-8", "Switch to tab 8", ["Ctrl", "8"], ["Cmd", "8"]),
        desktop("tab-9", "Switch to tab 9", ["Ctrl", "9"], ["Cmd", "9"]),
        desktop("close-tab", "Close the current tab", ["Ctrl", "W"], ["Cmd", "W"]),
        desktop("close-main-window", "Close the main Mattermost window", ["Ctrl", "Shift", "W"], ["Cmd", "Shift", "W"]),
        desktop("zoom-in", "Zoom in", ["Ctrl", "Shift", "+"], ["Cmd", "Shift", "+"]),
        desktop("zoom-out", "Zoom out", ["Ctrl", "Shift", "-"], ["Cmd", "Shift", "-"]),
      ],
    },
  ],
};

export default mattermost;
