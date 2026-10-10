import type { AppShortcuts, Shortcut, ShortcutKey } from "../types.ts";

const key = (platform: "windows" | "macos" | "linux", keys: string[], alternatives?: string[][]): ShortcutKey => ({ platform, keys, ...(alternatives ? { alternatives } : {}) });
const pair = (id: string, action: string, win: string[], mac: string[], winAlt?: string[][], macAlt?: string[][]): Shortcut => ({ id, action, keys: [key("windows", win, winAlt), key("macos", mac, macAlt), key("linux", win, winAlt)] });
const shared = (id: string, action: string, keys: string[], alternatives?: string[][]): Shortcut => pair(id, action, keys, keys, alternatives, alternatives);

export const discord: AppShortcuts = {
  slug: "discord",
  name: "Discord",
  category: "Communication",
  platforms: ["windows", "macos", "linux"],
  versionContext:
    "Current Discord commands, shortcuts, and navigation guide updated April 14, 2025 and checked October 10, 2026. The documented shortcuts apply to browser and desktop Discord, not the mobile app. The guide labels Windows and Mac bindings; Linux uses the Windows modifier column.",
  sourceUrl: "https://support.discord.com/hc/en-us/articles/31232432266647-Discord-Commands-Shortcuts-and-Navigation-Guide",
  sourceLabel: "Discord commands, shortcuts, and navigation guide",
  lastVerified: "2026-10-10",
  groups: [
    {
      id: "general",
      title: "General navigation",
      intro: "These commands open app controls or move backward in Discord navigation history.",
      shortcuts: [
        pair("settings", "Open User Settings", ["Ctrl", ","], ["Cmd", ","]),
        pair("shortcut-menu", "Open the Keyboard Shortcuts menu", ["Ctrl", "/"], ["Cmd", "/"]),
        pair("server-create-join", "Create or join a server", ["Ctrl", "Shift", "N"], ["Cmd", "Shift", "N"]),
        shared("back", "Navigate back", ["Alt", "Left"]),
      ],
    },
    {
      id: "search-and-pickers",
      title: "Search and pickers",
      intro: "Channel search stays within the active channel; global search spans every channel you can access.",
      shortcuts: [
        pair("channel-search", "Search the current channel", ["Ctrl", "F"], ["Cmd", "F"]),
        pair("global-search", "Search across all channels", ["Ctrl", "Shift", "F"], ["Cmd", "Shift", "F"]),
        pair("emoji", "Open the emoji picker", ["Ctrl", "E"], ["Cmd", "E"]),
        pair("gif", "Open the GIF picker", ["Ctrl", "G"], ["Cmd", "G"]),
      ],
    },
    {
      id: "messages",
      title: "Messages and channels",
      intro: "Up and Down alternatives move in opposite directions. The last-message edit shortcut differs more substantially between platforms.",
      shortcuts: [
        pair("history", "Browse channel history", ["Ctrl", "Up"], ["Cmd", "Up"], [["Ctrl", "Down"]], [["Cmd", "Down"]]),
        pair("edit-last", "Edit your last message", ["Shift", "Up"], ["Option", "Up"]),
        shared("cancel-read", "Cancel the current message or mark the channel read", ["Esc"]),
        pair("channels", "Move between channels", ["Alt", "Up"], ["Option", "Up"], [["Alt", "Down"]], [["Option", "Down"]]),
        pair("quick-switcher", "Open the channel and direct-message quick switcher", ["Ctrl", "K"], ["Cmd", "K"]),
      ],
    },
    {
      id: "voice-and-servers",
      title: "Voice and servers",
      intro: "Voice commands toggle the current microphone or audio state. Server cycling uses horizontal arrows on Windows and vertical arrows on Mac.",
      shortcuts: [
        pair("mute", "Mute or unmute the microphone", ["Ctrl", "Shift", "M"], ["Cmd", "Shift", "M"]),
        pair("deafen", "Deafen or undeafen audio", ["Ctrl", "Shift", "D"], ["Cmd", "Shift", "D"]),
        pair("servers", "Switch between servers", ["Ctrl", "Alt", "Right"], ["Cmd", "Option", "Up"], [["Ctrl", "Alt", "Left"]], [["Cmd", "Option", "Down"]]),
      ],
    },
    {
      id: "accessibility",
      title: "Keyboard and accessibility navigation",
      intro: "Tab and arrow commands follow the currently focused Discord surface. Enter or Space activates the focused control.",
      shortcuts: [
        shared("interactive", "Navigate interactive elements", ["Tab"]),
        pair("activate", "Activate the selected element", ["Enter"], ["Return"], [["Space"]], [["Space"]]),
        shared("menus", "Navigate messages and menus", ["Arrow keys"]),
        pair("pins", "Toggle the pins popout", ["Ctrl", "P"], ["Cmd", "P"]),
        pair("mentions", "Toggle the mentions popout", ["Ctrl", "Alt", "@"], ["Cmd", "Option", "@"]),
        pair("members", "Toggle the channel member list", ["Ctrl", "U"], ["Cmd", "U"]),
        pair("upload", "Upload a file", ["Ctrl", "Shift", "U"], ["Cmd", "Shift", "U"]),
        pair("help", "Get help", ["Ctrl", "Shift", "H"], ["Cmd", "Shift", "H"]),
      ],
    },
  ],
};

export default discord;
