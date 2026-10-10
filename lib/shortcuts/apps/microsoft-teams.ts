import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut, ShortcutKey } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const pair = (id: string, action: string, windows: string[], macos: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows, macos }),
  ...(note ? { note } : {}),
});

const desktopWeb = (
  id: string,
  action: string,
  windows: string[],
  macos: string[],
  windowsWeb?: string[],
  macosWeb?: string[],
): Shortcut => {
  const keys: ShortcutKey[] = [
    {
      platform: "windows",
      keys: windows,
      ...(windowsWeb ? { alternatives: [windowsWeb] } : {}),
    },
    {
      platform: "macos",
      keys: macos,
      ...(macosWeb ? { alternatives: [macosWeb] } : {}),
    },
  ];
  return { id, action, keys };
};

export const microsoftTeams: AppShortcuts = {
  slug: "microsoft-teams",
  name: "Microsoft Teams",
  category: "Team chat",
  platforms: [...platforms],
  versionContext:
    "Current Microsoft Teams desktop and web shortcut tables checked September 1, 2026. Several commands have separate desktop and web forms, and Teams can reserve or customize shortcuts depending on the client and account.",
  sourceUrl: "https://support.microsoft.com/en-us/accessibility/teams/keyboard-shortcuts-for-microsoft-teams",
  sourceLabel: "official Microsoft Teams keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "navigation-and-search",
      title: "Navigation and search",
      intro: "Search Teams, open a chat or channel, filter results, and move focus through the application shell.",
      shortcuts: [
        pair("shortcut-help", "Open keyboard shortcut help", ["Ctrl", "."], ["Cmd", "."], "Alt+/ is also documented on Windows; Command+Period is the Mac desktop form."),
        desktopWeb("search", "Search Teams", ["Ctrl", "E"], ["Cmd", "E"], ["Ctrl", "Alt", "E"], ["Option", "Cmd", "E"]),
        pair("filter", "Filter the current view", ["Ctrl", "Shift", "F"], ["Cmd", "Shift", "F"]),
        desktopWeb("new-chat", "Start a new chat", ["Ctrl", "N"], ["Cmd", "N"], ["Alt", "N"], ["Ctrl", "Cmd", "N"]),
        pair("new-window", "Open a new Teams window", ["Ctrl", "Shift", "N"], ["Cmd", "Shift", "N"]),
        desktopWeb("settings", "Open Teams settings", ["Ctrl", ","], ["Cmd", ","], ["Ctrl", "Shift", ","], ["Cmd", "Shift", ","]),
        desktopWeb("help", "Open Teams help", ["F1"], ["F1"], ["Ctrl", "F1"], ["Cmd", "F1"]),
        pair("close", "Close the current dialog or menu", ["Esc"], ["Esc"]),
        pair("report", "Report a problem", ["Ctrl", "Alt", "Shift", "R"], ["Option", "Shift", "Cmd", "R"]),
        pair("specific-chat", "Go to a specific chat or channel", ["Ctrl", "G"], ["Cmd", "G"]),
        pair("focus-pane-divider", "Focus the pane divider", ["Ctrl", "Alt", "Enter"], ["Option", "Cmd", "Return"]),
        pair("default-pane-width", "Restore the default pane width", ["Ctrl", "Shift", "Enter"], ["Shift", "Cmd", "Return"]),
        pair("pin-top", "Pin the current item at the top", ["Ctrl", "Shift", "T"], ["Shift", "Cmd", "T"]),
        pair("open-conversation", "Open an existing conversation", ["Ctrl", "O"], ["Cmd", "O"]),
        pair("zoom-in", "Zoom in", ["Ctrl", "="], ["Cmd", "="]),
        pair("zoom-out", "Zoom out", ["Ctrl", "-"], ["Cmd", "-"]),
        pair("zoom-reset", "Reset zoom", ["Ctrl", "0"], ["Ctrl", "0"]),
      ],
    },
    {
      id: "messaging",
      title: "Messaging",
      intro: "Compose messages, send them, and keep a multiline message readable while you work.",
      shortcuts: [
        pair("send-message", "Send the current message", ["Ctrl", "Enter"], ["Cmd", "Enter"]),
        pair("new-line", "Insert a new line in a message", ["Shift", "Enter"], ["Shift", "Enter"]),
        pair("expand-compose", "Expand the compose box", ["Ctrl", "Shift", "X"], ["Cmd", "Shift", "X"]),
        pair("bold", "Bold selected text", ["Ctrl", "B"], ["Cmd", "B"]),
        pair("italic", "Italicize selected text", ["Ctrl", "I"], ["Cmd", "I"]),
        pair("underline", "Underline selected text", ["Ctrl", "U"], ["Cmd", "U"]),
        pair("attach-file", "Attach a file", ["Ctrl", "O"], ["Cmd", "O"], "The file picker command depends on the compose context."),
      ],
    },
    {
      id: "meetings",
      title: "Meetings and calls",
      intro: "Use the documented meeting controls while a Teams call or meeting has focus.",
      shortcuts: [
        pair("mute", "Mute or unmute the microphone", ["Ctrl", "Shift", "M"], ["Cmd", "Shift", "M"]),
        pair("camera", "Turn the camera on or off", ["Ctrl", "Shift", "O"], ["Cmd", "Shift", "O"]),
        pair("raise-hand", "Raise or lower your hand", ["Ctrl", "Shift", "K"], ["Cmd", "Shift", "K"]),
        pair("screen-share", "Start or stop screen sharing", ["Ctrl", "Shift", "E"], ["Cmd", "Shift", "E"]),
        pair("background", "Open background effects", ["Ctrl", "Shift", "P"], ["Cmd", "Shift", "P"]),
        pair("captions", "Turn live captions on or off", ["Ctrl", "Shift", "C"], ["Cmd", "Shift", "C"]),
      ],
    },
  ],
};

export default microsoftTeams;
