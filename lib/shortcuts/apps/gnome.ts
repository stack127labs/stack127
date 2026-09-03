import type { AppShortcuts } from "../types.ts";

export const gnome: AppShortcuts = {
  slug: "gnome",
  name: "Linux GNOME",
  category: "Desktop environment",
  platforms: ["linux"],
  intro:
    "GNOME's Super-key shortcuts connect the desktop shell to the work inside its windows. This reference covers the current official shell defaults for Activities, windows, workspaces, monitors, notifications, screenshots, recording, and common text editing.",
  versionContext:
    "Defaults from the current GNOME Help keyboard-shortcuts page checked in August 2026. Window-manager and terminal shortcuts can vary when a distribution changes GNOME settings or when another desktop component claims the same key.",
  sourceUrl: "https://help.gnome.org/gnome-help/shell-keyboard-shortcuts.html",
  sourceLabel: "official GNOME Help keyboard shortcuts",
  lastVerified: "2026-08-26",
  groups: [
    {
      id: "shell-navigation",
      title: "Shell navigation",
      intro: "Use the Super key to reach Activities, switch windows, open applications, and move through the top bar and notifications.",
      shortcuts: [
        { id: "activities", action: "Show the Activities overview", keys: [{ platform: "linux", keys: ["Super"] }], note: "Start typing to search from the overview." },
        { id: "run-command", action: "Open the run-command prompt", keys: [{ platform: "linux", keys: ["Alt", "F2"] }] },
        { id: "switch-windows", action: "Switch between windows", keys: [{ platform: "linux", keys: ["Super", "Tab"] }], note: "Hold Shift to cycle in reverse." },
        { id: "switch-same-app", action: "Switch between windows of the same application", keys: [{ platform: "linux", keys: ["Super", "`"] }], note: "The key above Tab can replace the backtick on some keyboard layouts." },
        { id: "applications", action: "Show the applications overview", keys: [{ platform: "linux", keys: ["Super", "A"] }] },
        { id: "current-workspace-windows", action: "Cycle through windows on the current workspace", keys: [{ platform: "linux", keys: ["Alt", "Esc"] }] },
        { id: "top-bar", action: "Move keyboard focus to the top bar", keys: [{ platform: "linux", keys: ["Ctrl", "Alt", "Tab"] }] },
        { id: "notifications", action: "Show the notification list", keys: [{ platform: "linux", keys: ["Super", "V"] }], note: "Press again or press Esc to close it." },
      ],
    },
    {
      id: "workspaces-and-monitors",
      title: "Workspaces and monitors",
      intro: "Move between workspaces, send the current window with the move, and move a window to another monitor.",
      shortcuts: [
        { id: "workspace-left", action: "Switch to the workspace on the left", keys: [{ platform: "linux", keys: ["Super", "Page Up"] }] },
        { id: "workspace-right", action: "Switch to the workspace on the right", keys: [{ platform: "linux", keys: ["Super", "Page Down"] }] },
        { id: "move-workspace-left", action: "Move the current window to the workspace on the left", keys: [{ platform: "linux", keys: ["Shift", "Super", "Page Up"] }] },
        { id: "move-workspace-right", action: "Move the current window to the workspace on the right", keys: [{ platform: "linux", keys: ["Shift", "Super", "Page Down"] }] },
        { id: "move-monitor-left", action: "Move the current window to the monitor on the left", keys: [{ platform: "linux", keys: ["Shift", "Super", "Left"] }] },
        { id: "move-monitor-right", action: "Move the current window to the monitor on the right", keys: [{ platform: "linux", keys: ["Shift", "Super", "Right"] }] },
        { id: "move-monitor-up", action: "Move the current window to the monitor above", keys: [{ platform: "linux", keys: ["Shift", "Super", "Up"] }] },
        { id: "move-monitor-down", action: "Move the current window to the monitor below", keys: [{ platform: "linux", keys: ["Shift", "Super", "Down"] }] },
      ],
    },
    {
      id: "screenshots-and-recording",
      title: "Screenshots and recording",
      intro: "Capture the screen, a window, or an area, then start or stop a screencast with the shell's documented defaults.",
      shortcuts: [
        { id: "screenshot-tool", action: "Open the screenshot tool", keys: [{ platform: "linux", keys: ["Print"] }] },
        { id: "screenshot-window", action: "Take a screenshot of the current window", keys: [{ platform: "linux", keys: ["Alt", "Print"] }] },
        { id: "screenshot-screen", action: "Take a screenshot of the entire screen", keys: [{ platform: "linux", keys: ["Shift", "Print"] }] },
        { id: "screencast", action: "Start or stop a screencast", keys: [{ platform: "linux", keys: ["Ctrl", "Shift", "Alt", "R"] }] },
      ],
    },
    {
      id: "text-and-terminal",
      title: "Text and terminal editing",
      intro: "These common GNOME application and Terminal bindings cover clipboard work and undoing edits in fields that follow the standard conventions.",
      shortcuts: [
        { id: "select-all", action: "Select all text", keys: [{ platform: "linux", keys: ["Ctrl", "A"] }] },
        { id: "cut", action: "Cut the selection", keys: [{ platform: "linux", keys: ["Ctrl", "X"] }] },
        { id: "copy", action: "Copy the selection", keys: [{ platform: "linux", keys: ["Ctrl", "C"] }] },
        { id: "paste", action: "Paste the clipboard", keys: [{ platform: "linux", keys: ["Ctrl", "V"] }] },
        { id: "undo", action: "Undo the last edit", keys: [{ platform: "linux", keys: ["Ctrl", "Z"] }] },
        { id: "terminal-copy", action: "Copy selected text in GNOME Terminal", keys: [{ platform: "linux", keys: ["Ctrl", "Shift", "C"] }] },
        { id: "terminal-paste", action: "Paste into GNOME Terminal", keys: [{ platform: "linux", keys: ["Ctrl", "Shift", "V"] }] },
      ],
    },
    {
      id: "system",
      title: "System",
      intro: "Lock the screen or open the system power dialog from the GNOME shell without opening the Settings app.",
      shortcuts: [
        { id: "lock-screen", action: "Lock the screen", keys: [{ platform: "linux", keys: ["Super", "L"] }] },
        { id: "power-dialog", action: "Open the power-off dialog", keys: [{ platform: "linux", keys: ["Ctrl", "Alt", "Delete"] }] },
      ],
    },
  ],
};

export default gnome;
