import type { AppShortcuts, Shortcut } from "../types.ts";

const windows = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: [{ platform: "windows", keys }],
  ...(note ? { note } : {}),
});

export const anydesk: AppShortcuts = {
  slug: "anydesk",
  name: "AnyDesk",
  category: "Remote desktop",
  platforms: ["windows"],
  intro:
    "AnyDesk reserves one Windows hotkey family for controlling an active remote session. Every command begins with Control+Alt+Shift, which keeps local session controls distinct from keystrokes sent to the remote device.",
  versionContext:
    "Current Windows hotkeys from AnyDesk's July 30, 2025 reference, checked August 31, 2026. Mouse capture requires AnyDesk 8 or later. Remote-system shortcuts and keyboard translation examples are not AnyDesk commands and are not listed.",
  sourceUrl: "https://support.anydesk.com/keyboard-hotkeys",
  sourceLabel: "AnyDesk keyboard and hotkeys",
  lastVerified: "2026-08-31",
  groups: [
    {
      id: "session-navigation",
      title: "Session navigation",
      intro: "Use these hotkeys while a session is active to move among remote displays or numbered AnyDesk tabs.",
      shortcuts: [
        windows("previous-display", "Switch to the previous remote display", ["Ctrl", "Alt", "Shift", "Left"]),
        windows("next-display", "Switch to the next remote display", ["Ctrl", "Alt", "Shift", "Right"]),
        windows("select-tab", "Select AnyDesk tab 1 through 9", ["Ctrl", "Alt", "Shift", "1-9"]),
      ],
    },
    {
      id: "session-controls",
      title: "Session controls",
      intro: "These commands change full screen, sound, input permission, capture behavior, or save a screenshot of the remote session.",
      shortcuts: [
        windows("full-screen", "Toggle full-screen mode", ["Ctrl", "Alt", "Shift", "Enter"]),
        windows("sound", "Toggle sound transmission", ["Ctrl", "Alt", "Shift", "S"]),
        windows("input-permission", "Toggle input permission", ["Ctrl", "Alt", "Shift", "I"]),
        windows("screenshot", "Save a screenshot", ["Ctrl", "Alt", "Shift", "P"]),
        windows("mouse-capture", "Toggle mouse capture mode", ["Ctrl", "Alt", "Shift", "Space"], "Available in AnyDesk 8 and later."),
        windows("send-secure-attention", "Send Control+Alt+Delete to the remote device", ["Ctrl", "Alt", "Shift", "Delete"]),
      ],
    },
    {
      id: "view-modes",
      title: "View modes",
      intro: "The three function-key hotkeys select AnyDesk's documented 1:1, shrink, and stretch display modes.",
      shortcuts: [
        windows("view-one-to-one", "Use 1:1 view mode", ["Ctrl", "Alt", "Shift", "F2"]),
        windows("view-shrink", "Use shrink view mode", ["Ctrl", "Alt", "Shift", "F3"]),
        windows("view-stretch", "Use stretch view mode", ["Ctrl", "Alt", "Shift", "F4"]),
      ],
    },
  ],
};

export default anydesk;
